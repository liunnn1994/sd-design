import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createResizeObserverFoundation } from '../dist/resize-observer/foundation.js';

function setup() {
  const listeners: ((entries: readonly ResizeObserverEntry[]) => void)[] = [];
  const stopped: number[] = [];
  const frames = new Map<number, () => void>();
  const cancelled: number[] = [];
  const delivered: ResizeObserverEntry[] = [];
  let nextFrame = 0;
  let onResize: (() => void) | undefined;
  const foundation = createResizeObserverFoundation({
    observe(_target, listener) {
      const id = listeners.push(listener) - 1;
      return () => stopped.push(id);
    },
    requestFrame(callback) {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      cancelled.push(id);
    },
    onResize(entry) {
      delivered.push(entry);
      onResize?.();
    },
  });
  return {
    foundation,
    listeners,
    stopped,
    frames,
    cancelled,
    delivered,
    onResize(callback: () => void) {
      onResize = callback;
    },
  };
}
const element = {} as Element;
const first = { target: element } as ResizeObserverEntry;
const latest = { target: element, contentRect: { width: 200 } } as ResizeObserverEntry;

test('native resize delivery is deferred and bursts publish the latest first entry once', () => {
  const s = setup();
  s.foundation.observe(element);
  s.listeners[0]([first]);
  s.listeners[0]([latest, first]);
  assert.deepEqual(s.delivered, []);
  assert.equal(s.frames.size, 1);
  s.frames.get(0)!();
  assert.deepEqual(s.delivered, [latest]);
  s.listeners[0]([first]);
  s.frames.get(1)!();
  assert.deepEqual(s.delivered, [latest, first]);
});

test('target replacement disconnects and rejects both queued frames and stale native callbacks', () => {
  const s = setup();
  s.foundation.observe(element);
  s.listeners[0]([first]);
  s.foundation.observe({} as Element);
  assert.deepEqual(s.stopped, [0]);
  assert.deepEqual(s.cancelled, [0]);
  s.listeners[0]([first]);
  s.listeners[1]([latest]);
  s.frames.get(0)!(); // Even a cancelled callback cannot clear the new target's frame.
  s.listeners[1]([latest]);
  assert.equal(s.frames.size, 2);
  s.frames.get(1)!();
  assert.deepEqual(s.delivered, [latest]);
});

test('disconnect removes observation and pending work including a zero-valued frame handle', () => {
  const s = setup();
  s.foundation.observe(element);
  s.listeners[0]([first]);
  s.foundation.disconnect();
  s.foundation.disconnect();
  s.frames.get(0)!();
  s.listeners[0]([latest]);
  assert.deepEqual(s.cancelled, [0]);
  assert.deepEqual(s.stopped, [0]);
  assert.deepEqual(s.delivered, []);
});

test('reentrant resize listeners may replace the observed target and schedule another frame', () => {
  const s = setup();
  s.foundation.observe(element);
  s.onResize(() => {
    s.foundation.observe({} as Element);
    s.listeners[1]([latest]);
  });
  s.listeners[0]([first]);
  s.frames.get(0)!();
  assert.deepEqual(s.cancelled, []);
  assert.deepEqual(s.delivered, [first]);
  s.onResize(() => {});
  s.frames.get(1)!();
  assert.deepEqual(s.delivered, [first, latest]);
});

test('construction is inert and an absent target releases a previous subscription', () => {
  const s = setup();
  assert.equal(s.listeners.length, 0);
  s.foundation.observe(element);
  s.foundation.observe(undefined);
  assert.deepEqual(s.stopped, [0]);
  s.listeners[0]([first]);
  assert.equal(s.frames.size, 0);
});
