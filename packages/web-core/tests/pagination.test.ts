import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createPaginationFoundation } from '../dist/pagination/foundation.js';
import { createPageJumperFoundation, formatPageJumper } from '../dist/pagination/jumper.js';
import { getPaginationTarget, getStepPagerDisabled } from '../dist/pagination/utils.js';

function setup() {
  const state = {
    current: 1,
    pageSize: 10,
    total: 100,
    controlledPageSize: undefined as number | undefined,
    controlledCurrent: undefined as number | undefined,
    disabled: false,
    autoAdjust: true,
    baseSize: 6,
    bufferSize: 2,
  };
  const events: [string, number][] = [];
  let onSize: (() => void) | undefined;
  const foundation = createPaginationFoundation({
    get current() {
      return state.controlledCurrent ?? state.current;
    },
    get pageSize() {
      return state.controlledPageSize ?? state.pageSize;
    },
    get controlledPageSize() {
      return state.controlledPageSize;
    },
    get pages() {
      return Math.ceil(state.total / (state.controlledPageSize ?? state.pageSize));
    },
    get disabled() {
      return state.disabled;
    },
    get autoAdjust() {
      return state.autoAdjust;
    },
    get baseSize() {
      return state.baseSize;
    },
    get bufferSize() {
      return state.bufferSize;
    },
    setCurrent(value) {
      state.current = value;
    },
    setPageSize(value) {
      state.pageSize = value;
    },
    onCurrent(value) {
      events.push(['current', value]);
    },
    onPageSize(value) {
      events.push(['size', value]);
      onSize?.();
    },
  });
  return {
    state,
    events,
    foundation,
    onSize(callback: () => void) {
      onSize = callback;
    },
  };
}

test('page descriptors retain both ellipses, stable keys and buffer jumps', () => {
  const s = setup();
  s.state.total = 200;
  s.state.current = 10;
  assert.deepEqual(s.foundation.getPageList(), [
    { key: 1, type: 'page', pageNumber: 1 },
    { key: 'left-ellipsis-pager', type: 'more', step: -5 },
    ...[8, 9, 10, 11, 12].map((page) => ({ key: page, type: 'page', pageNumber: page })),
    { key: 'right-ellipsis-pager', type: 'more', step: 5 },
    { key: 20, type: 'page', pageNumber: 20 },
  ]);
  s.state.total = 0;
  assert.deepEqual(s.foundation.getPageList(), []);
  s.state.total = 30;
  assert.deepEqual(
    s.foundation.getPageList().map((item) => item.pageNumber),
    [1, 2, 3],
  );
});

test('direct changes retain controlled rejection and disabled/NaN guards', () => {
  const s = setup();
  s.state.controlledCurrent = 1;
  s.foundation.change(3);
  s.foundation.change(3);
  assert.deepEqual(s.events, [
    ['current', 3],
    ['current', 3],
  ]);
  s.foundation.change(NaN);
  s.state.disabled = true;
  s.foundation.change(4);
  assert.equal(s.events.length, 2);
});

test('uncontrolled size change preserves first item and publishes size before current', () => {
  const s = setup();
  s.state.current = 3;
  s.foundation.changePageSize(20);
  assert.equal(s.state.current, 2);
  assert.deepEqual(s.events, [
    ['size', 20],
    ['current', 2],
  ]);
  s.foundation.sync(20, 5, 10, 10);
  assert.equal(s.events.length, 2);
});

test('controlled size waits for sync and adjusts once using previous size', () => {
  const s = setup();
  s.state.controlledPageSize = 10;
  s.state.current = 8;
  s.foundation.changePageSize(20);
  assert.deepEqual(s.events, [['size', 20]]);
  s.state.controlledPageSize = 20;
  s.foundation.sync(20, 5, 10, 10);
  assert.equal(s.state.current, 4);
  s.foundation.sync(20, 5, 20, 5);
  assert.deepEqual(s.events, [
    ['size', 20],
    ['current', 4],
  ]);
});

test('reentrant size listener supplies the current page used for adjustment', () => {
  const s = setup();
  s.onSize(() => {
    s.state.current = 7;
  });
  s.foundation.changePageSize(20);
  assert.equal(s.state.current, 4);
});

test('total shrink clamps to one including zero total; autoAdjust false preserves page', () => {
  const s = setup();
  s.state.current = 8;
  s.state.total = 0;
  s.foundation.sync(10, 0, 10, 10);
  assert.equal(s.state.current, 1);
  s.state.current = 8;
  s.state.autoAdjust = false;
  s.foundation.sync(10, 0, 10, 10);
  assert.equal(s.state.current, 8);
});

test('pager targets retain legacy min/max order and boundary disabling', () => {
  assert.equal(getPaginationTarget(1, -5, 0), 1);
  assert.equal(getPaginationTarget(1, 5, 0), 0);
  assert.equal(getPaginationTarget(19, 5, 20), 20);
  assert.equal(getStepPagerDisabled(false, 0, 1, true), true);
  assert.equal(getStepPagerDisabled(false, 10, 10, true), true);
  assert.equal(getStepPagerDisabled(false, 10, 11, true), false);
  assert.equal(getStepPagerDisabled(false, 10, 1, false), true);
});

test('jumper defers reset and reads latest simple mode after change callback', () => {
  let simple = false;
  let value: number | string | undefined = 3;
  const deferred: (() => void)[] = [];
  const events: number[] = [];
  const foundation = createPageJumperFoundation({
    get simple() {
      return simple;
    },
    get value() {
      return value;
    },
    setValue(next) {
      value = next;
    },
    onChange(next) {
      events.push(next);
    },
    defer(callback) {
      deferred.push(callback);
    },
  });
  foundation.change('4');
  assert.deepEqual(events, []);
  foundation.change(4);
  assert.equal(value, 3);
  deferred.shift()!();
  assert.equal(value, '');
  foundation.change(5);
  simple = true;
  deferred.shift()!();
  assert.equal(value, '');
  foundation.sync(6);
  assert.equal(value, 6);
  assert.equal(formatPageJumper(1.9), '1');
  assert.equal(formatPageJumper(NaN), undefined);
});
