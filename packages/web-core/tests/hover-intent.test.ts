import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createHoverIntent } from '../dist/trigger/hover-intent.js';

function harness(side = 'right') {
  const listeners = new Map<string, Set<(event: MouseEvent) => void>>();
  const timers = new Map<number, () => void>();
  let id = 0;
  const listen = (name: string, callback: (event: MouseEvent) => void) => {
    const set = listeners.get(name) ?? new Set();
    set.add(callback);
    listeners.set(name, set);
  };
  const remove = (name: string, callback: (event: MouseEvent) => void) =>
    listeners.get(name)?.delete(callback);
  const win = {
    addEventListener: listen,
    removeEventListener: remove,
    setTimeout: (callback: () => void) => {
      timers.set(++id, callback);
      return id;
    },
    clearTimeout: (timer: number) => timers.delete(timer),
  };
  const doc = { defaultView: win, addEventListener: listen, removeEventListener: remove };
  function element(x: number, y: number, width: number, height: number) {
    const rect = { x, y, width, height, left: x, top: y, right: x + width, bottom: y + height };
    const node = {
      ownerDocument: doc,
      isConnected: true,
      getBoundingClientRect: () => rect,
      getClientRects: () => [rect],
      contains: (target: unknown) => target === node,
    };
    return node as unknown as HTMLElement;
  }
  const source = element(100, 100, 100, 40);
  const target =
    side === 'right'
      ? element(220, 80, 120, 220)
      : side === 'left'
        ? element(-40, 80, 120, 220)
        : side === 'bottom'
          ? element(80, 160, 220, 120)
          : element(80, -40, 220, 120);
  const sibling = element(100, 140, 100, 40);
  const driver = createHoverIntent({ getReference: () => source, getFloating: () => target });
  const other = createHoverIntent({ getReference: () => sibling, getFloating: () => null });
  const mouse = (x: number, y: number, node: unknown = source) =>
    ({
      clientX: x,
      clientY: y,
      target: node,
      relatedTarget: null,
    }) as unknown as MouseEvent;
  const dispatch = (name: string, event = mouse(0, 0, doc)) => {
    for (const callback of [...(listeners.get(name) ?? [])]) callback(event);
  };
  return {
    driver,
    other,
    source,
    target,
    sibling,
    mouse,
    dispatch,
    timers,
    listeners,
    pause: () => {
      for (const callback of [...timers.values()]) callback();
    },
  };
}

test('diagonal travel defers sibling activation until leaving the polygon', () => {
  const h = harness();
  let closed = 0;
  let opened = 0;
  h.driver.leave(h.mouse(180, 140), () => closed++);
  h.other.enter(h.mouse(190, 155, h.sibling), () => opened++);
  h.dispatch('mousemove', h.mouse(205, 190, h.sibling));
  assert.equal(closed, 0);
  assert.equal(opened, 0);
  h.dispatch('mousemove', h.mouse(170, 200, h.sibling));
  assert.equal(closed, 1);
  assert.equal(opened, 1);
  assert.equal(h.timers.size, 0);
});

test('landing discards the pending sibling, while a pause commits it', () => {
  for (const landed of [true, false]) {
    const h = harness();
    const calls: string[] = [];
    h.driver.leave(h.mouse(180, 140), () => calls.push('close'));
    h.other.enter(h.mouse(190, 155, h.sibling), () => calls.push('open'));
    if (landed) h.dispatch('mousemove', h.mouse(230, 200, h.target));
    else h.pause();
    assert.deepEqual(calls, landed ? [] : ['close', 'open']);
    assert.equal(h.timers.size, 0);
  }
});

test('left, top and bottom targets protect the same diagonal path', () => {
  for (const [side, start, next] of [
    ['left', [100, 130], [90, 145]],
    ['top', [160, 100], [180, 90]],
    ['bottom', [160, 140], [180, 150]],
  ] as const) {
    const h = harness(side);
    let closed = false;
    h.driver.leave(h.mouse(...start), () => {
      closed = true;
    });
    assert.equal(h.driver.blocks(h.mouse(...next)), true, side);
    h.dispatch('mousemove', h.mouse(...next, h.sibling));
    assert.equal(closed, false, side);
    h.driver.cancel();
    assert.equal(h.timers.size, 0);
  }
});

test('opposite-side departures close without a corridor', () => {
  const h = harness();
  let closed = false;
  h.driver.leave(h.mouse(100, 120), () => {
    closed = true;
  });
  assert.equal(closed, true);
  assert.equal(h.timers.size, 0);
});

test('cancel and keyboard release listeners without stale activation', () => {
  for (const action of ['cancel', 'keydown']) {
    const h = harness();
    let called = false;
    h.driver.leave(h.mouse(180, 140), () => {
      called = true;
    });
    h.other.enter(h.mouse(190, 155, h.sibling), () => {
      called = true;
    });
    if (action === 'cancel') h.driver.cancel();
    else h.dispatch(action);
    h.pause();
    assert.equal(called, false);
    assert.equal(h.timers.size, 0);
    assert.equal(
      [...h.listeners.values()].every((set) => set.size === 0),
      true,
    );
  }
});

test('clicking a crossed sibling releases protection immediately', () => {
  const h = harness();
  const calls: string[] = [];
  h.driver.leave(h.mouse(180, 140), () => calls.push('close'));
  h.other.enter(h.mouse(190, 155, h.source), () => calls.push('open'));
  h.dispatch('pointerdown', h.mouse(190, 155, h.sibling));
  assert.deepEqual(calls, ['close', 'open']);
  assert.equal(h.timers.size, 0);
});

test('scroll closes and a departed sibling cannot activate later', () => {
  const h = harness();
  let closed = 0;
  let opened = 0;
  h.driver.leave(h.mouse(180, 140), () => closed++);
  h.other.enter(h.mouse(190, 155, h.sibling), () => opened++);
  h.other.cancel();
  h.dispatch('scroll');
  assert.equal(closed, 1);
  assert.equal(opened, 0);
});
