import { createSSRApp, h } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { renderToString } from 'vue/server-renderer';

test('FilePreviewer renders on the server in inline and fullscreen states', async () => {
  const component = fileURLToPath(
    new URL('../components/file-previewer/file-previewer.vue', import.meta.url),
  );
  const output = await mkdtemp(
    fileURLToPath(new URL('../node_modules/.file-previewer-ssr-', import.meta.url)),
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
    const { default: FilePreviewer } = await import(pathToFileURL(`${output}/entry.js`).href);
    for (const props of [{}, { fullscreen: false }, { fullscreen: true, visible: true }]) {
      const errors: unknown[] = [];
      const app = createSSRApp({
        render: () => h(FilePreviewer, { type: 'video', src: 'preview.mp4', ...props }),
      });
      app.config.errorHandler = (error) => errors.push(error);
      const context: { teleports?: Record<string, string> } = {};
      const html = await renderToString(app, context);
      assert.deepEqual(errors, []);
      assert.match(html, /teleport start/);
      if (props.fullscreen === false || props.visible) {
        const content = html + Object.values(context.teleports ?? {}).join('');
        assert.match(content, /file-previewer-video/);
        assert.match(content, /preview\.mp4/);
      }
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
