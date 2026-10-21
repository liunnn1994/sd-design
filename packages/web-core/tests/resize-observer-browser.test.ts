import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';

const descriptors = Object.fromEntries(
  ['ResizeObserver', 'window'].map((key) => [
    key,
    Object.getOwnPropertyDescriptor(globalThis, key),
  ]),
);
const frames = new Map<number, () => void>();
let frameId = 0;
class NativeObserver {
  static instances: NativeObserver[] = [];
  observed: Element[] = [];
  disconnects = 0;
  readonly callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    NativeObserver.instances.push(this);
  }
  observe(target: Element) {
    this.observed.push(target);
  }
  disconnect() {
    this.disconnects++;
  }
  deliver(entry: ResizeObserverEntry) {
    this.callback([entry], this as unknown as ResizeObserver);
  }
}
const browser = {
  requestAnimationFrame(callback: () => void) {
    const id = ++frameId;
    frames.set(id, callback);
    return id;
  },
  cancelAnimationFrame(id: number) {
    frames.delete(id);
  },
};
Object.defineProperty(globalThis, 'ResizeObserver', { value: NativeObserver, configurable: true });
Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
const { createResizeObserverController } = await import('../dist/resize-observer/browser.js');
function restore() {
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
}
restore();
beforeEach(() => {
  frames.clear();
  NativeObserver.instances = [];
  Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
});
afterEach(restore);
function paint() {
  const pending = [...frames];
  for (const [id, callback] of pending) {
    if (frames.delete(id)) callback();
  }
}
const element = (id: string) => ({ id }) as unknown as Element;
const entry = (target: Element) => ({ target }) as ResizeObserverEntry;

test('browser controller registers outside resize delivery then publishes on a separate frame', () => {
  const target = element('first'),
    notifications: ResizeObserverEntry[] = [];
  const controller = createResizeObserverController((value) => notifications.push(value));
  controller.observe(target);
  const observer = NativeObserver.instances[0]!;
  assert.deepEqual(observer.observed, []);
  paint();
  assert.deepEqual(observer.observed, [target]);
  const first = entry(target),
    latest = entry(target);
  observer.deliver(first);
  observer.deliver(latest);
  assert.deepEqual(notifications, []);
  paint();
  assert.deepEqual(notifications, [latest]);
  controller.disconnect();
});

test('disconnect before registration cancels the subscription and closes the observer', () => {
  const controller = createResizeObserverController(() => assert.fail('Unexpected delivery'));
  controller.observe(element('first'));
  const observer = NativeObserver.instances[0]!;
  controller.disconnect();
  paint();
  assert.deepEqual(observer.observed, []);
  assert.equal(observer.disconnects, 1);
  assert.equal(frames.size, 0);
});

test('switching queued targets only registers the latest target and rejects stale notifications', () => {
  const first = element('first'),
    second = element('second'),
    notifications: ResizeObserverEntry[] = [];
  const controller = createResizeObserverController((value) => notifications.push(value));
  controller.observe(first);
  const oldObserver = NativeObserver.instances[0]!;
  controller.observe(second);
  const current = NativeObserver.instances[1]!;
  oldObserver.deliver(entry(first));
  paint();
  assert.deepEqual(oldObserver.observed, []);
  assert.equal(oldObserver.disconnects, 1);
  assert.deepEqual(current.observed, [second]);
  assert.deepEqual(notifications, []);
  const next = entry(second);
  current.deliver(next);
  paint();
  assert.deepEqual(notifications, [next]);
  controller.disconnect();
});

test('disconnect cancels a queued resize publication after subscription', () => {
  const target = element('first');
  const controller = createResizeObserverController(() => assert.fail('Unexpected publication'));
  controller.observe(target);
  paint();
  NativeObserver.instances[0]!.deliver(entry(target));
  controller.disconnect();
  paint();
  assert.equal(frames.size, 0);
});

test('undefined targets create no browser observer or scheduled registration', () => {
  const controller = createResizeObserverController(() => assert.fail('Unexpected publication'));
  controller.observe(undefined);
  assert.equal(NativeObserver.instances.length, 0);
  assert.equal(frames.size, 0);
  controller.disconnect();
});

test('reentrant target replacement remains deferred and cleans the previous native observer', () => {
  const first = element('first'),
    second = element('second');
  const controller = createResizeObserverController(() => controller.observe(second));
  controller.observe(first);
  paint();
  const oldObserver = NativeObserver.instances[0]!;
  oldObserver.deliver(entry(first));
  paint();
  const current = NativeObserver.instances[1]!;
  assert.equal(oldObserver.disconnects, 1);
  assert.deepEqual(current.observed, []);
  paint();
  assert.deepEqual(current.observed, [second]);
  controller.disconnect();
});
