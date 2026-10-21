import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TriggerEvent } from '../src/_utils/constant.ts';
import type { TriggerOptions } from '../src/trigger/foundation.ts';

import { createTriggerFoundation } from '../dist/trigger/foundation.js';
import {
  fromFloatingPlacement,
  toFloatingPlacement,
  getArrowFloatingStyle,
} from '../dist/trigger/position.js';
import { getScrollElements, getTransformOrigin, isScrollElement } from '../dist/trigger/utils.js';

function setup() {
  const options: TriggerOptions = {
    disabled: false,
    alignPoint: false,
    clickToClose: true,
    blurToClose: true,
    clickOutsideToClose: true,
    escToClose: false,
    mouseEnterDelay: 100,
    mouseLeaveDelay: 100,
    focusDelay: 0,
    preventFocus: false,
    unmountOnClose: true,
    scrollToCloseDistance: 0,
  };
  const state = {
    inner: false,
    controlled: undefined as boolean | undefined,
    methods: ['hover'] as TriggerEvent[],
    scroll: true,
    mounted: false,
    animation: false,
    inside: false,
  };
  const events: unknown[][] = [];
  const timers = new Map<number, { callback: () => void; delay: number }>();
  let timer = 0;
  let native: (() => void) | undefined;
  const onNative = (name: string) => {
    events.push([name]);
    native?.();
  };
  const foundation = createTriggerFoundation({
    options,
    get visible() {
      return state.controlled ?? state.inner;
    },
    get methods() {
      return state.methods;
    },
    get scrollToClose() {
      return state.scroll;
    },
    get mounted() {
      return state.mounted;
    },
    setVisible(value) {
      state.inner = value;
      events.push(['local', value]);
    },
    onVisible(value) {
      events.push(['visible', value]);
    },
    afterOpen() {
      events.push(['open']);
    },
    resetScroll() {
      events.push(['reset']);
    },
    setMousePosition(top, left) {
      events.push(['point', top, left]);
    },
    setTimer(callback, delay) {
      const id = ++timer;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimer(id) {
      timers.delete(id);
      events.push(['cancel', id]);
    },
    onNativeClick() {
      onNative('click');
    },
    onNativeMouseenter() {
      onNative('enter');
    },
    onNativeMouseleave() {
      onNative('leave');
    },
    onNativeFocusin() {
      onNative('focusin');
    },
    onNativeFocusout() {
      onNative('focusout');
    },
    onNativeContextmenu() {
      onNative('context');
    },
    isInsidePopupOrChildren() {
      events.push(['inside']);
      return state.inside;
    },
    setAnimation(value) {
      state.animation = value;
    },
    setMounted(value) {
      state.mounted = value;
    },
    onShow() {
      events.push(['show']);
    },
    onHide() {
      events.push(['hide']);
    },
  });
  return {
    foundation,
    options,
    state,
    events,
    timers,
    onNative(callback: () => void) {
      native = callback;
    },
  };
}
const mouse = { clientX: 30, clientY: 20, preventDefault() {} } as MouseEvent;

test('hover leave cancels a pending open without publishing a redundant close', () => {
  const s = setup();
  s.foundation.mouseenter(mouse);
  assert.equal(s.timers.get(1)?.delay, 100);
  s.foundation.mouseleave(mouse);
  assert.deepEqual(s.events, [['enter'], ['leave'], ['cancel', 1], ['reset']]);
  assert.equal(s.timers.size, 0);
});

test('delayed commits retain timer identity and same-value retry behavior', () => {
  const s = setup();
  s.foundation.changeVisible(true, 100);
  s.timers.get(1)!.callback();
  assert.equal(s.state.inner, true);
  s.events.length = 0;
  s.foundation.changeVisible(true);
  assert.deepEqual(s.events, [['cancel', 1], ['local', true], ['visible', true], ['open']]);
});

test('controlled rejection retains local requests and opening notification ordering', () => {
  const s = setup();
  s.state.controlled = false;
  s.state.methods = ['click'];
  s.options.alignPoint = true;
  s.foundation.click(mouse);
  s.foundation.click(mouse);
  assert.equal(s.state.controlled, false);
  assert.equal(s.state.inner, true);
  assert.deepEqual(s.events.slice(0, 5), [
    ['click'],
    ['point', 20, 30],
    ['local', true],
    ['visible', true],
    ['open'],
  ]);
  assert.equal(s.events.filter(([name]) => name === 'visible').length, 2);
});

test('native handlers run first and their option changes gate the same event', () => {
  const s = setup();
  s.state.methods = ['click'];
  s.onNative(() => {
    s.options.disabled = true;
  });
  s.foundation.click(mouse);
  assert.deepEqual(s.events, [['click']]);
});

test('focus delay and explicit timer cleanup preserve cancellation on adapter configuration changes', () => {
  const s = setup();
  s.state.methods = ['focus'];
  s.options.focusDelay = 50;
  s.foundation.focusin({} as FocusEvent);
  assert.equal(s.timers.get(1)?.delay, 50);
  s.foundation.cleanDelayTimer();
  assert.equal(s.timers.size, 0);
  s.state.inner = true;
  s.options.blurToClose = false;
  s.foundation.focusout({} as FocusEvent);
  assert.equal(s.state.inner, true);
  s.options.blurToClose = true;
  s.foundation.focusout({} as FocusEvent);
  assert.equal(s.state.inner, false);
});

test('context menu updates position, publishes visibility, then prevents default', () => {
  const s = setup();
  s.state.methods = ['contextMenu'];
  s.options.alignPoint = true;
  s.foundation.contextmenu({
    ...mouse,
    preventDefault() {
      s.events.push(['prevent']);
    },
  } as MouseEvent);
  assert.deepEqual(s.events, [
    ['context'],
    ['point', 20, 30],
    ['local', true],
    ['visible', true],
    ['open'],
    ['prevent'],
  ]);
  s.options.clickToClose = false;
  s.events.length = 0;
  s.foundation.contextmenu(mouse);
  assert.deepEqual(s.events, [['context']]);
});

test('outside context gates child containment and escape closes even while disabled', () => {
  const s = setup();
  s.state.inner = true;
  s.state.methods = ['contextMenu'];
  s.state.inside = true;
  s.foundation.outsideContextmenu(mouse);
  assert.equal(s.state.inner, true);
  s.state.inside = false;
  s.foundation.outsideContextmenu(mouse);
  assert.equal(s.state.inner, false);
  s.state.inner = true;
  s.options.disabled = true;
  s.options.escToClose = true;
  s.foundation.keydown({ key: 'Escape' } as KeyboardEvent);
  assert.equal(s.state.inner, false);
});

test('outside click policy and popup focus prevention remain independent of trigger method', () => {
  const s = setup();
  s.state.inner = true;
  s.options.clickOutsideToClose = false;
  s.foundation.outsideClick();
  assert.equal(s.state.inner, true);
  s.options.clickOutsideToClose = true;
  s.foundation.outsideClick();
  assert.equal(s.state.inner, false);
  let prevented = false;
  s.options.preventFocus = true;
  s.foundation.popupMouseDown({
    preventDefault() {
      prevented = true;
    },
  } as Event);
  assert.equal(prevented, true);
});

test('scroll policy uses either axis and includes the exact zero/distance threshold', () => {
  const s = setup();
  assert.equal(s.foundation.shouldListenForScroll(false), false);
  assert.equal(s.foundation.shouldListenForScroll(true), true);
  assert.equal(s.foundation.isExceedThreshold([0, 0], { scrollTop: 0, scrollLeft: 0 }), true);
  s.options.scrollToCloseDistance = 30;
  assert.equal(s.foundation.isExceedThreshold([10, 10], { scrollTop: 39, scrollLeft: 39 }), false);
  assert.equal(s.foundation.isExceedThreshold([10, 10], { scrollTop: 10, scrollLeft: 40 }), true);
});

test('transition notifications read current visibility and retain mounting until a confirmed hide', () => {
  const s = setup();
  s.state.mounted = true;
  assert.equal(s.foundation.shouldRenderPopup(false), true);
  s.state.inner = true;
  s.foundation.animationStart();
  s.foundation.hide();
  assert.equal(s.state.animation, false);
  assert.equal(s.state.mounted, true);
  s.foundation.show();
  assert.deepEqual(s.events, [['show']]);
  s.state.inner = false;
  s.foundation.hide();
  assert.equal(s.state.mounted, false);
  assert.equal(s.foundation.shouldRenderPopup(false), false);
  s.options.unmountOnClose = false;
  assert.equal(s.foundation.shouldRenderPopup(false), true);
  assert.equal(s.foundation.shouldRenderPopup(true), false);
});

test('placement conversion and arrow geometry preserve legacy static-side precedence', () => {
  for (const position of [
    'top',
    'tl',
    'tr',
    'bottom',
    'bl',
    'br',
    'left',
    'lt',
    'lb',
    'right',
    'rt',
    'rb',
  ] as const)
    assert.equal(fromFloatingPlacement(toFloatingPlacement(position)), position);
  assert.deepEqual(getArrowFloatingStyle('right-start', { x: 12, y: 8 }), {
    left: 0,
    top: '8px',
    transform: 'translateX(-50%) rotate(45deg)',
  });
  assert.equal(getTransformOrigin('tr'), '100% 100%');
  assert.deepEqual(getScrollElements(undefined), []);
  assert.equal(
    isScrollElement({
      scrollHeight: 20,
      offsetHeight: 10,
      scrollWidth: 10,
      offsetWidth: 10,
    } as HTMLElement),
    true,
  );
});
