import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TabKey } from '../src/tabs/types.ts';

import {
  createCollapseFoundation,
  createCollapseItemFoundation,
  normalizeCollapseKey,
} from '../dist/collapse/foundation.js';
import {
  createTabsFoundation,
  getTabNavigationTarget,
  activateTabKey,
  activateTab,
  syncTabPane,
} from '../dist/tabs/foundation.js';
import {
  createTabsNavigation,
  getTabMarginSide,
  getTabTargetOffset,
  getTabsInkStyle,
} from '../dist/tabs/navigation.js';

function tabs() {
  const registry = new Map<number, { key: TabKey }>();
  const state = {
    order: [2, 1],
    value: undefined as TabKey | undefined,
    inner: undefined as TabKey | undefined,
    auto: true,
  };
  const events: unknown[][] = [];
  const deferred: (() => void)[] = [];
  let onAdd: (() => void) | undefined;
  const f = createTabsFoundation({
    registry,
    get order() {
      return state.order;
    },
    get keys() {
      return f.getSorted().map((tab) => tab.key);
    },
    get value() {
      return state.value;
    },
    get inner() {
      return state.inner;
    },
    get active() {
      return f.getActive();
    },
    get autoSwitch() {
      return state.auto;
    },
    setInner(key) {
      state.inner = key;
    },
    onChange(key) {
      events.push(['change', key]);
    },
    onClick(key, event) {
      events.push(['click', key, event]);
    },
    onAdd(event) {
      events.push(['add', event]);
      onAdd?.();
    },
    onDelete(key, event) {
      events.push(['delete', key, event]);
    },
    defer(callback) {
      deferred.push(callback);
    },
  });
  return {
    f,
    state,
    registry,
    events,
    deferred,
    onAdd(callback: () => void) {
      onAdd = callback;
    },
  };
}
test('tabs registry uses component order, preserves numeric/string keys and falls back to first key', () => {
  const s = tabs();
  s.f.register(1, { key: '0' });
  s.f.register(2, { key: 0 });
  assert.deepEqual(
    s.f.getSorted().map((item) => item.key),
    [0, '0'],
  );
  assert.equal(s.f.getActive(), 0);
  s.state.value = 'missing';
  assert.equal(s.f.getActiveIndex(), 0);
  s.f.unregister(2);
  s.state.value = undefined;
  assert.equal(s.f.getActive(), '0');
});
test('tab clicks preserve change-before-click and controlled rejection', () => {
  const s = tabs();
  s.state.value = 0;
  const event = new Event('click');
  s.f.click('0', event);
  s.f.click('0', event);
  assert.deepEqual(s.events, [
    ['change', '0'],
    ['click', '0', event],
    ['change', '0'],
    ['click', '0', event],
  ]);
  s.events.length = 0;
  s.f.click(0, event);
  assert.deepEqual(s.events, [['click', 0, event]]);
});
test('auto-switch reads registry after add callback and deferred render, including empty tabs', () => {
  const s = tabs();
  s.f.register(1, { key: 'old' });
  s.state.order = [1];
  s.onAdd(() => {
    s.f.register(2, { key: 'callback' });
    s.state.order = [1, 2];
  });
  s.f.add(new Event('add'));
  s.f.register(3, { key: 'rendered' });
  s.state.order = [1, 2, 3];
  s.deferred.shift()!();
  assert.equal(s.state.inner, 'rendered');
  s.state.order = [];
  s.onAdd(() => {});
  s.f.add(new Event('add'));
  s.deferred.shift()!();
  assert.equal(s.state.inner, undefined);
  assert.deepEqual(s.events.at(-1), ['change', undefined]);
});
test('keyboard navigation skips disabled tabs, wraps and reverses only the horizontal RTL axis', () => {
  const data = [{ key: 0 }, { key: 'disabled', disabled: true }, { key: '0' }];
  assert.deepEqual(getTabNavigationTarget(data, 0, 'horizontal', true, 'ArrowRight'), { key: '0' });
  assert.deepEqual(getTabNavigationTarget(data, 'unknown', 'horizontal', false, 'ArrowRight'), {
    key: '0',
  });
  assert.deepEqual(getTabNavigationTarget(data, '0', 'vertical', true, 'ArrowDown'), { key: 0 });
  assert.equal(getTabNavigationTarget(data, 0, 'horizontal', false, 'ArrowDown'), undefined);
  let prevented = false;
  let clicks = 0;
  activateTabKey(
    {
      key: ' ',
      preventDefault() {
        prevented = true;
      },
    } as KeyboardEvent,
    (event) => activateTab({ key: 0, disabled: true }, event, () => clicks++),
  );
  assert.equal(prevented, true);
  assert.equal(clicks, 0);
});
test('tab pane retains hidden content unless destroy-on-hide is active at the transition', () => {
  let mounted = false;
  const set = (value: boolean) => {
    mounted = value;
  };
  syncTabPane(true, false, mounted, set);
  assert.equal(mounted, true);
  syncTabPane(false, false, mounted, set);
  assert.equal(mounted, true);
  syncTabPane(false, true, mounted, set);
  assert.equal(mounted, false);
});
test('navigation preserves stale max on non-overflow, clamping, dominant wheel axis and RTL buttons', () => {
  const state = {
    offset: 70,
    max: 100,
    scrolling: true,
    wrapperLength: 40,
    rtl: true,
    overflow: false,
  };
  const f = createTabsNavigation({
    get offset() {
      return state.offset;
    },
    get max() {
      return state.max;
    },
    get scrolling() {
      return state.scrolling;
    },
    get wrapperLength() {
      return state.wrapperLength;
    },
    get rtl() {
      return state.rtl;
    },
    hasElements: () => true,
    measureOverflow: () => state.overflow,
    measureWrapper: () => 40,
    measureMax: () => 50,
    setOffset(value) {
      state.offset = value;
    },
    setMax(value) {
      state.max = value;
    },
    setScrolling(value) {
      state.scrolling = value;
    },
    setWrapperLength(value) {
      state.wrapperLength = value;
    },
  });
  f.measure();
  assert.equal(state.offset, 0);
  assert.equal(state.max, 100);
  state.overflow = true;
  state.offset = 70;
  f.measure();
  assert.equal(state.offset, 50);
  assert.equal(state.max, 50);
  f.button('next');
  assert.equal(state.offset, 10);
  let prevented = false;
  f.wheel({
    deltaX: 5,
    deltaY: 20,
    preventDefault() {
      prevented = true;
    },
  } as WheelEvent);
  assert.equal(state.offset, 30);
  assert.equal(prevented, true);
});
test('scroll alignment, margins and ink preserve existing projections', () => {
  assert.equal(getTabMarginSide(true, true, 'end'), 'marginLeft');
  assert.equal(getTabTargetOffset('center', 0, 100, 40, 100, 10), 75);
  assert.equal(getTabTargetOffset('auto', 90, 100, 40, 100, 10), 90);
  assert.equal(getTabTargetOffset(NaN, 90, 100, 40, 100, 10), 0);
  assert.deepEqual(getTabsInkStyle(true, 'vertical', 12, 40), {
    transform: 'translateY(12px)',
    height: '40px',
  });
});
test('collapse preserves scalar normalization, duplicate removal and event/local array identity', () => {
  const state = {
    inner: ['a', 'a'] as (string | number)[],
    value: undefined as (string | number)[] | undefined,
    accordion: false,
  };
  const events: unknown[][] = [];
  const f = createCollapseFoundation({
    get value() {
      return state.value;
    },
    get inner() {
      return state.inner;
    },
    get keys() {
      return f.getKeys();
    },
    get accordion() {
      return state.accordion;
    },
    setInner(value) {
      state.inner = value;
    },
    onChange(value, event) {
      assert.equal(value, state.inner);
      events.push([value, event]);
    },
  });
  f.click('a', new Event('click'));
  assert.deepEqual(state.inner, ['a']);
  state.value = [];
  f.click(0, new Event('click'));
  f.click(0, new Event('click'));
  assert.deepEqual(state.inner, [0]);
  state.value = undefined;
  state.accordion = true;
  f.click(0, new Event('click'));
  assert.deepEqual(state.inner, []);
  assert.equal(normalizeCollapseKey(0), 0);
  assert.equal(normalizeCollapseKey('0'), '0');
  assert.equal(normalizeCollapseKey(NaN), 'NaN');
});
test('collapse item defers destruction through leave and handles dynamic destroy changes', () => {
  const state = { active: true, destroy: true, mounted: true };
  const f = createCollapseItemFoundation({
    disabled: false,
    get active() {
      return state.active;
    },
    get destroy() {
      return state.destroy;
    },
    get mounted() {
      return state.mounted;
    },
    setMounted(value) {
      state.mounted = value;
    },
    onClick() {},
    isInteractiveTarget: () => false,
  });
  f.beforeLeave();
  state.active = false;
  f.syncDestroy(true);
  assert.equal(state.mounted, true);
  f.afterLeave();
  assert.equal(state.mounted, false);
  state.active = true;
  f.syncActive(true);
  assert.equal(state.mounted, true);
  f.beforeLeave();
  f.leaveCancelled();
  state.active = false;
  f.syncDestroy(true);
  assert.equal(state.mounted, false);
  state.destroy = false;
  f.syncDestroy(false);
  assert.equal(state.mounted, true);
});
test('collapse keyboard ignores interactive descendants and disabled items before preventing default', () => {
  let interactive = true;
  let disabled = false;
  let checks = 0;
  const events: string[] = [];
  const f = createCollapseItemFoundation({
    get disabled() {
      return disabled;
    },
    active: false,
    destroy: false,
    mounted: true,
    setMounted() {},
    onClick() {
      events.push('click');
    },
    isInteractiveTarget() {
      checks++;
      return interactive;
    },
  });
  const event = {
    key: 'Enter',
    preventDefault() {
      events.push('prevent');
    },
  } as KeyboardEvent;
  f.keydown(event);
  assert.deepEqual(events, []);
  disabled = true;
  f.keydown(event);
  assert.equal(checks, 1);
  disabled = false;
  interactive = false;
  f.keydown(event);
  assert.deepEqual(events, ['prevent', 'click']);
});
