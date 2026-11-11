import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

for (const component of ['config-provider', 'theme-provider', 'clamp']) {
  test(`${component} standalone styles preserve the shared layout contract`, async () => {
    const result = await build({
      configFile: false,
      logLevel: 'silent',
      root: fileURLToPath(new URL('..', import.meta.url)),
      build: {
        write: false,
        minify: false,
        cssMinify: false,
        lib: {
          entry: fileURLToPath(new URL(`./fixtures/${component}-style.ts`, import.meta.url)),
          formats: ['es'],
        },
      },
    });
    const css = (Array.isArray(result) ? result : [result])
      .flatMap((item) => ('output' in item ? item.output : []))
      .filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
      .map((item) => (item.type === 'asset' ? String(item.source) : ''))
      .join('\n');
    if (component === 'clamp') assert.equal(css.trim(), '');
    else {
      assert.match(css, /\.sd-theme-provider\s*\{\s*min-width: 0/);
      assert.match(css, /\.sd-theme-popup-container\s*\{\s*position: fixed/);
      assert.match(css, /pointer-events: none/);
      assert.match(css, /--sd-color-white:/);
    }
  });
}
