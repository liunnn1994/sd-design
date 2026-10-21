import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';

import type { ColumnResizeState } from '../dist/table/column-resize.js';
const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window'),
  oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
Object.defineProperty(globalThis, 'document', { configurable: true, value: {} });
const { createColumnResizeFoundation } = await import('../dist/table/column-resize.js');
if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow);
else Reflect.deleteProperty(globalThis, 'window');
if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument);
else Reflect.deleteProperty(globalThis, 'document');
function fixture(t: TestContext) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window'),
    target = new EventTarget();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: target });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const events: unknown[][] = [];
  const state: { -readonly [Key in keyof ColumnResizeState]: ColumnResizeState[Key] } = {
    thElements: { name: { getBoundingClientRect: () => ({ x: 10.25 }) } as HTMLElement },
    resizingColumn: '',
    columnWidth: Object.create(null),
  };
  const controller = createColumnResizeFoundation(state, function (name, field, width) {
    assert.equal(this, undefined);
    assert.equal(state.columnWidth[field], width);
    events.push([name, field, width]);
  });
  const start = (field = 'name') => {
    const event = new Event('mousedown', { cancelable: true });
    controller.handleThMouseDown(field, event as MouseEvent);
    assert.equal(event.defaultPrevented, true);
  };
  const move = (clientX: number) => {
    const event = new Event('mousemove');
    Object.defineProperty(event, 'clientX', { value: clientX });
    target.dispatchEvent(event);
  };
  return { state, events, target, controller, start, move };
}
test('native movement rounds upward, clamps 40px and publishes after committing width', (t) => {
  const { state, events, controller, start, move } = fixture(t);
  start();
  move(91);
  assert.equal(state.columnWidth.name, 81);
  move(20);
  assert.equal(state.columnWidth.name, 40);
  assert.deepEqual(events, [
    ['columnResize', 'name', 81],
    ['columnResize', 'name', 40],
  ]);
  controller.dispose();
});
test('mouseup and contextmenu both stop native movement and clear active field', (t) => {
  const { state, target, controller, start, move, events } = fixture(t);
  for (const end of ['mouseup', 'contextmenu']) {
    events.length = 0;
    start();
    move(100);
    target.dispatchEvent(new Event(end));
    assert.equal(state.resizingColumn, '');
    move(200);
    assert.equal(events.length, 1);
    controller.dispose();
  }
});
test('active unmount disconnects listeners while inactive disposal does not read window', (t) => {
  const { state, controller, start, move, events } = fixture(t);
  start();
  controller.dispose();
  assert.equal(state.resizingColumn, '');
  move(100);
  assert.deepEqual(events, []);
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    get() {
      throw Error('window read');
    },
  });
  try {
    controller.dispose();
  } finally {
    Object.defineProperty(globalThis, 'window', previous!);
  }
});
test('live element replacement and absent header lookup preserve active-drag semantics', (t) => {
  const { state, controller, start, move, events } = fixture(t);
  start();
  state.thElements = {};
  move(100);
  assert.deepEqual(events, []);
  state.thElements = { name: { getBoundingClientRect: () => ({ x: 50 }) } as HTMLElement };
  move(100);
  assert.equal(state.columnWidth.name, 50);
  controller.dispose();
});
test('prototype-like dataIndex uses caller-owned null-prototype width records safely', (t) => {
  const { state, controller, start, move } = fixture(t);
  state.thElements = Object.create(null);
  state.thElements.__proto__ = { getBoundingClientRect: () => ({ x: 0 }) } as HTMLElement;
  start('__proto__');
  move(88.1);
  assert.equal(state.columnWidth.__proto__, 89);
  assert.equal(Object.getPrototypeOf(state.columnWidth), null);
  controller.dispose();
});
test('repeated drags keep one listener per event and retain previously assigned widths', (t) => {
  const { state, controller, start, move, events } = fixture(t);
  start();
  start();
  move(100);
  assert.equal(events.length, 1);
  controller.handleThMouseUp();
  start();
  move(120);
  assert.equal(events.length, 2);
  assert.equal(state.columnWidth.name, 110);
  controller.dispose();
});
