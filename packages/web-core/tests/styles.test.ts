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
  for (const file of (await readdir(styles, { recursive: true })).filter((name) =>
    name.endsWith('.scss'),
  )) {
    const source = await readFile(new URL(file.replaceAll('\\', '/'), styles), 'utf8');
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
