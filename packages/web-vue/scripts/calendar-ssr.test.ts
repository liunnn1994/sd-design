import { createSSRApp, h } from 'vue';

import vue from '@vitejs/plugin-vue';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'vite';
import { renderToString } from 'vue/server-renderer';

test('Calendar does not start a realtime ticker during server rendering', async (context) => {
  const component = fileURLToPath(
    new URL('../components/calendar/components/index.vue', import.meta.url),
  );
  const output = await mkdtemp(
    fileURLToPath(new URL('../node_modules/.calendar-ssr-', import.meta.url)),
  );
  const timers: ReturnType<typeof setTimeout>[] = [];
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
    const { default: Calendar } = await import(pathToFileURL(`${output}/entry.js`).href);
    const originalTimeout = globalThis.setTimeout;
    const timeout = context.mock.method(
      globalThis,
      'setTimeout',
      (...args: Parameters<typeof setTimeout>) => {
        const timer = originalTimeout(...args);
        timers.push(timer);
        return timer;
      },
    );
    const errors: unknown[] = [];
    const app = createSSRApp({ render: () => h(Calendar, { time: true, watchRealTime: true }) });
    app.config.errorHandler = (error) => errors.push(error);
    const html = await renderToString(app);
    assert.deepEqual(errors, []);
    assert.match(html, /calendar/);
    assert.equal(timeout.mock.callCount(), 0);
  } finally {
    timers.forEach(clearTimeout);
    await rm(output, { recursive: true, force: true });
  }
});
