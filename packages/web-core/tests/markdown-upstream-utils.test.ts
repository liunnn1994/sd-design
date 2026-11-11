import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as thresholds from '../dist/markdown/katex-threshold.js';
import * as scheduling from '../dist/markdown/safe-raf.js';

test('threshold helpers match locked Vue defaults, boundary formulas and cache/budget limits', async () => {
  const vue = await import(
    new URL(
      '../../web-vue/node_modules/markstream-vue/dist/utils/katex-threshold.js',
      import.meta.url,
    ).href
  );
  const samples = [
    '',
    'x'.repeat(9),
    'x'.repeat(10),
    'x'.repeat(39),
    'x'.repeat(40),
    '\\alpha',
    '\\\\alpha',
    '\\\\'.repeat(5),
    '💡'.repeat(5),
  ];
  for (const sample of samples)
    assert.equal(
      thresholds.estimateRByFormula(sample),
      vue.estimateRByFormula(sample),
      JSON.stringify(sample),
    );
  for (const kind of ['simple', 'medium', 'complex'] as const)
    assert.equal(thresholds.defaultRByClass(kind), vue.defaultRByClass(kind));
  for (const R of [0, 1, 3, 10, 30, -1, Infinity, NaN]) {
    for (const H of [undefined, 0, 0.5, 1, 2]) {
      for (const B of [undefined, 0, 50, -1]) {
        const options = { R, H, B };
        assert.equal(
          thresholds.recommendWorkerThreshold(options),
          vue.recommendWorkerThreshold(options),
        );
      }
    }
  }
  for (const values of [
    [],
    ...samples.map((sample) => [sample]),
    samples,
    [...samples].reverse(),
  ]) {
    for (const options of [undefined, { H: 0.5, B: 20 }, { H: 1, B: 0 }]) {
      assert.equal(
        thresholds.recommendNForSamples(values, options),
        vue.recommendNForSamples(values, options),
      );
    }
  }
});

test('frame helpers match native preference and throwing/missing API fallbacks', async (t) => {
  const vue = await import(
    new URL('../../web-vue/node_modules/markstream-vue/dist/utils/safeRaf.js', import.meta.url).href
  );
  const keys = [
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'setTimeout',
    'clearTimeout',
  ] as const;
  const descriptors = keys.map((key) => Object.getOwnPropertyDescriptor(globalThis, key));
  t.after(() =>
    keys.forEach((key, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }),
  );
  const callback = () => {};
  for (const mode of ['native', 'missing', 'throwing', 'throwing-clear']) {
    const observations: unknown[][] = [];
    for (const implementation of [vue, scheduling]) {
      const calls: unknown[] = [];
      const set = (key: string, value: unknown) =>
        Object.defineProperty(globalThis, key, { value, configurable: true });
      set(
        'requestAnimationFrame',
        mode === 'missing'
          ? undefined
          : (cb: FrameRequestCallback) => {
              calls.push(['frame', cb === callback]);
              if (mode.startsWith('throwing')) throw new Error('native frame rejected');
              return 41;
            },
      );
      set(
        'cancelAnimationFrame',
        mode === 'missing'
          ? undefined
          : (id: number) => {
              calls.push(['cancel', id]);
              if (mode.startsWith('throwing')) throw new Error('native cancel rejected');
            },
      );
      set('setTimeout', (cb: FrameRequestCallback, delay: number) => {
        calls.push(['timer', cb === callback, delay]);
        return 42;
      });
      set('clearTimeout', (id: number) => {
        calls.push(['clear', id]);
        if (mode === 'throwing-clear') throw new Error('timer cancel rejected');
      });
      const id = implementation.safeRaf(callback);
      calls.push(['handle', id]);
      implementation.safeCancelRaf(id);
      implementation.safeCancelRaf(null);
      implementation.safeCancelRaf(0);
      observations.push(calls);
    }
    assert.deepEqual(observations[1], observations[0], mode);
  }
});

test('server fallback accepts a Node timer handle and cancels it without browser globals', async () => {
  assert.equal(typeof globalThis.requestAnimationFrame, 'undefined');
  let called = false;
  scheduling.safeCancelRaf(
    scheduling.safeRaf(() => {
      called = true;
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(called, false);
  await new Promise<void>((resolve) =>
    scheduling.safeRaf((timestamp) => {
      assert.equal(timestamp, undefined);
      resolve();
    }),
  );
});
