import { createSSRApp, h } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { renderToString } from 'vue/server-renderer';

test('Watermark renders slotted content on the server', async () => {
  const component = fileURLToPath(
    new URL('../components/watermark/watermark.vue', import.meta.url),
  );
  const output = await mkdtemp(
    fileURLToPath(new URL('../node_modules/.watermark-ssr-', import.meta.url)),
  );
  try {
    await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [vue()],
      build: {
        ssr: component,
        outDir: output,
        minify: false,
        rolldownOptions: { output: { entryFileNames: 'entry.js', codeSplitting: false } },
      },
    });
    const { default: Watermark } = await import(pathToFileURL(`${output}/entry.js`).href);
    for (const props of [{}, { content: 'Watermark' }, { image: '/watermark.png' }]) {
      const errors: unknown[] = [];
      const app = createSSRApp({
        render: () => h(Watermark, props, () => h('div', 'Body')),
      });
      app.config.errorHandler = (error) => errors.push(error);
      const html = await renderToString(app);
      assert.deepEqual(errors, []);
      assert.match(html, /Body/);
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
