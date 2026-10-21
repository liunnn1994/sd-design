import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getBadgeCount, getBadgeDotStyle, getBadgeStyle } from '../dist/badge/foundation.js';
import {
  createCountdown,
  getCountdownDisplay,
  getCountdownParts,
} from '../dist/statistic/countdown.js';
import {
  createStatistic,
  getStatisticInitialValue,
  getStatisticNumberFormat,
  formatStatisticDate,
} from '../dist/statistic/foundation.js';

function countdown() {
  let time = 10_000;
  let sequence = 0;
  const callbacks = new Map<number, () => void>();
  const props = { value: 15_000, now: 10_000, format: 'ss', start: true };
  const adapter = {
    props,
    display: getCountdownDisplay(props.value, props.now, props.format),
    finishes: 0,
    now: () => time,
    setInterval(callback: () => void, delay: number) {
      assert.equal(delay, 1000 / 30);
      callbacks.set(++sequence, callback);
      return sequence;
    },
    clearInterval: (id: number) => {
      callbacks.delete(id);
    },
    finish() {
      this.finishes++;
    },
  };
  const controller = createCountdown(adapter);
  return {
    props,
    adapter,
    controller,
    callbacks,
    tick(value: number) {
      time = value;
      for (const callback of [...callbacks.values()]) callback();
    },
  };
}

test('countdown initial correction and display token splitting preserve units and padding', () => {
  assert.equal(getCountdownDisplay(9000, 10000, 'HH:mm:ss'), '00:00:00');
  assert.equal(getCountdownDisplay(3_723_004, 0, 'HH:mm:ss.SSS'), '01:02:03.004');
  assert.deepEqual(getCountdownParts('剩余01:02秒'), [
    { type: 'text', value: '剩余' },
    { type: 'number', value: '01' },
    { type: 'text', value: ':' },
    { type: 'number', value: '02' },
    { type: 'text', value: '秒' },
  ]);
  assert.deepEqual(getCountdownParts(''), []);
});

test('countdown ticks against real time instead of corrected initial now and stops once', () => {
  const c = countdown();
  c.controller.mount();
  c.tick(12_100);
  assert.equal(c.adapter.display, '02');
  c.tick(15_001);
  assert.equal(c.adapter.display, '00');
  assert.equal(c.adapter.finishes, 1);
  assert.equal(c.callbacks.size, 0);
  c.controller.syncStart(true);
  assert.equal(c.adapter.finishes, 1);
});

test('countdown paused edits freeze display but reset finish for a new deadline', () => {
  const c = countdown();
  c.controller.mount();
  c.props.start = false;
  c.controller.syncStart(false);
  c.props.value = 18_000;
  c.props.format = 'mm:ss';
  c.controller.syncValue(15_000);
  c.tick(20_000);
  assert.equal(c.adapter.display, '05');
  assert.equal(c.adapter.finishes, 0);
  c.props.start = true;
  c.controller.syncStart(true);
  assert.equal(c.adapter.display, '00:00');
  assert.equal(c.adapter.finishes, 1);
});

test('countdown expired mount emits even when not started and future replacement restarts', () => {
  const c = countdown();
  c.props.start = false;
  c.props.value = 9000;
  c.controller.mount();
  assert.equal(c.adapter.finishes, 1);
  c.props.start = true;
  c.props.value = 12_000;
  c.controller.syncValue(9000);
  assert.equal(c.adapter.display, '02');
  assert.equal(c.callbacks.size, 1);
  c.tick(12_000);
  assert.equal(c.adapter.finishes, 2);
});

test('countdown now/format edits retain finish deduplication and stop releases interval', () => {
  const c = countdown();
  c.controller.mount();
  c.props.now = 11_000;
  c.props.format = 'mm:ss';
  c.controller.syncValue(15_000);
  assert.equal(c.adapter.display, '00:04');
  assert.equal(c.callbacks.size, 1);
  c.controller.stop();
  assert.equal(c.callbacks.size, 0);
  c.controller.stop();
  c.tick(30_000);
  assert.equal(c.adapter.finishes, 0);
});

test('countdown past deadline edits while running finish on next tick, not during sync', () => {
  const c = countdown();
  c.controller.mount();
  c.props.value = 9000;
  c.controller.syncValue(15_000);
  assert.equal(c.adapter.display, '00');
  assert.equal(c.adapter.finishes, 0);
  c.tick(10_001);
  assert.equal(c.adapter.finishes, 1);
});

test('statistic initial animation and mount read latest props after render', async () => {
  const props = {
    value: 100 as number | Date | undefined,
    animation: true,
    start: true,
    valueFrom: 0,
  };
  let release!: () => void;
  const adapter = {
    props,
    display: getStatisticInitialValue(props),
    afterRender: () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  };
  const controller = createStatistic(adapter);
  const mount = controller.mount();
  assert.equal(adapter.display, 0);
  props.value = 200;
  release();
  await mount;
  assert.equal(adapter.display, 200);
  props.start = false;
  controller.syncValue(undefined);
  assert.equal(adapter.display, undefined);
  props.value = 300;
  controller.syncStart(false);
  assert.equal(adapter.display, undefined);
  controller.syncStart(true);
  assert.equal(adapter.display, 300);
});

test('statistic disabled or unstarted mount does not schedule and date mode preserves empty format', async () => {
  const props = { value: 100, animation: false, start: true, valueFrom: 0 };
  const adapter = {
    props,
    display: getStatisticInitialValue(props),
    afterRender: async () => {
      assert.fail('unexpected render wait');
    },
  };
  await createStatistic(adapter).mount();
  assert.equal(adapter.display, 100);
  props.animation = true;
  props.start = false;
  await createStatistic(adapter).mount();
  const date = new Date(2020, 0, 1, 12, 30, 45);
  assert.equal(formatStatisticDate(date, 'HH:mm:ss'), '12:30:45');
  assert.equal(formatStatisticDate(date, ''), date);
  assert.deepEqual(getStatisticNumberFormat(2, true), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
});

test('badge normalizes invalid/negative values and zero maxCount disables overflow', () => {
  assert.deepEqual(getBadgeCount(undefined, 99), {
    hasCount: false,
    value: 0,
    display: 0,
    suffix: undefined,
  });
  for (const value of [NaN, -3, 0]) assert.equal(getBadgeCount(value, 99).display, 0);
  assert.deepEqual(getBadgeCount(123, 99), {
    hasCount: true,
    value: 123,
    display: 99,
    suffix: '+',
  });
  assert.equal(getBadgeCount(123, 0).display, 123);
  assert.equal(getBadgeCount(99, 99).suffix, undefined);
  assert.equal(getBadgeCount(5, -1).display, -1);
});

test('badge mirrors only its horizontal offset and retains copied user style without mutation', () => {
  const style = {
    'marginLeft': '7px',
    'marginRight': '8px',
    'marginTop': '9px',
    'color': 'red',
    '--custom': 'ok',
  };
  assert.deepEqual(getBadgeDotStyle(style, [3, -2], true), {
    ...style,
    marginLeft: '-3px',
    marginTop: '-2px',
  });
  assert.deepEqual(getBadgeDotStyle(style, [-3, 2], false), {
    ...style,
    marginRight: '3px',
    marginTop: '2px',
  });
  assert.deepEqual(getBadgeDotStyle(style, [0, 0], false), style);
  assert.equal(style.marginLeft, '7px');
});

test('badge custom background yields to dotStyle while preset colors remain class based', () => {
  assert.deepEqual(getBadgeStyle('sdblue', {}), {});
  assert.deepEqual(getBadgeStyle('#123456', {}), { backgroundColor: '#123456' });
  assert.deepEqual(getBadgeStyle('#123456', { backgroundColor: 'red' }), {
    backgroundColor: 'red',
  });
});
