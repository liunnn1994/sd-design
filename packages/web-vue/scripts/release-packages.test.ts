import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { type TestContext } from 'node:test';
import { fileURLToPath } from 'node:url';

import releaseConfig from '../release.config.ts';

async function fixture(t: TestContext) {
  const root = await mkdtemp(path.join(tmpdir(), 'sd-foundation-release-'));
  assert.equal(path.dirname(root), path.resolve(tmpdir()));
  assert.ok(path.basename(root).startsWith('sd-foundation-release-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const script = path.join(root, 'packages/web-vue/scripts/prepare-release-package.ts');
  await mkdir(path.dirname(script), { recursive: true });
  await mkdir(path.join(root, 'packages/web-core'), { recursive: true });
  await copyFile(new URL('./prepare-release-package.ts', import.meta.url), script);
  const vue = {
    name: '@sdata/web-vue',
    version: '7.3.2',
    type: 'module',
    dependencies: { '@sdata/web-core': 'workspace:^' },
    marker: 'preserve-vue',
  };
  const core = {
    name: '@sdata/web-core',
    version: '7.3.2',
    type: 'module',
    marker: 'preserve-core',
  };
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  await writeFile(path.join(root, 'packages/web-vue/package.json'), JSON.stringify(vue));
  await writeFile(path.join(root, 'packages/web-core/package.json'), JSON.stringify(core));
  return { root, script, vue, core };
}

test('release preparation synchronizes Core and Vue without changing workspace dependency semantics', async (t) => {
  const { root, script, vue, core } = await fixture(t);
  execFileSync(process.execPath, [script, '7.4.0'], { cwd: root });
  assert.deepEqual(
    JSON.parse(await readFile(path.join(root, 'packages/web-vue/package.json'), 'utf8')),
    { ...vue, version: '7.4.0' },
  );
  assert.deepEqual(
    JSON.parse(await readFile(path.join(root, 'packages/web-core/package.json'), 'utf8')),
    { ...core, version: '7.4.0' },
  );
});

test('an invalid Core link fails before either manifest is rewritten', async (t) => {
  const { root, script, vue, core } = await fixture(t);
  vue.dependencies['@sdata/web-core'] = '^7.3.2';
  await writeFile(path.join(root, 'packages/web-vue/package.json'), JSON.stringify(vue));
  const result = spawnSync(process.execPath, [script, '7.4.0'], { cwd: root, encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.deepEqual(
    JSON.parse(await readFile(path.join(root, 'packages/web-vue/package.json'), 'utf8')),
    vue,
  );
  assert.deepEqual(
    JSON.parse(await readFile(path.join(root, 'packages/web-core/package.json'), 'utf8')),
    core,
  );
});

test('release Git assets include both modified manifests when semantic-release runs from the repository root', async (t) => {
  const { root, script } = await fixture(t);
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync(process.execPath, [script, '7.4.0'], { cwd: root });
  const modified = execFileSync('git', ['ls-files', '-m', '-o'], { cwd: root, encoding: 'utf8' })
    .trim()
    .split(/\r?\n/);
  const gitPlugin = releaseConfig.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === '@semantic-release/git',
  );
  assert.ok(Array.isArray(gitPlugin));
  const options = gitPlugin[1];
  assert.ok(typeof options === 'object' && options !== null && 'assets' in options);
  const assets = new Set<string>(options.assets);
  assert.deepEqual(modified.filter((file) => assets.has(file)).sort(), [
    'packages/web-core/package.json',
    'packages/web-vue/package.json',
  ]);
});

test('the installed semantic-release loader resolves the root invocation and package-local plugins', async () => {
  const loaderUrl = new URL('../node_modules/semantic-release/lib/get-config.js', import.meta.url);
  const { default: getConfig } = await import(loaderUrl.href);
  const { options, plugins } = await getConfig(
    {
      cwd: fileURLToPath(new URL('../../../', import.meta.url)),
      env: process.env,
      logger: { log() {}, success() {}, error() {} },
    },
    { extends: './packages/web-vue/release.config.ts' },
  );
  assert.equal(options.tagFormat, 'web-vue-v${version}');
  assert.equal(typeof plugins.prepare, 'function');
  assert.equal(typeof plugins.publish, 'function');
});
