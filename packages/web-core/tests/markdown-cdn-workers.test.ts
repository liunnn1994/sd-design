import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as katex from '../dist/markdown/katex-cdn-worker.js';
import * as mermaid from '../dist/markdown/mermaid-cdn-worker.js';

const upstream = async (name: string) =>
  import(
    new URL(`../../web-vue/node_modules/markstream-vue/dist/workers/${name}.js`, import.meta.url)
      .href
  );
const urls = [
  '/engine.js',
  'https://cdn.test/engine.js?version=1#hash',
  'https://cdn.test/"\\${value}\n💡.js',
  "https://cdn.test/');postMessage('injected');//",
];

// The only intentional source delta fixes requests racing the module's first import.
const waitForMermaid = (source: string) =>
  source.includes('async function loadMermaid()')
    ? source
        .replace('  await loadMermaid()\n\n', '')
        .replace('  if (!mermaid) {', '  await loadMermaid()\n\n  if (!mermaid) {')
    : source;

test('KaTeX classic/module source matches the locked worker protocol byte for byte', async () => {
  const vue = await upstream('katexCdnWorker');
  for (const mode of [undefined, 'classic', 'module'] as const) {
    for (const katexUrl of urls) {
      for (const mhchemUrl of [undefined, '', '/optional-mhchem.js']) {
        for (const renderOptions of [
          undefined,
          {},
          { throwOnError: false, output: 'htmlAndMathml', strict: 'warn' },
          { strict: undefined },
        ]) {
          const options = { katexUrl, mhchemUrl, mode, renderOptions, debug: true };
          assert.equal(
            katex.buildKaTeXCDNWorkerSource(options),
            vue.buildKaTeXCDNWorkerSource(options),
          );
        }
      }
    }
  }
});

test('Mermaid classic/module source preserves parsing, theming and prefix recovery', async () => {
  const vue = await upstream('mermaidCdnWorker');
  for (const mode of [undefined, 'classic', 'module'] as const) {
    for (const mermaidUrl of urls) {
      for (const initializeOptions of [
        undefined,
        {},
        { theme: 'forest', securityLevel: 'loose', flowchart: { htmlLabels: true } },
        { theme: '${code}\n"', startOnLoad: undefined },
      ]) {
        const options = { mermaidUrl, mode, initializeOptions, debug: true };
        assert.equal(
          mermaid.buildMermaidCDNWorkerSource(options),
          waitForMermaid(vue.buildMermaidCDNWorkerSource(options)),
        );
      }
    }
  }
});

test('CDN factories stay inert on the server while still returning the complete source', () => {
  assert.equal(typeof Worker, 'undefined');
  const ka = katex.createKaTeXWorkerFromCDN({ katexUrl: '/katex.js' });
  const me = mermaid.createMermaidWorkerFromCDN({ mermaidUrl: '/mermaid.js' });
  for (const handle of [ka, me]) {
    assert.equal(handle.worker, null);
    assert.ok(handle.source.includes("addEventListener('message'"));
    assert.doesNotThrow(handle.dispose);
    assert.doesNotThrow(handle.dispose);
  }
});

test('both factories retain native options, debug ordering and URL ownership on success and failure', async (t) => {
  const vueKa = await upstream('katexCdnWorker');
  const vueMe = await upstream('mermaidCdnWorker');
  const keys = ['Worker', 'Blob', 'URL'] as const;
  const descriptors = keys.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
  t.after(() =>
    keys.forEach((key, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }),
  );
  const pairs = [
    [vueKa.createKaTeXWorkerFromCDN, katex.createKaTeXWorkerFromCDN, { katexUrl: '/engine.js' }],
    [
      vueMe.createMermaidWorkerFromCDN,
      mermaid.createMermaidWorkerFromCDN,
      { mermaidUrl: '/engine.js' },
    ],
  ] as const;
  for (const [native, shared, base] of pairs) {
    for (const mode of [undefined, 'classic', 'module'] as const) {
      for (const debug of [false, true]) {
        for (const failure of [
          'none',
          'constructor',
          'debug',
          'revoke',
          'missing-worker',
          'missing-url',
          'missing-blob',
        ]) {
          const observations: unknown[] = [];
          for (const factory of [native, shared]) {
            const events: unknown[] = [];
            const rejection = new Error('constructor rejected');
            const workerOptions: WorkerOptions = {
              name: 'cdn-test',
              type: 'classic',
              credentials: 'same-origin',
            };
            const set = (key: string, value: unknown) =>
              Object.defineProperty(globalThis, key, { value, configurable: true });
            set(
              'Blob',
              failure === 'missing-blob'
                ? undefined
                : class {
                    constructor(parts: unknown[], options: BlobPropertyBag) {
                      events.push([
                        'blob',
                        parts.map((part) => waitForMermaid(String(part))),
                        options,
                      ]);
                    }
                  },
            );
            set(
              'URL',
              failure === 'missing-url'
                ? undefined
                : {
                    createObjectURL() {
                      events.push('create-url');
                      return 'blob:cdn-test';
                    },
                    revokeObjectURL(url: string) {
                      events.push(['revoke', url]);
                      if (failure === 'revoke') throw new Error('revoke rejected');
                    },
                  },
            );
            set(
              'Worker',
              failure === 'missing-worker'
                ? undefined
                : class {
                    constructor(url: string, options?: WorkerOptions) {
                      events.push(['worker', url, options, options === workerOptions]);
                      if (failure === 'constructor') throw rejection;
                    }
                    postMessage(value: unknown) {
                      events.push(['post', value]);
                      if (failure === 'debug') throw new Error('post rejected');
                    }
                    terminate() {
                      events.push('terminate');
                    }
                  },
            );
            let handle;
            try {
              handle = factory({ ...base, mode, debug, workerOptions });
            } catch (error) {
              assert.equal(error, rejection);
            }
            if (handle) {
              handle.dispose();
              handle.dispose();
              assert.equal(
                events.includes('terminate'),
                false,
                'dispose retains caller ownership of the worker',
              );
              events.push(['handle', handle.worker !== null, waitForMermaid(handle.source)]);
            }
            observations.push(events);
          }
          assert.deepEqual(observations[1], observations[0], `${mode}/${debug}/${failure}`);
        }
      }
    }
  }
});
