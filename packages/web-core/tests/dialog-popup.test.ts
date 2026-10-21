import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { BeforeOk } from '../src/dialog/confirmation.ts';

import { createConfirmationFoundation } from '../dist/dialog/confirmation.js';
import { createDialogDrag } from '../dist/dialog/drag.js';
import {
  createDialogFoundation,
  createDialogMask,
  clickDrawerMask,
} from '../dist/dialog/foundation.js';
import {
  createModalInstance,
  createDrawerInstance,
  createModalRegistry,
} from '../dist/dialog/imperative.js';
import { applyModalLayout, applyDrawerLayout } from '../dist/dialog/layout.js';
import { PopupManager, createPopupEntry } from '../dist/popup/manager.js';
import { createOverflowController } from '../dist/popup/overflow.js';

function confirmation() {
  const state = { visible: true, loading: false };
  const calls: unknown[][] = [];
  const callbacks: { onBeforeOk?: BeforeOk; onBeforeCancel?: () => boolean } = {};
  const foundation = createConfirmationFoundation<[Event]>({
    callbacks,
    get loading() {
      return state.loading;
    },
    setLoading(value) {
      state.loading = value;
      calls.push(['loading', value]);
    },
    setVisible(value) {
      state.visible = value;
      calls.push(['inner', value]);
    },
    onVisibleChange(value) {
      calls.push(['visible', value]);
    },
    onOk(event) {
      calls.push(['ok', event]);
    },
    onCancel(event) {
      calls.push(['cancel', event]);
    },
  });
  return { state, calls, callbacks, foundation };
}

test('confirmation preserves callback receiver, synchronous done and Promise first-resolution rules', async () => {
  const { state, calls, callbacks, foundation } = confirmation();
  const event = new Event('click');
  callbacks.onBeforeOk = function (done) {
    assert.equal(this, callbacks);
    done(false);
    return Promise.resolve(true);
  };
  await foundation.ok(event);
  assert.equal(state.visible, true);
  assert.equal(state.loading, false);
  assert.deepEqual(calls, [
    ['loading', true],
    ['loading', false],
  ]);
  callbacks.onBeforeOk = (done) => {
    done(true);
  };
  await foundation.ok(event);
  assert.deepEqual(calls.slice(-4), [
    ['ok', event],
    ['loading', false],
    ['inner', false],
    ['visible', false],
  ]);
});

test('confirmation blocks thrown/rejected/false results but resolves an empty Promise as approval', async () => {
  const { state, calls, callbacks, foundation } = confirmation();
  for (const callback of [
    () => {
      throw new Error('blocked');
    },
    () => Promise.reject('blocked'),
    () => false,
  ]) {
    callbacks.onBeforeOk = callback;
    await foundation.ok(new Event('click'));
    assert.equal(state.visible, true);
    assert.equal(state.loading, false);
    assert.equal(
      calls.some(([type]) => type === 'ok'),
      false,
    );
  }
  callbacks.onBeforeOk = () => Promise.resolve();
  await foundation.ok(new Event('click'));
  assert.equal(state.visible, false);
});

test('closing and reopening invalidates callback results without cancelling a newer pending confirmation', async () => {
  const { state, callbacks, calls, foundation } = confirmation();
  let finish!: (value: boolean) => void;
  callbacks.onBeforeOk = (done) => {
    finish = done;
  };
  const old = foundation.ok(new Event('old'));
  const oldFinish = finish;
  foundation.close();
  foundation.changeVisible(true);
  const current = foundation.ok(new Event('new'));
  oldFinish(true);
  await old;
  assert.equal(state.visible, true);
  assert.equal(state.loading, true);
  assert.equal(
    calls.some(([type]) => type === 'ok'),
    false,
  );
  finish(true);
  await current;
  assert.equal(state.visible, false);
  assert.equal(state.loading, false);
});

test('cancel only vetoes explicit false and does not swallow cancellation exceptions', () => {
  const { callbacks, calls, foundation } = confirmation();
  const event = new Event('cancel');
  callbacks.onBeforeCancel = () => false;
  foundation.cancel(event);
  assert.deepEqual(calls, []);
  callbacks.onBeforeCancel = () => {
    throw new Error('cancel failed');
  };
  assert.throws(() => foundation.cancel(event), /cancel failed/);
  callbacks.onBeforeCancel = (() => undefined) as unknown as () => boolean;
  foundation.cancel(event);
  assert.deepEqual(calls, [
    ['cancel', event],
    ['inner', false],
    ['visible', false],
  ]);
});

test('dialog keeps lifecycle order and rejects stale transition notifications', () => {
  const calls: string[] = [];
  const state = { visible: true, inner: false, esc: true, last: false };
  const f = createDialogFoundation({
    get visible() {
      return state.visible;
    },
    get inner() {
      return state.inner;
    },
    get escToClose() {
      return state.esc;
    },
    setInner(value) {
      state.inner = value;
      calls.push('inner');
    },
    setMounted(value) {
      calls.push(`mounted:${value}`);
    },
    isLastDialog: () => state.last,
    cancel() {
      calls.push('cancel');
    },
    invalidate() {
      calls.push('invalidate');
    },
    onBeforeOpen() {
      calls.push('beforeOpen');
    },
    onBeforeClose() {
      calls.push('beforeClose');
    },
    onOpen() {
      calls.push('open');
    },
    onClose() {
      calls.push('close');
    },
    beforeOpening() {
      calls.push('prepare');
    },
    beforeClosed() {
      calls.push('resetPosition');
    },
    lockOverflow() {
      calls.push('lock');
    },
    resetOverflow() {
      calls.push('unlock');
    },
    addKeyListener() {
      calls.push('listen');
    },
    removeKeyListener() {
      calls.push('unlisten');
    },
    activateFocus() {
      calls.push('focus');
    },
    deactivateFocus() {
      calls.push('blur');
    },
    releasePopup() {
      calls.push('release');
    },
  });
  f.syncVisible(true);
  assert.deepEqual(calls.splice(0), [
    'inner',
    'beforeOpen',
    'mounted:true',
    'prepare',
    'lock',
    'listen',
    'focus',
  ]);
  f.closed();
  assert.deepEqual(calls, []);
  f.escape({ key: 'Escape' } as KeyboardEvent);
  assert.deepEqual(calls, []);
  state.last = true;
  f.escape({ key: 'Escape' } as KeyboardEvent);
  assert.deepEqual(calls.splice(0), ['cancel']);
  state.visible = false;
  f.syncVisible(false);
  assert.deepEqual(calls.splice(0), ['inner', 'invalidate', 'beforeClose', 'unlisten', 'blur']);
  f.opened();
  f.closed();
  assert.deepEqual(calls.splice(0), ['resetPosition', 'mounted:false', 'unlock', 'close']);
  f.dispose();
  assert.deepEqual(calls, ['invalidate', 'release', 'unlock', 'unlisten']);
});

test('Modal mask tracks down target while Drawer mask only checks closable', () => {
  const mask = new EventTarget(),
    wrapper = new EventTarget(),
    content = new EventTarget();
  let count = 0;
  let enabled = true;
  const f = createDialogMask({
    get mask() {
      return enabled;
    },
    closable: true,
    isMaskTarget: (event) => event.target === mask,
    isWrapperTarget: (event) => event.target === wrapper,
    cancel() {
      count++;
    },
  });
  const eventAt = (target: EventTarget) => {
    const event = new Event('click');
    target.dispatchEvent(event);
    return event;
  };
  f.click(eventAt(content));
  f.click(eventAt(mask));
  assert.equal(count, 1);
  f.down(eventAt(wrapper));
  f.click(eventAt(wrapper));
  assert.equal(count, 2);
  f.down(eventAt(wrapper));
  f.reset();
  f.click(eventAt(wrapper));
  enabled = false;
  f.click(eventAt(mask));
  assert.equal(count, 2);
  clickDrawerMask(false, eventAt(mask), () => count++);
  clickDrawerMask(true, eventAt(mask), () => count++);
  assert.equal(count, 3);
});

test('popup stack retains message floors, shared ordering and idempotent entry cleanup', () => {
  const manager = new PopupManager();
  function entry(type: 'popup' | 'dialog' | 'message') {
    let z = 0;
    return {
      f: createPopupEntry(
        type,
        {
          get zIndex() {
            return z;
          },
          setZIndex(value) {
            z = value;
          },
        },
        manager,
      ),
      get z() {
        return z;
      },
    };
  }
  const message = entry('message'),
    lower = entry('dialog'),
    upper = entry('dialog');
  message.f.open();
  lower.f.open();
  upper.f.open();
  assert.equal(message.z, 1003);
  assert.equal(lower.z, 1004);
  assert.equal(upper.z, 1005);
  lower.f.open();
  assert.equal(lower.f.isLastDialog(), false);
  assert.equal(upper.f.isLastDialog(), true);
  upper.f.close();
  upper.f.close();
  assert.equal(lower.f.isLastDialog(), true);
  const popup = entry('popup');
  popup.f.open();
  assert.equal(popup.z, 1005);
  assert.equal(popup.f.isLastDialog(), false);
});

test('Modal closes and notifies once while direct destroy remains silent; Drawer notifies after disposal', async () => {
  const calls: string[] = [];
  const registry = createModalRegistry();
  const adapter = {
    callbacks: {
      onClose() {
        calls.push('close');
      },
      onOk() {
        calls.push('ok');
      },
    },
    setVisible() {
      calls.push('hide');
    },
    destroy() {
      calls.push('destroy');
    },
    remove() {
      registry.remove(modal.destroy);
    },
    afterRender: () => Promise.resolve(),
  };
  const modal = createModalInstance(adapter);
  registry.add(modal.destroy);
  modal.ok();
  modal.close();
  await modal.afterClose();
  registry.destroyAll();
  assert.deepEqual(calls.splice(0), ['hide', 'close', 'ok', 'hide', 'destroy']);
  const silent = createModalInstance(adapter);
  silent.destroy();
  silent.close();
  assert.deepEqual(calls.splice(0), ['destroy']);
  const drawer = createDrawerInstance(adapter);
  drawer.close();
  assert.deepEqual(calls.splice(0), ['hide']);
  await drawer.afterClose();
  assert.deepEqual(calls, ['destroy', 'close']);
  registry.configure({ simple: false });
  registry.configure({});
  assert.equal(registry.config.simple, false);
});

test('dialog layout retains zero, fullscreen, original style and positioned dimensions', () => {
  assert.deepEqual(
    applyModalLayout(
      { width: '70%', transform: 'scale(1)' },
      { width: 0, fullscreen: false, alignCenter: false, top: 0, position: undefined },
    ),
    { width: '70%', transform: 'scale(1)', top: '0px' },
  );
  assert.deepEqual(
    applyModalLayout(
      {},
      { width: 200, fullscreen: true, alignCenter: true, top: 30, position: [4, -2] },
    ),
    { transform: 'translate(4px, -2px)' },
  );
  assert.deepEqual(applyDrawerLayout({}, 'left', 0, 100), { width: '0px' });
  assert.deepEqual(applyDrawerLayout({ width: '50%' }, 'bottom', 50, '30vh'), {
    width: '50%',
    height: '30vh',
  });
});

test('overflow ownership follows the acquired container and restores styles only after the final owner', () => {
  const element = {
    style: { overflow: 'auto', width: '80%', boxSizing: 'content-box' },
    offsetWidth: 100,
  } as unknown as HTMLElement;
  const next = {
    style: { overflow: 'scroll', width: '', boxSizing: '' },
    offsetWidth: 80,
  } as unknown as HTMLElement;
  let current = element;
  const adapter = {
    get element() {
      return current;
    },
    getScrollBarWidth: () => 10,
    isScroll: () => true,
  };
  const first = createOverflowController(adapter),
    second = createOverflowController(adapter);
  first.lock();
  second.lock();
  assert.equal(element.style.width, '90px');
  current = next;
  first.syncElement();
  assert.equal(element.style.overflow, 'hidden');
  second.reset();
  assert.equal(element.style.overflow, 'auto');
  assert.equal(element.style.width, '80%');
  first.reset();
  first.reset();
  assert.equal(next.style.overflow, 'scroll');
});

test('dialog drag clamps coordinates, ends on native contextmenu and removes listeners', (t) => {
  const target = new EventTarget();
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: target });
  t.after(() => {
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const positions: [number, number][] = [];
  const f = createDialogDrag({
    modal: {
      getBoundingClientRect: () => ({ top: 40, left: 20, width: 60, height: 40 }),
      offsetTop: 30,
    } as unknown as HTMLElement,
    wrapper: {
      getBoundingClientRect: () => ({ top: 0, left: 0 }),
      clientWidth: 100,
      clientHeight: 80,
    } as unknown as HTMLElement,
    draggable: true,
    alignCenter: false,
    setPosition(value) {
      positions.push(value);
    },
  });
  const mouse = (type: string, x: number, y: number) =>
    Object.assign(new Event(type), { x, y }) as MouseEvent;
  f.down(mouse('mousedown', 10, 10));
  target.dispatchEvent(mouse('mousemove', -100, -100));
  target.dispatchEvent(mouse('mousemove', 100, 100));
  assert.deepEqual(positions, [
    [0, -30],
    [40, 10],
  ]);
  target.dispatchEvent(new Event('contextmenu'));
  target.dispatchEvent(mouse('mousemove', 20, 20));
  assert.equal(positions.length, 2);
  f.up();
});
