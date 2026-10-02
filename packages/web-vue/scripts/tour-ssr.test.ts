import { createSSRApp, h } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { renderToString } from 'vue/server-renderer';

test('Tour renders on the server in hidden and visible states', async () => {
  const component = fileURLToPath(new URL('../components/tour/tour.vue', import.meta.url));
  const output = await mkdtemp(
    fileURLToPath(new URL('../node_modules/.tour-ssr-', import.meta.url)),
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
    const { default: Tour } = await import(pathToFileURL(`${output}/entry.js`).href);
    for (const props of [{}, { defaultVisible: true }, { visible: true }]) {
      const errors: unknown[] = [];
      const app = createSSRApp({
        render: () =>
          h(Tour, { steps: [{ popover: { title: 'Step' } }], ...props }, () =>
            h('button', 'Target'),
          ),
      });
      app.config.errorHandler = (error) => errors.push(error);
      const html = await renderToString(app);
      assert.deepEqual(errors, []);
      assert.match(html, /Target/);
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
