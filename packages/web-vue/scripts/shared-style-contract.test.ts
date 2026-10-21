import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

import { createSassStyleSupport } from './utils/sass-support.mts';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const componentsRoot = path.join(packageRoot, 'components');
const support = createSassStyleSupport({
  packageRoot,
  componentsRoot,
  styleRoot: path.join(componentsRoot, 'style'),
});

test('legacy Vue Sass paths retain the shared CSS', async () => {
  for (const entry of ['button/style/index.scss', 'table/style/index.scss', 'style/index.scss']) {
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
