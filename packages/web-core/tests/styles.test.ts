import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const styles = new URL('../styles/', import.meta.url);

test('shared Sass compiles without a framework package or source aliases', async () => {
  const result = await sass.compileAsync(fileURLToPath(new URL('index.scss', styles)));
  assert.match(result.css, /\.sd-btn/);
  assert.match(result.css, /\.sd-table/);
  assert.match(result.css, /--component-button-/);
  assert.match(result.css, /\.sd-skeleton-reveal/);
  assert.match(result.css, /--component-skeleton-reveal-skeleton-reveal-stroke/);
  assert.match(result.css, /--component-skeleton-reveal-skeleton-reveal-stroke-width/);
  for (const file of (await readdir(styles, { recursive: true })).filter((name) =>
    name.endsWith('.scss'),
  )) {
    const source = await readFile(new URL(file.replaceAll('\\', '/'), styles), 'utf8');
    if (file.replaceAll('\\', '/') === 'tour/style/vendor.scss') {
      assert.equal(source.trim(), "@use 'driver.js/dist/driver.css';");
      const vendor = await sass.compileAsync(
        fileURLToPath(new URL(file.replaceAll('\\', '/'), styles)),
        {
          loadPaths: [fileURLToPath(new URL('../node_modules/', import.meta.url))],
        },
      );
      assert.match(vendor.css, /\.driver-overlay/);
      assert.match(vendor.css, /\.driver-popover/);
      continue;
    }
    assert.doesNotMatch(
      source,
      /@(?:use|forward|import)\s*['"](?:@style\/|@components\/|.*web-vue|driver\.js\/)/,
      file,
    );
  }
});

test('the public Sass package export resolves to the canonical shared module', () => {
  const actual = import.meta.resolve('@sdata/web-core/styles/button/style/index.scss');
  assert.equal(actual, new URL('button/style/index.scss', styles).href);
});
