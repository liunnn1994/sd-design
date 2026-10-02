import { createSSRApp, h } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { renderToString } from 'vue/server-renderer';

test('ImagePreview and ImagePreviewGroup render on the server in closed and open states', async () => {
  const component = fileURLToPath(new URL('../components/image/index.ts', import.meta.url));
  const output = await mkdtemp(
    fileURLToPath(new URL('../node_modules/.image-ssr-', import.meta.url)),
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
    const { default: Image } = await import(pathToFileURL(`${output}/entry.js`).href);
    for (const component of [Image.Preview, Image.PreviewGroup]) {
      for (const props of [{}, { defaultVisible: true }, { visible: true }]) {
        const errors: unknown[] = [];
        const app = createSSRApp({
          render: () => h(component, { src: 'preview.png', srcList: ['preview.png'], ...props }),
        });
        app.config.errorHandler = (error) => errors.push(error);
        const context: { teleports?: Record<string, string> } = {};
        const html = await renderToString(app, context);
        assert.deepEqual(errors, []);
        assert.match(html, /teleport start/);
        const content = Object.values(context.teleports ?? {}).join('');
        assert.match(content, /image-preview/);
        if (props.defaultVisible || props.visible) assert.match(content, /preview\.png/);
      }
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
