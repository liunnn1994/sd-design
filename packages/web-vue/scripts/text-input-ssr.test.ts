import { createSSRApp, h } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { renderToString } from 'vue/server-renderer';

for (const name of ['input', 'textarea']) {
  test(`${name} initializes text measurement and length state without DOM globals`, async () => {
    assert.equal(typeof globalThis.document, 'undefined');
    const output = await mkdtemp(
      fileURLToPath(new URL('../node_modules/.text-input-ssr-', import.meta.url)),
    );
    try {
      await build({
        configFile: false,
        logLevel: 'silent',
        plugins: [vue()],
        build: {
          ssr: fileURLToPath(new URL(`../components/${name}/index.ts`, import.meta.url)),
          outDir: output,
          minify: false,
          rolldownOptions: { output: { entryFileNames: 'entry.js', codeSplitting: false } },
        },
      });
      const { default: Component } = await import(pathToFileURL(`${output}/entry.js`).href);
      for (const fitWidth of [false, true]) {
        const app = createSSRApp({
          render: () =>
            h(Component, {
              modelValue: '👨‍👩‍👧‍👦ab',
              maxLength: { length: 2, errorOnly: true },
              showWordLimit: true,
              fitWidth,
            }),
        });
        const errors: unknown[] = [];
        app.config.errorHandler = (error) => errors.push(error);
        const html = await renderToString(app);
        assert.deepEqual(errors, []);
        assert.match(html, /aria-invalid="true"/);
        assert.match(html, /3\/2/);
        assert.match(html, /👨‍👩‍👧‍👦ab/);
      }
    } finally {
      await rm(output, { recursive: true, force: true });
    }
  });
}
