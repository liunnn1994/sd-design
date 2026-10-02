import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';

test('BloomMenu renders on the server in closed and open states', async () => {
  const component = fileURLToPath(
    new URL('../components/bloom-menu/bloom-menu.vue', import.meta.url),
  );
  const output = await mkdtemp(
    fileURLToPath(new URL('../node_modules/.bloom-ssr-', import.meta.url)),
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
    const { default: BloomMenu } = await import(pathToFileURL(`${output}/entry.js`).href);
    for (const props of [{}, { defaultOpen: true }, { modelValue: true }]) {
      const errors: unknown[] = [];
      const app = createSSRApp({ render: () => h(BloomMenu, { items: [], ...props }) });
      app.config.errorHandler = (error) => errors.push(error);
      const html = await renderToString(app);
      assert.deepEqual(errors, []);
      assert.match(html, /data-bloom-menu-trigger/);
      assert.match(html, /Create/);
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
