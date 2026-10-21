import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TourConfig, TourController, TourPopoverDom, TourState } from '../src/tour/types.ts';

import { driver } from '../dist/tour/engine.js';
import { createTourPopover, getTourConfig, getTourSlotProps } from '../dist/tour/foundation.js';

function tour(
  slots: { title?: unknown; description?: unknown; footer?: unknown; progress?: unknown } = {},
) {
  let id = 0;
  let observed: (() => void) | undefined;
  const calls: string[] = [];
  const frames = new Map<number, () => void>();
  const nodes = Object.fromEntries(
    ['wrapper', 'title', 'description', 'footer', 'progress'].map((name) => [
      name,
      {
        isConnected: true,
        style: { display: '' },
        replaceChildren() {
          calls.push(name);
        },
      },
    ]),
  );
  const state = {
    popover: nodes as unknown as TourPopoverDom,
    __transitionCallback: undefined as (() => void) | undefined,
  };
  let active = true;
  const instance = {
    getState: (key?: string) => (key === 'popover' ? state.popover : state),
    isActive: () => active,
    refresh: () => calls.push('refresh'),
    destroy: () => calls.push('destroy'),
  } as unknown as TourController;
  const adapter = {
    driver: instance,
    slots,
    popover: undefined as TourPopoverDom | undefined,
    requestFrame(callback: () => void) {
      frames.set(++id, callback);
      return id;
    },
    cancelFrame(key: number) {
      frames.delete(key);
      calls.push('cancel');
    },
    observe(callback: () => void) {
      observed = callback;
      calls.push('observe');
      return () => calls.push('disconnect');
    },
  };
  return {
    f: createTourPopover(adapter),
    adapter,
    calls,
    nodes,
    state,
    frames,
    sync() {
      assert.ok(observed);
      observed();
    },
    frame() {
      const entries = [...frames];
      frames.clear();
      entries.forEach(([, callback]) => callback());
    },
    setActive(value: boolean) {
      active = value;
    },
  };
}

test('Tour configuration drops only undefined values and uses the native no-DOM engine defaults', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const hook = () => {};
  const props = {
    animate: undefined,
    allowClose: false,
    duration: 0,
    nextBtnText: '',
    onNextClick: hook,
  } as unknown as TourConfig;
  const config = getTourConfig(props);
  assert.deepEqual(config, { allowClose: false, duration: 0, nextBtnText: '', onNextClick: hook });
  const instance = driver(config);
  assert.equal(instance.isActive(), false);
  assert.equal(instance.getConfig().onNextClick, hook);
  assert.equal(instance.getConfig().allowClose, false);
  assert.equal(instance.getConfig().duration, 0);
});

test('Tour slot scope retains native driver/step/state/element identities and undefined index', () => {
  const step = { popover: { title: 'Native' } };
  const state = {} as TourState;
  const element = {} as Element;
  let hasStep = true;
  const instance = {
    getActiveStep: () => (hasStep ? step : undefined),
    getActiveIndex: () => undefined,
    getState: () => state,
    getActiveElement: () => element,
  } as unknown as TourController;
  assert.equal(getTourSlotProps(instance, undefined), undefined);
  const scope = getTourSlotProps(instance, {} as TourPopoverDom)!;
  assert.equal(scope.driver, instance);
  assert.equal(scope.step, step);
  assert.equal(scope.state, state);
  assert.equal(scope.element, element);
  assert.equal(scope.index, undefined);
  hasStep = false;
  assert.equal(getTourSlotProps(instance, {} as TourPopoverDom), undefined);
});

test('Tour observes only after connect and replaces only supplied slot targets once per popover', () => {
  const { f, sync, adapter, calls, nodes } = tour({
    title: () => {},
    description: () => {},
    progress: () => {},
  });
  assert.deepEqual(calls, []);
  f.connect();
  sync();
  assert.deepEqual(calls, ['observe', 'title', 'description', 'progress']);
  assert.equal(adapter.popover, nodes);
  assert.equal(nodes.title.style.display, 'block');
  assert.equal(nodes.progress.style.display, 'block');
  assert.equal(nodes.footer.style.display, 'flex');
  sync();
  assert.equal(calls.length, 4);
});

test('Tour footer slot owns the footer and suppresses the progress slot target', () => {
  const { f, sync, calls, nodes } = tour({ footer: () => {}, progress: () => {} });
  f.connect();
  sync();
  assert.deepEqual(calls, ['observe', 'footer']);
  assert.equal(nodes.footer.style.display, 'flex');
  assert.equal(nodes.progress.style.display, '');
});

test('Tour refresh coalesces frames and defers geometry until the native transition ends', () => {
  const { f, sync, frame, state, calls, frames } = tour();
  f.connect();
  sync();
  f.scheduleRefresh();
  f.scheduleRefresh();
  assert.equal(frames.size, 1);
  state.__transitionCallback = () => {};
  frame();
  assert.equal(frames.size, 1);
  assert.deepEqual(calls, ['observe']);
  state.__transitionCallback = undefined;
  frame();
  assert.equal(frames.size, 0);
  assert.deepEqual(calls, ['observe', 'refresh']);
});

test('Tour detach and inactive drivers suppress stale refresh without retaining an attached slot target', () => {
  const { f, sync, frame, nodes, adapter, calls, setActive } = tour();
  f.connect();
  sync();
  nodes.wrapper.isConnected = false;
  sync();
  assert.equal(adapter.popover, undefined);
  frame();
  assert.deepEqual(calls, ['observe']);
  nodes.wrapper.isConnected = true;
  sync();
  setActive(false);
  frame();
  assert.deepEqual(calls, ['observe']);
});

test('Tour unmount disconnects, cancels its pending frame, then destroys the untouched native controller', () => {
  const { f, sync, frames, calls } = tour();
  f.connect();
  sync();
  f.dispose();
  assert.equal(frames.size, 0);
  assert.deepEqual(calls, ['observe', 'disconnect', 'cancel', 'destroy']);
  const unmounted = tour();
  unmounted.f.dispose();
  assert.deepEqual(unmounted.calls, ['destroy']);
});
