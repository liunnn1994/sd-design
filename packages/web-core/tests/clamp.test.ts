import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createClampControls } from '../dist/clamp/controls.js';
import {
  createCoalescingRunner,
  hasMeasuredPeers,
  observeMeasuredBorderBoxSizes,
} from '../dist/clamp/layout.js';
import { createLayoutMeasurer } from '../dist/clamp/measure.js';
import { resolveNativeMode } from '../dist/clamp/native.js';
import { clampTextToFit, displayTextForKeptCount, prepareText } from '../dist/clamp/text.js';
import { simulateStaticFlow } from '../dist/clamp/wrap/flow.js';

test('text search retains grapheme clusters and start/middle/end locations without a DOM', () => {
  const prepared = prepareText('A👨‍👩‍👧‍👦é中Z');
  assert.equal(prepared.boundaryOffsets.length, 6);
  assert.equal(displayTextForKeptCount(prepared, 0, '…', 2), '…中Z');
  assert.equal(displayTextForKeptCount(prepared, 0.5, '…', 2), 'A…Z');
  assert.equal(displayTextForKeptCount(prepared, 1, '…', 2), 'A👨‍👩‍👧‍👦…');
  assert.equal(displayTextForKeptCount(prepared, 1, '…', 5), prepared.text);
  const result = clampTextToFit({
    prepared,
    ratio: 1,
    ellipsis: '…',
    fits: (text) =>
      [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].length <= 3,
  });
  assert.equal(result.text, 'A👨‍👩‍👧‍👦…');
});

test('native clamping only handles exact CSS-compatible semantics', () => {
  const input = {
    boundary: 'grapheme' as const,
    ellipsis: '…',
    expanded: false,
    hasAfterSlot: false,
    lineLimit: 2,
    locationRatio: 1,
    maxHeight: undefined,
  };
  assert.equal(resolveNativeMode(input), 'multi-line');
  assert.equal(resolveNativeMode({ ...input, hasAfterSlot: true }), null);
  assert.equal(resolveNativeMode({ ...input, lineLimit: 1, hasAfterSlot: true }), 'single-line');
  assert.equal(resolveNativeMode({ ...input, ellipsis: '...' }), null);
  assert.equal(resolveNativeMode({ ...input, expanded: true }), null);
  assert.equal(resolveNativeMode({ ...input, locationRatio: 0.5 }), null);
});

test('atomic item flow reserves suffix width and declines unknown item geometry', () => {
  const input = { containerWidth: 100, itemCount: 4, itemWidth: () => 30, lineLimit: 1 };
  assert.deepEqual(simulateStaticFlow(input), { fitCount: 3, status: 'overflow' });
  assert.deepEqual(simulateStaticFlow({ ...input, afterWidth: 20 }), {
    fitCount: 2,
    status: 'overflow',
  });
  assert.deepEqual(simulateStaticFlow({ ...input, itemWidth: () => null }), {
    fitCount: 0,
    status: 'unknown',
  });
});

test('expansion controls work through an adapter-owned state cell', () => {
  const expanded = { value: false };
  const controls = createClampControls(expanded);
  controls.expand();
  assert.equal(expanded.value, true);
  controls.toggle();
  assert.equal(expanded.value, false);
  controls.expand();
  controls.collapse();
  assert.equal(expanded.value, false);
});

test('coalesced invalidations serialize work without losing requests made during a pass', async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let running = 0;
  let passes = 0;
  const request = createCoalescingRunner(async () => {
    assert.equal(++running, 1);
    passes++;
    if (passes === 1) await pending;
    running--;
  });
  request();
  request();
  request();
  assert.equal(passes, 1);
  release();
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(passes, 2);
  assert.equal(running, 0);
});

test('measurement batches perform all reads before the next candidate writes and discard stale work', async (t) => {
  // This fake observer only activates cooperative scheduling. Browser specs
  // separately verify actual DOM geometry, resizing and slot content.
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'ResizeObserver');
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'ResizeObserver', previous);
    else Reflect.deleteProperty(globalThis, 'ResizeObserver');
  });
  const stopA = observeMeasuredBorderBoxSizes([], () => {});
  const stopB = observeMeasuredBorderBoxSizes([], () => {});
  t.after(() => {
    stopA();
    stopB();
  });
  assert.equal(hasMeasuredPeers(), true);
  const scheduled: (() => void)[] = [];
  const measure = createLayoutMeasurer((flush) => scheduled.push(flush));
  const order: string[] = [];
  function* task(id: string): Generator<() => number, number, number> {
    order.push(`write-${id}`);
    const value = yield () => {
      order.push(`read-${id}`);
      return 42;
    };
    order.push(`write-final-${id}`);
    return value;
  }
  const a = measure(
    task('a'),
    () => true,
    () => {
      order.push('commit-a');
    },
  );
  const b = measure(
    task('b'),
    () => true,
    () => {
      order.push('commit-b');
    },
  );
  const stale = measure(
    task('stale'),
    () => false,
    () => {
      assert.fail('stale commit');
    },
  );
  assert.equal(scheduled.length, 1);
  scheduled[0]();
  assert.deepEqual(await Promise.all([a, b, stale]), [42, 42, null]);
  assert.deepEqual(order, [
    'write-a',
    'write-b',
    'read-a',
    'read-b',
    'write-final-a',
    'write-final-b',
    'commit-a',
    'commit-b',
  ]);
});
