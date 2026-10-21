import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { PreviewImage } from '../src/image/types.ts';

import { createImageDrag } from '../dist/image/drag.js';
import {
  createImageFoundation,
  getImageFooterVisibility,
  getImageLoadFlags,
  getPreviewActions,
  activatePreviewAction,
  activatePreviewArrow,
} from '../dist/image/foundation.js';
import { createImagePreviewGroup, getPreviewSourceMap } from '../dist/image/group.js';
import { createImagePreview } from '../dist/image/preview.js';
import { createOverflowController, createPopupOverflowHidden } from '../dist/popup/overflow.js';

test('image source state, grouped opening and event-before-local writes preserve their distinct guards', () => {
  const state = { src: undefined as string | undefined, preview: true, group: false };
  const calls: unknown[][] = [];
  const f = createImageFoundation({
    get src() {
      return state.src;
    },
    get preview() {
      return state.preview;
    },
    get groupPreview() {
      return state.group;
    },
    id: 8,
    setLoadStatus(value) {
      calls.push(['status', value]);
    },
    previewGroup(id) {
      calls.push(['group', id]);
    },
    onPreviewVisibleChange(value) {
      calls.push(['visible', value]);
    },
    setPreviewVisible(value) {
      calls.push(['local', value]);
    },
  });
  f.syncSource();
  f.loaded();
  f.error();
  assert.deepEqual(calls.splice(0), [['status', 'beforeLoad']]);
  state.src = 'image';
  f.syncSource();
  f.loaded();
  f.error();
  f.click();
  f.close();
  assert.deepEqual(calls.splice(0), [
    ['status', 'loading'],
    ['status', 'loaded'],
    ['status', 'error'],
    ['visible', true],
    ['local', true],
    ['visible', false],
    ['local', false],
  ]);
  state.group = true;
  f.click();
  state.preview = false;
  f.click();
  assert.deepEqual(calls, [['group', 8]]);
  assert.equal(getImageFooterVisibility('Title', undefined, false, false, false), false);
  assert.equal(getImageFooterVisibility('Title', undefined, false, 'never', false), true);
  assert.equal(getImageFooterVisibility('', '', false, 'never', true), false);
  assert.equal(getImageFooterVisibility('', '', true, true, true), false);
  assert.deepEqual(getImageLoadFlags('error'), {
    isBeforeLoad: false,
    isLoading: false,
    isError: true,
    isLoaded: false,
  });
});

function group() {
  const registered = new Map<number, PreviewImage>();
  const state = {
    sources: undefined as string[] | undefined,
    index: 0,
    visible: false,
    infinite: false,
    controlled: false,
  };
  const calls: unknown[][] = [];
  const images = () => (state.sources ? getPreviewSourceMap(state.sources) : registered);
  const f = createImagePreviewGroup({
    get sources() {
      return state.sources;
    },
    registered,
    get images() {
      return images();
    },
    get ids() {
      return [...images().keys()];
    },
    get index() {
      return state.index;
    },
    get visible() {
      return state.visible;
    },
    get infinite() {
      return state.infinite;
    },
    setVisible(value) {
      calls.push(['localVisible', value]);
      if (!state.controlled) state.visible = value;
    },
    onVisibleChange(value) {
      calls.push(['visible', value]);
    },
    setIndex(value) {
      calls.push(['localIndex', value]);
      if (!state.controlled) state.index = value;
    },
    onIndexChange(value) {
      calls.push(['index', value]);
    },
  });
  return { f, state, registered, calls };
}

test('preview group registers duplicate URLs by identity, updates eligibility and skips disabled entries', () => {
  const { f, registered, state } = group();
  const remove = f.register(7, 'same', true);
  f.register(8, 'same', false);
  f.register(9, 'last', true);
  f.register(7, 'changed', true);
  assert.deepEqual([...registered.keys()], [7, 8, 9]);
  assert.equal(f.next(), 2);
  assert.equal(f.prev(), undefined);
  state.index = 2;
  state.infinite = true;
  assert.equal(f.next(), 0);
  assert.equal(f.prev(), 0);
  f.register(8, 'same', true);
  assert.equal(f.prev(), 1);
  remove();
  assert.deepEqual([...registered.keys()], [8, 9]);
  f.preview(9);
  assert.equal(state.index, 1);
  assert.equal(state.visible, true);
});

test('explicit preview sources override registered children including an empty list', () => {
  const { f, state, registered, calls } = group();
  f.register(20, 'child', true);
  state.sources = [];
  f.preview(20);
  assert.equal(state.index, 0);
  assert.equal(f.next(), undefined);
  assert.equal(f.prev(), undefined);
  assert.equal(registered.size, 1);
  state.sources = ['same', 'same'];
  f.preview(20);
  assert.equal(state.index, 0);
  assert.equal(f.next(), 1);
  f.setId(999);
  assert.equal(state.index, -1);
  assert.deepEqual(calls.slice(-2), [
    ['index', -1],
    ['localIndex', -1],
  ]);
});

test('preview group keeps rejected controlled requests repeatable and publishes before local state', () => {
  const { f, state, calls } = group();
  state.controlled = true;
  f.register(10, 'a', true);
  f.register(11, 'b', true);
  f.preview(11);
  f.preview(11);
  assert.deepEqual(calls, [
    ['visible', true],
    ['localVisible', true],
    ['index', 1],
    ['localIndex', 1],
    ['visible', true],
    ['localVisible', true],
    ['index', 1],
    ['localIndex', 1],
  ]);
  f.close();
  assert.equal(calls.length, 8);
});

function preview() {
  const state = {
    visible: true,
    scale: 1,
    rotate: 0,
    defaultScale: 1,
    zoomRate: 1.1,
    esc: true,
    wheel: true,
    mask: true,
    actions: ['zoomIn', 'zoomOut', 'originalSize'],
    label: false,
    last: true,
    editable: false,
  };
  const tasks = new Map<number, () => void>();
  const calls: unknown[][] = [];
  let id = 0;
  const arrows = {
    onPrev() {
      assert.equal(this, arrows);
      calls.push(['prev']);
    },
  };
  const f = createImagePreview({
    get visible() {
      return state.visible;
    },
    get scale() {
      return state.scale;
    },
    get rotate() {
      return state.rotate;
    },
    get defaultScale() {
      return state.defaultScale;
    },
    get zoomRate() {
      return state.zoomRate;
    },
    get escToClose() {
      return state.esc;
    },
    get wheelZoom() {
      return state.wheel;
    },
    get maskClosable() {
      return state.mask;
    },
    get actions() {
      return state.actions;
    },
    get scaleValueVisible() {
      return state.label;
    },
    arrows,
    isLastDialog: () => state.last,
    isEditableTarget: () => state.editable,
    setScale(value) {
      state.scale = value;
      calls.push(['scale', value]);
    },
    setRotate(value) {
      state.rotate = value;
    },
    setVisible(value) {
      calls.push(['local', value]);
      state.visible = value;
    },
    setScaleValueVisible(value) {
      state.label = value;
    },
    setLoadStatus(value) {
      calls.push(['status', value]);
    },
    onClose() {
      calls.push(['close']);
    },
    onVisibleChange(value) {
      calls.push(['visible', value]);
    },
    resetTranslate() {
      calls.push(['resetTranslate']);
    },
    focusAfterRender() {
      calls.push(['focus']);
    },
    focusOnMaskClick() {
      calls.push(['maskFocus']);
    },
    measure: () => ({ wrapper: { width: 600, height: 400 }, image: { width: 40, height: 40 } }),
    schedule(callback) {
      tasks.set(++id, callback);
      return id;
    },
    cancel(handle) {
      tasks.delete(handle);
    },
    releasePopup() {
      calls.push(['release']);
    },
  });
  return { f, state, calls, tasks };
}
const key = (value: string) =>
  Object.assign(new Event('keydown', { cancelable: true }), { key: value }) as KeyboardEvent;

test('preview keyboard keeps dialog ownership, editable filtering and recognized-key default prevention', () => {
  const { f, state, calls } = preview();
  state.last = false;
  const rejected = key('ArrowUp');
  f.keydown(rejected);
  assert.equal(rejected.defaultPrevented, false);
  assert.equal(state.scale, 1);
  state.last = true;
  state.editable = true;
  f.keydown(key('ArrowUp'));
  assert.equal(state.scale, 1);
  state.editable = false;
  state.actions = [];
  const disabled = key('ArrowUp');
  f.keydown(disabled);
  assert.equal(disabled.defaultPrevented, true);
  assert.equal(state.scale, 1);
  f.keydown(key('ArrowLeft'));
  assert.deepEqual(calls, [['prev']]);
  state.editable = true;
  f.keydown(key('Escape'));
  assert.deepEqual(calls.slice(-3), [['close'], ['visible', false], ['local', false]]);
});

test('preview scales discrete steps separately from wheel rate, retains unbounded fullscreen and rotation wrap', () => {
  const { f, state } = preview();
  f.scale('zoomIn');
  assert.equal(state.scale, 1.1);
  f.rotate('counterclockwise');
  assert.equal(state.rotate, 270);
  f.rotate('clockwise');
  assert.equal(state.rotate, 0);
  const wheel = Object.assign(new Event('wheel', { cancelable: true }), {
    deltaY: 0,
    deltaX: -1,
  }) as WheelEvent;
  f.wheel(wheel);
  assert.equal(state.scale, 1.21);
  assert.equal(wheel.defaultPrevented, true);
  state.wheel = false;
  f.wheel(wheel);
  assert.equal(state.scale, 1.21);
  state.scale = 1;
  f.fullScreen();
  assert.equal(state.scale, 15);
  f.scale('zoomIn');
  assert.equal(state.scale, 15);
  state.wheel = true;
  f.wheel(wheel);
  assert.equal(state.scale, 5);
});

test('preview reset and scale label timer retain close/unmount lifetime and event order', () => {
  const { f, state, calls, tasks } = preview();
  state.defaultScale = 2;
  state.rotate = 90;
  f.syncSource();
  assert.equal(state.rotate, 0);
  assert.equal(state.scale, 2);
  assert.deepEqual(calls, [['scale', 2], ['resetTranslate'], ['status', 'loading'], ['focus']]);
  f.changeScale(3);
  f.changeScale(3);
  assert.equal(tasks.size, 1);
  assert.equal(state.label, true);
  f.changeScale(4);
  assert.equal(tasks.size, 1);
  f.close();
  assert.equal(tasks.size, 1);
  f.syncSource();
  assert.equal(state.scale, 4);
  f.dispose();
  assert.equal(tasks.size, 0);
  assert.deepEqual(calls.slice(-4), [['close'], ['visible', false], ['local', false], ['release']]);
});

test('preview mask focuses before target equality guard; toolbar sorts a copy and disabled actions stay inert', () => {
  const { f, state, calls } = preview();
  const mask = new EventTarget();
  const event = new MouseEventLike('click');
  mask.addEventListener('click', (event) => f.maskClick(event as MouseEvent));
  mask.dispatchEvent(event);
  assert.equal(state.visible, false);
  assert.deepEqual(calls, [['maskFocus'], ['close'], ['visible', false], ['local', false]]);
  const actions = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
  assert.deepEqual(getPreviewActions(actions, ['c', 'a']), [actions[2], actions[0]]);
  assert.deepEqual(
    actions.map((item) => item.key),
    ['a', 'b', 'c'],
  );
  let clicks = 0;
  activatePreviewAction(true, event as MouseEvent, () => clicks++);
  activatePreviewAction(false, event as MouseEvent, () => clicks++);
  activatePreviewArrow(event as MouseEvent, undefined);
  assert.equal(clicks, 1);
  assert.equal(event.defaultPrevented, true);
});

class MouseEventLike extends Event {
  button = 0;
  pageX = 0;
  pageY = 0;
  constructor(type: string) {
    super(type, { cancelable: true });
  }
}

test('image drag uses current scale, recenters on release and detaches an interrupted drag', (t) => {
  const target = new EventTarget();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: target });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'window', descriptor);
    else Reflect.deleteProperty(globalThis, 'window');
  });
  const image = Object.assign(new EventTarget(), {
    getBoundingClientRect: () => ({ width: 40, height: 40 }),
  });
  const state = { translate: [0, 0], moving: false, scale: 2 };
  const f = createImageDrag({
    wrapper: {
      getBoundingClientRect: () => ({ width: 100, height: 100 }),
    } as unknown as HTMLElement,
    image: image as unknown as HTMLElement,
    get scale() {
      return state.scale;
    },
    get translate() {
      return state.translate;
    },
    setTranslate(value) {
      state.translate = value;
    },
    setMoving(value) {
      state.moving = value;
    },
  });
  const detach = f.connect(image as unknown as HTMLElement);
  image.dispatchEvent(new MouseEventLike('mousedown'));
  target.dispatchEvent(Object.assign(new MouseEventLike('mousemove'), { pageX: 40, pageY: 20 }));
  assert.deepEqual(state.translate, [20, 10]);
  assert.equal(state.moving, true);
  target.dispatchEvent(new MouseEventLike('mouseup'));
  assert.deepEqual(state.translate, [0, 0]);
  assert.equal(state.moving, false);
  image.dispatchEvent(new MouseEventLike('mousedown'));
  detach();
  target.dispatchEvent(Object.assign(new MouseEventLike('mousemove'), { pageX: 100 }));
  assert.deepEqual(state.translate, [0, 0]);
  assert.equal(state.moving, false);
});

test('popup overflow uses calc width and shares restoration ownership with dialog overflow', () => {
  const element = {
    style: { overflow: 'auto', width: '60%', boxSizing: 'content-box' },
    offsetWidth: 100,
  } as unknown as HTMLElement;
  const popup = createPopupOverflowHidden({ element, getScrollBarWidth: () => 10 });
  const dialog = createOverflowController({
    element,
    getScrollBarWidth: () => 10,
    isScroll: () => true,
  });
  popup.lock();
  dialog.lock();
  assert.equal(element.style.width, 'calc(60% - 10px)');
  popup.reset();
  assert.equal(element.style.overflow, 'hidden');
  dialog.reset();
  assert.equal(element.style.overflow, 'auto');
  assert.equal(element.style.width, '60%');
});

test('shared frame throttle keeps the latest arguments and cancels pending work without a DOM', async (t) => {
  const pending = new Map<number, FrameRequestCallback>();
  let id = 0;
  const descriptors = ['requestAnimationFrame', 'cancelAnimationFrame'].map(
    (name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const,
  );
  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      pending.set(++id, callback);
      return id;
    },
  });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    configurable: true,
    value: (handle: number) => {
      pending.delete(handle);
    },
  });
  t.after(() => {
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
  });
  const { throttleByRaf } = await import('../dist/_utils/throttle-by-raf.js');
  const calls: number[] = [];
  const throttle = throttleByRaf((value: number) => calls.push(value));
  throttle(1);
  throttle(2);
  assert.equal(pending.size, 1);
  pending.get(2)!(0);
  pending.delete(2);
  assert.deepEqual(calls, [2]);
  throttle(3);
  throttle.cancel();
  assert.equal(pending.size, 0);
});
