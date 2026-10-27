import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { loadConfigFromFile } from 'vite';

import { createSassStyleSupport } from './utils/sass-support.mts';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const componentsRoot = path.join(packageRoot, 'components');
const support = createSassStyleSupport({
  packageRoot,
  componentsRoot,
  styleRoot: path.join(componentsRoot, 'style'),
});

test('published Sass entry compiles without repository aliases', async () => {
  const result = await sass.compileAsync(path.join(componentsRoot, 'index.scss'), {
    loadPaths: [path.join(packageRoot, 'node_modules')],
  });
  assert.match(result.css, /\.sd-btn/);
  assert.match(result.css, /\.sd-markdown-render/);
  assert.match(result.css, /\.driver-overlay/);
});

test('legacy Vue Sass paths retain the shared CSS', async () => {
  for (const entry of [
    'button/style/index.scss',
    'table/style/index.scss',
    'style/index.scss',
    'skeleton-reveal/style/index.scss',
    'liquid-glass-logo/style/index.scss',
  ]) {
    const oldPath = path.join(componentsRoot, entry);
    const sharedPath = fileURLToPath(new URL(`../../web-core/styles/${entry}`, import.meta.url));
    const legacy = await support.compileStyleEntry(oldPath, entry);
    const shared = (await sass.compileAsync(sharedPath)).css;
    assert.equal(legacy, shared, entry);
  }
});

test('Tour and full Vue styles include upstream Driver CSS before the shared theme', async () => {
  const upstream = await sass.compileAsync(
    fileURLToPath(import.meta.resolve('driver.js/dist/driver.css')),
  );
  for (const entry of ['tour/style/index.scss', 'index.scss']) {
    const css = await support.compileStyleEntry(path.join(componentsRoot, entry), entry);
    const upstreamIndex = css.indexOf(upstream.css);
    assert.ok(upstreamIndex >= 0, `${entry} must include the installed Driver stylesheet`);
    assert.ok(
      css.lastIndexOf('.driver-popover {') >= upstreamIndex + upstream.css.length,
      `${entry} must apply the shared Tour theme after Driver defaults`,
    );
    assert.match(css, /--component-tour-color-bg/);
  }
});

test('debug app compiles full source styles with the component package dependencies', async () => {
  const loaded = await loadConfigFromFile(
    { command: 'build', mode: 'production' },
    path.resolve(packageRoot, '../web-vue-debug/vite.config.ts'),
  );
  const plugin = loaded?.config.plugins
    ?.flat()
    .find(
      (plugin) =>
        plugin &&
        typeof plugin === 'object' &&
        'name' in plugin &&
        plugin.name === 'web-vue-source-style',
    );
  assert.ok(plugin && typeof plugin === 'object' && 'load' in plugin);
  assert.equal(typeof plugin.load, 'function');
  const load = plugin.load as (id: string) => Promise<string | null>;
  const css = await load('\0virtual:web-vue-source-styles.css');
  assert.ok(css);
  assert.match(css, /\.driver-overlay/);
  assert.match(css, /--component-tour-color-bg/);
});
