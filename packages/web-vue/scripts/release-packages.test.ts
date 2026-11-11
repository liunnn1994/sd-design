import { stringifyYAML } from 'confbox/yaml';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFile, glob, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test, { type TestContext } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import semanticRelease from 'semantic-release';

import { bootstrapCoreRelease } from './bootstrap-core-release.ts';
import { createReleaseConfig, releasePackages } from './release-config.ts';

test('all publishable workspace packages declare the repository required by npm provenance', async (t) => {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  let publishedPackages = 0;
  for await (const packagePath of glob('packages/*/package.json', { cwd: root })) {
    const manifest = JSON.parse(await readFile(path.join(root, packagePath), 'utf8'));
    if (manifest.private === true) continue;
    publishedPackages++;
    await t.test(manifest.name, () => {
      assert.equal(manifest.repository?.type, 'git', `${manifest.name}: repository.type`);
      assert.equal(manifest.repository?.url, 'git+https://github.com/liunnn1994/sd-design.git');
    });
  }
  assert.ok(publishedPackages > 0);
});

async function fixture(t: TestContext) {
  const root = await mkdtemp(path.join(tmpdir(), 'sd-independent-release-'));
  assert.equal(path.dirname(root), path.resolve(tmpdir()));
  assert.ok(path.basename(root).startsWith('sd-independent-release-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  git('init', '--quiet', '--initial-branch=main');
  git('config', 'user.email', 'release-test@example.test');
  git('config', 'user.name', 'Release Test');
  git('config', 'core.hooksPath', '/dev/null');
  const versions = { 'web-core': '7.3.2', 'web-vue': '8.1.0', 'web-react': '2.4.0' };
  for (const name of releasePackages) {
    await mkdir(path.join(root, 'packages', name), { recursive: true });
    await writeFile(
      path.join(root, 'packages', name, 'package.json'),
      JSON.stringify({
        name: `@sdata/${name}`,
        version: versions[name],
        type: 'module',
        ...(name === 'web-core'
          ? { dependencies: { 'es-toolkit': 'catalog:' } }
          : {
              dependencies: {
                '@sdata/web-core': name === 'web-vue' ? 'workspace:^' : 'workspace:*',
                ...(name === 'web-vue' ? { vue: 'catalog:' } : { react: 'catalog:react' }),
              },
            }),
      }),
    );
  }
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  await mkdir(path.join(root, 'packages/web-vue/scripts'), { recursive: true });
  const script = path.join(root, 'packages/web-vue/scripts/prepare-release-package.ts');
  await copyFile(new URL('./prepare-release-package.ts', import.meta.url), script);
  const workspace = {
    catalog: { 'vue': '^3.5.0', 'es-toolkit': '^1.0.0', 'astro': '^5.0.0' },
    catalogs: { react: { react: '^19.0.0' } },
  };
  const lock = {
    lockfileVersion: '9.0',
    importers: {
      'packages/web-core': {
        dependencies: { 'es-toolkit': { specifier: 'catalog:', version: '1.0.0' } },
      },
      'packages/web-vue': { dependencies: { vue: { specifier: 'catalog:', version: '3.5.0' } } },
      'packages/web-react': {
        dependencies: { react: { specifier: 'catalog:react', version: '19.0.0' } },
      },
      'packages/sd-vue-docs': {
        dependencies: { astro: { specifier: 'catalog:', version: '5.0.0' } },
      },
    },
    snapshots: {
      'es-toolkit@1.0.0': { dependencies: { transitive: '1.0.0' } },
      'transitive@1.0.0': {},
      'vue@3.5.0': {},
      'react@19.0.0': {},
      'astro@5.0.0': {},
    },
  };
  await writeFile(path.join(root, 'pnpm-workspace.yaml'), stringifyYAML(workspace));
  await writeFile(path.join(root, 'pnpm-lock.yaml'), stringifyYAML(lock));
  git('add', '.');
  git('commit', '--quiet', '-m', 'chore: initial fixture');
  for (const name of releasePackages) git('tag', `${name}-v${versions[name]}`);
  const remote = path.join(root, 'remote.git');
  git('init', '--bare', '--quiet', '--initial-branch=main', remote);
  git('remote', 'add', 'origin', pathToFileURL(remote).href);
  git('push', '--quiet', '--set-upstream', 'origin', 'main', '--tags');
  return {
    root,
    git,
    script,
    versions,
    workspace,
    lock,
    manifest: async (name: string) =>
      JSON.parse(await readFile(path.join(root, 'packages', name, 'package.json'), 'utf8')),
    commit: async (file: string, message: string) => {
      await mkdir(path.dirname(path.join(root, file)), { recursive: true });
      await writeFile(path.join(root, file), message);
      git('add', file);
      git('commit', '--quiet', '-m', message);
      git('push', '--quiet', 'origin', 'main');
    },
  };
}

for (const scenario of [
  { dependency: 'vue', file: 'pnpm-workspace.yaml', expected: [null, '8.1.1', null] },
  { dependency: 'es-toolkit', file: 'pnpm-workspace.yaml', expected: ['7.3.3', '8.1.1', '2.4.1'] },
  { dependency: 'react', file: 'pnpm-workspace.yaml', expected: [null, null, '2.4.1'] },
  { dependency: 'astro', file: 'pnpm-workspace.yaml', expected: [null, null, null] },
  { dependency: 'vue', file: 'pnpm-lock.yaml', expected: [null, '8.1.1', null] },
  { dependency: 'transitive', file: 'pnpm-lock.yaml', expected: ['7.3.3', '8.1.1', '2.4.1'] },
  { dependency: 'astro', file: 'pnpm-lock.yaml', expected: [null, null, null] },
]) {
  test(`shared dependency dry-run: ${scenario.dependency} in ${scenario.file}`, async (t) => {
    const { root, git, workspace, lock } = await fixture(t);
    if (scenario.file === 'pnpm-workspace.yaml') {
      if (scenario.dependency === 'react') workspace.catalogs.react.react = '^19.1.0';
      else workspace.catalog[scenario.dependency as keyof typeof workspace.catalog] = '^9.0.0';
      await writeFile(path.join(root, scenario.file), stringifyYAML(workspace));
    } else {
      if (scenario.dependency === 'transitive') {
        lock.snapshots['es-toolkit@1.0.0'].dependencies.transitive = '1.1.0';
      } else if (scenario.dependency === 'vue') {
        lock.importers['packages/web-vue'].dependencies.vue.version = '3.5.1';
      } else {
        lock.importers['packages/sd-vue-docs'].dependencies.astro.version = '5.1.0';
      }
      await writeFile(path.join(root, scenario.file), stringifyYAML(lock));
    }
    git('add', scenario.file);
    git('commit', '--quiet', '-m', `fix(deps): update ${scenario.dependency}`);
    git('push', '--quiet', 'origin', 'main');
    for (const [i, name] of releasePackages.entries()) {
      const config = createReleaseConfig(name);
      const result = await semanticRelease(
        {
          ...config,
          plugins: config.plugins.filter(
            ([entry]) => !/[\\/]github[\\/]index.js$/.test(String(entry)),
          ),
          repositoryUrl: pathToFileURL(path.join(root, 'remote.git')).href,
          dryRun: true,
          ci: false,
        },
        { cwd: root },
      );
      assert.equal((result && result.nextRelease?.version) || null, scenario.expected[i]);
      if (result && result.nextRelease)
        assert.ok(result.nextRelease.notes?.includes(`update ${scenario.dependency}`));
    }
  });
}

test('prepare changes only the selected package and preserves both Core dependency protocols', async (t) => {
  const { root, script, manifest } = await fixture(t);
  for (const name of releasePackages) {
    const before = await Promise.all(releasePackages.map(manifest));
    execFileSync(process.execPath, [script, name, '9.2.1'], { cwd: root });
    for (const [i, other] of releasePackages.entries()) {
      assert.deepEqual(
        await manifest(other),
        other === name ? { ...before[i], version: '9.2.1' } : before[i],
      );
    }
  }
});

test('invalid package or Core dependency fails without rewriting manifests', async (t) => {
  const { root, script, manifest } = await fixture(t);
  const vue = await manifest('web-vue');
  vue.dependencies['@sdata/web-core'] = '^7.3.2';
  await writeFile(path.join(root, 'packages/web-vue/package.json'), JSON.stringify(vue));
  const before = await Promise.all(releasePackages.map(manifest));
  for (const name of ['web-vue', '../web-core']) {
    assert.notEqual(spawnSync(process.execPath, [script, name, '9.2.1'], { cwd: root }).status, 0);
  }
  assert.deepEqual(await Promise.all(releasePackages.map(manifest)), before);
});

test('Core migration inherits the actual coordinated release once, without tagging HEAD', async (t) => {
  const { root, git, commit } = await fixture(t);
  git('tag', '-d', 'web-core-v7.3.2', 'web-vue-v8.1.0');
  git('tag', 'web-vue-v7.3.2');
  const baseline = git('rev-parse', 'HEAD');
  await commit('packages/web-core/change.ts', 'fix: Core after coordinated release');
  bootstrapCoreRelease(root);
  assert.equal(git('rev-parse', 'web-core-v7.3.2'), baseline);
  bootstrapCoreRelease(root);
  assert.equal(git('tag', '--list', 'web-core-v*'), 'web-core-v7.3.2');
});

test('Core migration rejects a mismatched historical manifest', async (t) => {
  const { root, git } = await fixture(t);
  git('tag', '-d', 'web-core-v7.3.2');
  assert.throws(() => bootstrapCoreRelease(root), /does not match/);
  assert.equal(git('tag', '--list', 'web-core-v*'), '');
});

test('all package configs load with the real semantic-release loader and isolate Git assets', async () => {
  const loaderUrl = new URL('../node_modules/semantic-release/lib/get-config.js', import.meta.url);
  const { default: getConfig } = await import(loaderUrl.href);
  const cwd = fileURLToPath(new URL('../../../', import.meta.url));
  for (const name of releasePackages) {
    const { options, plugins } = await getConfig(
      { cwd, env: process.env, logger: { log() {}, success() {}, error() {} } },
      { extends: `./packages/${name}/release.config.ts` },
    );
    assert.equal(options.tagFormat, `${name}-v\${version}`);
    assert.equal(typeof plugins.publish, 'function');
    const gitPlugin = options.plugins.find(([entry]: [string]) =>
      /[\\/]git[\\/]index.js$/.test(entry),
    );
    assert.deepEqual(gitPlugin[1].assets, [
      `packages/${name}/CHANGELOG.md`,
      `packages/${name}/package.json`,
    ]);
  }
  const { options } = await getConfig(
    {
      cwd: path.join(cwd, 'packages/sd-mcp'),
      env: process.env,
      logger: { log() {}, success() {}, error() {} },
    },
    {},
  );
  assert.equal(options.tagFormat, 'mcp-v${version}');
});

for (const scenario of [
  { file: 'packages/web-vue/change.ts', message: 'fix: Vue only', expected: [null, '8.1.1', null] },
  {
    file: 'packages/web-react/change.ts',
    message: 'feat: React only',
    expected: [null, null, '2.5.0'],
  },
  {
    file: 'packages/web-core/change.ts',
    message: 'fix: Core shared',
    expected: ['7.3.3', '8.1.1', '2.4.1'],
  },
  {
    file: 'packages/web-core/change.ts',
    message: 'feat: Core feature',
    expected: ['7.4.0', '8.2.0', '2.5.0'],
  },
  {
    file: 'packages/web-core/change.ts',
    message: 'feat: Core breaking\n\nBREAKING CHANGE: removed API',
    expected: ['8.0.0', '9.0.0', '3.0.0'],
  },
  {
    file: 'packages/sd-vue-docs/change.md',
    message: 'feat: unrelated docs',
    expected: [null, null, null],
  },
]) {
  test(`real semantic-release dry-run: ${scenario.message.split('\n')[0]}`, async (t) => {
    const { root, git, commit } = await fixture(t);
    await commit(
      'packages/sd-mcp/unrelated.ts',
      'feat: unrelated MCP feature\n\nBREAKING CHANGE: MCP only',
    );
    await commit(scenario.file, scenario.message);
    const before = git('status', '--porcelain');
    const tags = git('tag');
    const remote = git('ls-remote', 'origin');
    for (const [i, name] of releasePackages.entries()) {
      const config = createReleaseConfig(name);
      const result = await semanticRelease(
        {
          ...config,
          // Only GitHub authentication is omitted; all version/notes/prepare/publish plugins are real.
          plugins: config.plugins.filter(
            ([entry]) => !/[\\/]github[\\/]index.js$/.test(String(entry)),
          ),
          repositoryUrl: pathToFileURL(path.join(root, 'remote.git')).href,
          dryRun: true,
          ci: false,
        },
        { cwd: root },
      );
      assert.equal((result && result.nextRelease?.version) || null, scenario.expected[i]);
      if (result && result.nextRelease) {
        assert.ok(
          result.nextRelease.notes?.includes(scenario.message.split('\n')[0].replace(/^\w+: /, '')),
        );
        assert.ok(!result.nextRelease.notes?.includes('unrelated MCP'));
      }
    }
    assert.equal(git('status', '--porcelain'), before);
    assert.equal(git('tag'), tags);
    assert.equal(git('ls-remote', 'origin'), remote);
  });
}

test('React without a stable release tag starts at 1.0.0', async (t) => {
  const { root, git, commit } = await fixture(t);
  git('tag', '-d', 'web-react-v2.4.0');
  git('push', '--quiet', 'origin', ':refs/tags/web-react-v2.4.0');
  await commit('packages/web-react/first.ts', 'feat: first React release');
  const config = createReleaseConfig('web-react');
  const result = await semanticRelease(
    {
      ...config,
      plugins: config.plugins.filter(([entry]) => !/[\\/]github[\\/]index.js$/.test(String(entry))),
      repositoryUrl: pathToFileURL(path.join(root, 'remote.git')).href,
      dryRun: true,
      ci: false,
    },
    { cwd: root },
  );
  assert.ok(result && result.nextRelease);
  assert.equal(result.nextRelease.version, '1.0.0');
});

test('local release prepares and commits Core before adapters, then leaves siblings unchanged on a Vue release', async (t) => {
  const { root, git, commit, manifest } = await fixture(t);
  const run = async () => {
    const versions = [];
    for (const name of releasePackages) {
      const config = createReleaseConfig(name);
      const result = await semanticRelease(
        {
          ...config,
          plugins: config.plugins
            .filter(([entry]) => !/[\\/]github[\\/]index.js$/.test(String(entry)))
            .map(
              ([entry, options]) =>
                [
                  entry,
                  {
                    ...options,
                    // Exercise real prepare/git/tag steps against the fixture; never contact npm.
                    ...(/[\\/]exec[\\/]index.js$/.test(String(entry))
                      ? { publishCmd: 'node --version' }
                      : {}),
                  },
                ] as [string, Record<string, unknown>],
            ),
          repositoryUrl: pathToFileURL(path.join(root, 'remote.git')).href,
          ci: false,
        },
        { cwd: root },
      );
      versions.push((result && result.nextRelease?.version) || null);
    }
    return versions;
  };
  await commit('packages/web-core/change.ts', 'fix: shared Core update');
  assert.deepEqual(await run(), ['7.3.3', '8.1.1', '2.4.1']);
  assert.equal((await manifest('web-core')).version, '7.3.3');
  assert.equal((await manifest('web-vue')).dependencies['@sdata/web-core'], 'workspace:^');
  assert.equal((await manifest('web-react')).dependencies['@sdata/web-core'], 'workspace:*');
  await commit('packages/web-vue/change.ts', 'fix: independent Vue update');
  const coreHead = git('rev-parse', 'web-core-v7.3.3');
  const reactHead = git('rev-parse', 'web-react-v2.4.1');
  assert.deepEqual(await run(), [null, '8.1.2', null]);
  assert.equal((await manifest('web-core')).version, '7.3.3');
  assert.equal((await manifest('web-react')).version, '2.4.1');
  assert.equal(git('rev-parse', 'web-core-v7.3.3'), coreHead);
  assert.equal(git('rev-parse', 'web-react-v2.4.1'), reactHead);
});
