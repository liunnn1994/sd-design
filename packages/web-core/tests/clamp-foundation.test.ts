import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { InlineClampFoundationOptions } from '../dist/clamp/inline/foundation.js';
import type { LineClampFoundationOptions } from '../dist/clamp/line/foundation.js';
import type { RichLineClampFoundationOptions } from '../dist/clamp/rich-line/foundation.js';
import type { WrapClampFoundationOptions } from '../dist/clamp/wrap/foundation.js';

import * as inline from '../dist/clamp/inline/foundation.js';
import * as line from '../dist/clamp/line/foundation.js';
import { createLayoutMeasurer } from '../dist/clamp/measure.js';
import * as rich from '../dist/clamp/rich-line/foundation.js';
import { prepareSharedText } from '../dist/clamp/text.js';
import * as wrap from '../dist/clamp/wrap/foundation.js';
const modules = { line, 'rich-line': rich, wrap, inline };
const cell = <T>(value: T) => ({ value });
const tick = () => new Promise((resolve) => setImmediate(resolve));
const measureLayout = createLayoutMeasurer((flush) => flush());
function multilineState() {
  return {
    expanded: cell(false),
    rootRef: cell(null),
    contentRef: cell(null),
    beforeRef: cell(null),
    bodyRef: cell(null),
    afterRef: cell(null),
    isClamped: cell(false),
    hasActiveClamp: cell(true),
  };
}
function lineOptions(
  overrides: Partial<LineClampFoundationOptions> = {},
): LineClampFoundationOptions {
  return {
    text: 'Full source',
    location: 'end',
    maxHeight: undefined,
    boundary: 'grapheme',
    ellipsis: '…',
    measureLayout,
    afterRender: async () => {},
    observedSizeSnapshot: () => ({ signature: 'empty', width: 0 }),
    state: {
      ...multilineState(),
      textRef: cell(null),
      visibleText: cell({ text: 'Full source' }),
      lineLimit: cell(1),
      preparedText: cell(prepareSharedText('Full source', 'grapheme')),
    },
    ...overrides,
  };
}
function richOptions(): RichLineClampFoundationOptions {
  return {
    html: '<b>Full source</b>',
    maxLines: 2,
    maxHeight: undefined,
    boundary: 'grapheme',
    ellipsis: '…',
    measureLayout,
    afterRender: async () => {},
    observedSizeSnapshot: () => ({ signature: 'empty', width: 0 }),
    state: {
      ...multilineState(),
      preparedHtml: cell(null),
      probeRef: cell(null),
      isFallback: cell(false),
    },
  };
}
function wrapOptions(): WrapClampFoundationOptions {
  return {
    items: [1, 2, 3],
    maxLines: undefined,
    maxHeight: undefined,
    slots: {},
    afterRender: async () => {},
    state: { ...multilineState(), visibleCount: cell(3), materializedCount: cell(0) },
  };
}
function inlineOptions(): InlineClampFoundationOptions {
  return {
    split: undefined,
    location: 'end',
    ellipsis: '…',
    measureLayout,
    state: {
      rootRef: cell(null),
      bodyRef: cell(null),
      parts: cell({ body: 'Full source' }),
      preparedBody: cell(prepareSharedText('Full source', 'grapheme')),
      hasActiveClamp: cell(false),
      usesNativeClamp: cell(true),
      visibleBody: cell({ text: 'Short…' }),
    },
  };
}

test('all four controllers construct without Vue, DOM, prop reads or scheduling', () => {
  function check<T extends object>(name: string, create: (options: T) => unknown, options: T) {
    for (const key of Object.keys(options).filter((key) => key !== 'state'))
      Object.defineProperty(options, key, {
        get() {
          throw Error(name + ' prematurely read ' + key);
        },
      });
    assert.ok(create(options));
  }
  check('line', modules.line.createLineClampFoundation, lineOptions());
  check('rich', modules['rich-line'].createRichLineClampFoundation, richOptions());
  check('wrap', modules.wrap.createWrapClampFoundation, wrapOptions());
  check('inline', modules.inline.createInlineClampFoundation, inlineOptions());
  assert.equal(globalThis.document, undefined);
  assert.equal(globalThis.window, undefined);
});

test('line reset commits full source and accessibility state before awaiting the adapter render', async () => {
  const options = lineOptions();
  const original = (options.state.visibleText.value = { text: 'Short…' });
  options.state.isClamped.value = true;
  let release: () => void = () => {};
  let calls = 0,
    complete = false;
  options.afterRender = () => {
    calls++;
    return new Promise<void>((resolve) => {
      release = resolve;
    });
  };
  const foundation = modules.line.createLineClampFoundation(options);
  const pending = foundation.recompute(cell(true)).then(() => {
    complete = true;
  });
  assert.deepEqual(options.state.visibleText.value, { text: options.text });
  assert.notEqual(options.state.visibleText.value, original);
  assert.equal(options.state.isClamped.value, false);
  assert.equal(calls, 1);
  await Promise.resolve();
  assert.equal(complete, false);
  release();
  await pending;
  assert.equal(complete, true);
  await foundation.recompute(cell(true));
  assert.equal(calls, 1, 'stable structure/status does not insert another adapter tick');
});

test('line mount gaps restore full text; native rendering selection follows current expansion and affixes', async () => {
  let maxHeight: number | undefined;
  const options = lineOptions();
  Object.defineProperty(options, 'maxHeight', { get: () => maxHeight });
  options.state.visibleText.value = { text: 'Short…' };
  options.state.isClamped.value = true;
  const foundation = modules.line.createLineClampFoundation(options);
  await foundation.recompute(options.state.expanded);
  assert.equal(options.state.visibleText.value.text, options.text);
  assert.equal(options.state.isClamped.value, false);
  assert.equal(foundation.getNativeMode(false, 2, 1), 'multi-line');
  assert.equal(foundation.getNativeMode(true, 2, 1), null);
  assert.equal(foundation.getNativeMode(true, 1, 1), 'single-line');
  options.state.expanded.value = true;
  assert.equal(foundation.getNativeMode(false, 1, 1), null);
  maxHeight = 0;
  assert.equal(foundation.hasClampLimit(undefined), true, 'explicit zero remains a constraint');
});

test('rich reset commits status before its render boundary and semantic resets retain the public cells', async () => {
  const options = richOptions();
  options.state.isClamped.value = true;
  options.state.isFallback.value = true;
  let release: () => void = () => {};
  let calls = 0;
  options.afterRender = () => {
    calls++;
    return new Promise<void>((resolve) => {
      release = resolve;
    });
  };
  const foundation = modules['rich-line'].createRichLineClampFoundation(options);
  const pending = foundation.recompute(cell(true));
  assert.equal(options.state.isClamped.value, false);
  assert.equal(options.state.isFallback.value, false);
  assert.equal(calls, 1);
  release();
  await pending;
  options.state.isFallback.value = true;
  foundation.resetSource(false);
  assert.equal(options.state.isFallback.value, false);
  assert.equal(foundation.getNativeMode(2), 'multi-line');
  options.state.expanded.value = true;
  assert.equal(foundation.getNativeMode(2), null);
});

test('wrap unlimited settlement clears temporary materialization before render and serializes invalidations', async () => {
  const options = wrapOptions();
  options.state.visibleCount.value = 1;
  options.state.materializedCount.value = 3;
  options.state.isClamped.value = true;
  let release: () => void = () => {};
  let calls = 0;
  options.afterRender = () => {
    calls++;
    return new Promise<void>((resolve) => {
      release = resolve;
    });
  };
  const foundation = modules.wrap.createWrapClampFoundation(options);
  foundation.requestRecompute();
  assert.equal(foundation.isRecomputing, true);
  assert.equal(options.state.visibleCount.value, 3);
  assert.equal(options.state.materializedCount.value, 0);
  assert.equal(options.state.isClamped.value, false);
  foundation.requestRecompute();
  foundation.requestRecompute();
  assert.equal(calls, 1);
  release();
  await tick();
  assert.equal(foundation.isRecomputing, false);
  assert.equal(calls, 1, 'queued stable pass retains zero extra render ticks');
  assert.equal(typeof foundation.lastLayoutSignature, 'string');
});

test('inline native semantic updates restore source snapshots and disposal cancels future measurements', () => {
  const options = inlineOptions();
  let measurements = 0;
  options.measureLayout = () => {
    measurements++;
    return Promise.resolve(null);
  };
  const foundation = modules.inline.createInlineClampFoundation(options);
  const previous = options.state.visibleBody.value;
  foundation.semanticChanged();
  assert.deepEqual(options.state.visibleBody.value, { text: 'Full source' });
  assert.notEqual(options.state.visibleBody.value, previous);
  assert.equal(foundation.observe(), undefined);
  foundation.mount();
  assert.equal(measurements, 0);
  foundation.dispose();
  options.state.usesNativeClamp.value = false;
  options.state.hasActiveClamp.value = true;
  foundation.semanticChanged();
  foundation.mount();
  assert.equal(measurements, 0);
});

test('wrap item keys preserve function payload/receiver, inherited fields, falsy keys and original fallback', () => {
  const resolve = modules.wrap.resolveItemKey;
  assert.equal(typeof resolve, 'function');
  const cases: Array<[string | undefined, unknown, string | number]> = [
    [undefined, 'value', 9],
    ['key', null, 9],
    ['key', 0, 9],
    ['key', false, 9],
    ['key', { key: 0 }, 0],
    ['key', { key: '' }, ''],
    ['key', { key: false }, 9],
    ['key', { key: undefined }, 9],
    ['key', { key: null }, 9],
    ['key', {}, 9],
    ['0', ['array-key'], 'array-key'],
    ['key', Object.create({ key: 'inherited' }), 'inherited'],
  ];
  for (const [key, item, expected] of cases) assert.equal(resolve(key, item, 9), expected);
  const item = { marker: true };
  let args: unknown[] | undefined;
  function callback(this: unknown, ...values: unknown[]) {
    args = values;
    assert.equal(this, undefined);
    return 'callback-key';
  }
  assert.equal(resolve(callback, item, 9), 'callback-key');
  assert.deepEqual(args, [item, 9]);
  assert.equal(args?.[0], item);
  const inherited = {
    get key(): number {
      assert.equal(this, child);
      return 17;
    },
  };
  const child = { __proto__: inherited };
  assert.equal(resolve('key', child, 9), 17);
  assert.equal(Number.isNaN(resolve('key', { key: NaN }, 9)), true);
});
