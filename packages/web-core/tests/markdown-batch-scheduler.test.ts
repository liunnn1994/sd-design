import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createMarkdownBatchScheduler,
  getMarkdownAdaptiveBatchSize,
} from '../dist/markdown/batch-scheduler.js';

test('Markdown adaptive batches shrink under load, recover when cheap, and retain a quarter-size floor', () => {
  assert.equal(getMarkdownAdaptiveBatchSize(80, 80, 10, 6), 64);
  assert.equal(getMarkdownAdaptiveBatchSize(20, 80, 10, 6), 20);
  assert.equal(getMarkdownAdaptiveBatchSize(20, 80, 1, 6), 24);
  assert.equal(getMarkdownAdaptiveBatchSize(79, 80, 1, 6), 80);
  assert.equal(getMarkdownAdaptiveBatchSize(40, 80, 6, 6), 40);
  assert.equal(getMarkdownAdaptiveBatchSize(1, 1, 10, 0), 1);
});

test('Markdown batches prefer idle work, retain appended progress, reset context and cancel stale callbacks', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(performance, 'now', () => 0);
  const idle = new Map<number, () => void>();
  const frames = new Map<number, () => void>();
  const timeouts: number[] = [];
  let nextId = 0;
  const view = {
    document: { visibilityState: 'visible' },
    requestIdleCallback(callback: () => void, options: { timeout: number }) {
      timeouts.push(options.timeout);
      idle.set(++nextId, callback);
      return nextId;
    },
    cancelIdleCallback: (id: number) => {
      idle.delete(id);
    },
    requestAnimationFrame: (callback: () => void) => {
      frames.set(++nextId, callback);
      return nextId;
    },
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
    },
    setTimeout,
    clearTimeout,
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: view });
  t.after(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });
  const counts: number[] = [];
  let config = {
    enabled: true,
    count: 20,
    datasetKey: 'one',
    initial: 2,
    size: 8,
    delay: 500,
    budget: 6,
    idleTimeout: 120,
  };
  const scheduler = createMarkdownBatchScheduler({
    config: () => config,
    publish: (count) => counts.push(count),
    afterRender: () => Promise.resolve(),
  });
  const run = (queue: Map<number, () => void>) => {
    const [id, callback] = queue.entries().next().value!;
    queue.delete(id);
    callback();
  };
  scheduler.update();
  assert.equal(counts.at(-1), 2);
  assert.deepEqual(timeouts, [120]);
  run(idle);
  assert.equal(counts.at(-1), 4);
  await Promise.resolve();
  run(frames);
  run(idle);
  assert.equal(counts.at(-1), 12);
  await Promise.resolve();
  run(frames);
  const stale = idle.values().next().value!;
  config = { ...config, count: 30 };
  scheduler.update();
  assert.equal(counts.at(-1), 12);
  stale();
  assert.equal(counts.at(-1), 12);
  config = { ...config, datasetKey: 'two' };
  scheduler.update();
  assert.equal(counts.at(-1), 2);
  config = { ...config, initial: 3 };
  scheduler.update();
  assert.equal(counts.at(-1), 3);
  scheduler.flush();
  assert.equal(counts.at(-1), 30);
  assert.equal(idle.size, 0);
  assert.equal(frames.size, 0);
  config = { ...config, count: 5 };
  scheduler.update();
  assert.equal(counts.at(-1), 5);
  config = { ...config, count: 40 };
  scheduler.update();
  assert.equal(counts.at(-1), 5);
  config = { ...config, enabled: false };
  scheduler.update();
  assert.equal(counts.at(-1), 40);
  config = { ...config, enabled: true };
  scheduler.update();
  run(idle);
  assert.equal(counts.at(-1), 6);
  scheduler.cancel();
  await Promise.resolve();
  assert.equal(frames.size, 0);
  assert.equal(idle.size, 0);
  scheduler.cancel();
});

test('Markdown batches use frame then delay when idle callbacks are unavailable', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(performance, 'now', () => 0);
  const frames = new Map<number, () => void>();
  let frameId = 0;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      document: { visibilityState: 'visible' },
      requestAnimationFrame(callback: () => void) {
        frames.set(++frameId, callback);
        return frameId;
      },
      cancelAnimationFrame: (id: number) => {
        frames.delete(id);
      },
      setTimeout,
      clearTimeout,
    },
  });
  t.after(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });
  const counts: number[] = [];
  const scheduler = createMarkdownBatchScheduler({
    config: () => ({
      enabled: true,
      count: 20,
      datasetKey: 'one',
      initial: 2,
      size: 8,
      delay: 30,
      budget: 6,
      idleTimeout: 120,
    }),
    publish: (count) => counts.push(count),
    afterRender: () => Promise.resolve(),
  });
  scheduler.update();
  const runFrame = () => {
    const [id, callback] = frames.entries().next().value!;
    frames.delete(id);
    callback();
  };
  assert.equal(frames.size, 1);
  runFrame();
  t.mock.timers.tick(29);
  assert.equal(counts.at(-1), 2);
  t.mock.timers.tick(1);
  assert.equal(counts.at(-1), 4);
  await Promise.resolve();
  runFrame();
  assert.equal(frames.size, 1);
  scheduler.cancel();
  assert.equal(frames.size, 0);
  t.mock.timers.tick(1000);
  assert.equal(counts.at(-1), 4);
});

test('Markdown batches use delay timers while hidden and release both queued and measuring work', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  t.mock.method(performance, 'now', () => 0);
  const frames = new Map<number, () => void>();
  let frameId = 0;
  const view = {
    document: { visibilityState: 'hidden' },
    requestIdleCallback() {
      throw new Error('Hidden documents must not use idle work');
    },
    requestAnimationFrame(callback: () => void) {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
    },
    setTimeout,
    clearTimeout,
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: view });
  t.after(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });
  let config = {
    enabled: true,
    count: 10,
    datasetKey: 'one',
    initial: 1,
    size: 4,
    delay: 50,
    budget: 6,
    idleTimeout: 80,
  };
  const counts: number[] = [];
  const scheduler = createMarkdownBatchScheduler({
    config: () => config,
    publish: (count) => counts.push(count),
    afterRender: () => Promise.resolve(),
  });
  scheduler.update();
  t.mock.timers.tick(49);
  assert.equal(counts.at(-1), 1);
  t.mock.timers.tick(1);
  assert.equal(counts.at(-1), 2);
  await Promise.resolve();
  assert.equal(frames.size, 1);
  t.mock.timers.tick(80);
  assert.equal(frames.size, 0);
  t.mock.timers.tick(50);
  assert.equal(counts.at(-1), 6);
  await Promise.resolve();
  scheduler.cancel();
  assert.equal(frames.size, 0);
  t.mock.timers.tick(1000);
  assert.equal(counts.at(-1), 6);
  config = { ...config, enabled: false };
  scheduler.update();
  assert.equal(counts.at(-1), 10);
});
