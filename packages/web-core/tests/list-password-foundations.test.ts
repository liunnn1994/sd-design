import assert from 'node:assert/strict';
import test from 'node:test';

import { createInputPasswordFoundation } from '../dist/input-password/foundation.js';
import { createListFoundation } from '../dist/list/foundation.js';

function list() {
  const state = {
    pagination: undefined as unknown,
    current: 1,
    pageSize: 2,
    bottomOffset: 0,
    gridSpan: undefined as number | undefined,
    gridRowSize: 1,
    currentPageItems: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
  };
  const events: unknown[][] = [];
  const api = createListFoundation(
    state,
    (...args) => events.push(['scroll', ...args]),
    (...args) => events.push(['bottom', ...args]),
  );
  const scroll = (scrollTop: number, scrollHeight = 100, offsetHeight = 40) =>
    api.handleScroll({ target: { scrollTop, scrollHeight, offsetHeight } } as unknown as Event);
  return { state, events, api, scroll };
}

test('list construction is lazy; pagination disabled skips size/current reads and retains array identity', () => {
  const data = [1, 2];
  let reads = 0;
  const state = {
    get pagination() {
      reads++;
      return undefined;
    },
    get current(): number {
      assert.fail('current');
    },
    get pageSize(): number {
      assert.fail('size');
    },
    bottomOffset: 0,
    gridSpan: undefined,
    gridRowSize: 1,
    currentPageItems: data,
  };
  const api = createListFoundation(
    state,
    () => {},
    () => {},
  );
  assert.equal(reads, 0);
  assert.equal(api.getCurrentPageItems(data), data);
  assert.equal(reads, 1);
});

for (const [page, size] of [
  [1, 2],
  [2, 2],
  [3, 2],
  [0, 2],
  [2, 1.5],
  [1, 0],
  [1, -1],
  [1, Infinity],
  [1, NaN],
]) {
  test(`list page slicing keeps raw index arithmetic: ${page}/${size}`, () => {
    const { state, api } = list();
    state.pagination = {};
    state.current = page!;
    state.pageSize = size!;
    const data = state.currentPageItems;
    const expected =
      data.length > size! ? data.slice((page! - 1) * size!, (page! - 1) * size! + size!) : data;
    assert.deepEqual(api.getCurrentPageItems(data), expected);
    if (data.length <= size! || Number.isNaN(size))
      assert.equal(api.getCurrentPageItems(data), data);
    else assert.equal(api.getCurrentPageItems(data)[0], expected[0]);
  });
}

test('list pagination keeps repeated page-size getter order', () => {
  const trace: string[] = [];
  const data = [1, 2, 3];
  const api = createListFoundation(
    {
      pagination: {},
      get current() {
        trace.push('current');
        return 2;
      },
      get pageSize() {
        trace.push('size');
        return 1;
      },
      bottomOffset: 0,
      gridSpan: undefined,
      gridRowSize: 1,
      currentPageItems: data,
    },
    () => {},
    () => {},
  );
  assert.deepEqual(api.getCurrentPageItems(data), [2]);
  assert.deepEqual(trace, ['size', 'current', 'size', 'size']);
});

for (const span of [undefined, 0, 6, 8, 12, 24, 48, -2, Infinity, NaN]) {
  test(`list grid grouping preserves span behavior and item identity: ${span}`, () => {
    const { state, api } = list();
    state.gridSpan = span;
    const rowSize = Math.max(1, Math.floor(24 / (span || 24)));
    state.gridRowSize = rowSize;
    assert.equal(api.getGridRowSize(), rowSize);
    const expected: (typeof state.currentPageItems)[] = [];
    if (span)
      for (let index = 0; index < state.currentPageItems.length; index += rowSize)
        expected.push(state.currentPageItems.slice(index, index + rowSize));
    const rows = api.getGridRows();
    assert.deepEqual(rows, expected);
    if (span) assert.equal(rows[0]?.[0], state.currentPageItems[0]);
  });
}

test('list scroll only emits bottom when moving down, floors fractional distance and emits no payload', () => {
  const { scroll, events } = list();
  scroll(0);
  scroll(59.2);
  scroll(59.2);
  scroll(58);
  scroll(60);
  assert.deepEqual(events, [
    ['scroll'],
    ['bottom'],
    ['scroll'],
    ['scroll'],
    ['scroll'],
    ['bottom'],
    ['scroll'],
  ]);
});

test('list initial viewport uses clientHeight, has no direction guard and does not update scroll history', () => {
  const { api, scroll, events } = list();
  api.checkInitialViewport(undefined);
  api.checkInitialViewport({ scrollTop: 0, scrollHeight: 100, clientHeight: 99 });
  assert.deepEqual(events, []);
  api.checkInitialViewport({ scrollTop: 60, scrollHeight: 100, clientHeight: 40 });
  scroll(60);
  assert.deepEqual(events, [['bottom'], ['bottom'], ['scroll']]);
});

test('list updates direction history after callbacks, retaining old history on errors', () => {
  let fail = true;
  const events: string[] = [];
  const state = list().state;
  const api = createListFoundation(
    state,
    () => {
      events.push('scroll');
      if (fail) throw new Error('scroll');
    },
    () => events.push('bottom'),
  );
  const event = {
    target: { scrollTop: 60, scrollHeight: 100, offsetHeight: 40 },
  } as unknown as Event;
  assert.throws(() => api.handleScroll(event), /scroll/);
  fail = false;
  api.handleScroll(event);
  assert.deepEqual(events, ['bottom', 'scroll', 'bottom', 'scroll']);
});

test('list reach-bottom exception prevents scroll callback and history update', () => {
  let fail = true;
  const events: string[] = [];
  const state = list().state;
  const api = createListFoundation(
    state,
    () => events.push('scroll'),
    () => {
      events.push('bottom');
      if (fail) throw new Error('bottom');
    },
  );
  const event = {
    target: { scrollTop: 60, scrollHeight: 100, offsetHeight: 40 },
  } as unknown as Event;
  assert.throws(() => api.handleScroll(event), /bottom/);
  fail = false;
  api.handleScroll(event);
  assert.deepEqual(events, ['bottom', 'bottom', 'scroll']);
});

test('list callback reentry sees history from the previous completed scroll', () => {
  const events: string[] = [];
  const state = list().state;
  let reenter = true;
  const event = {
    target: { scrollTop: 60, scrollHeight: 100, offsetHeight: 40 },
  } as unknown as Event;
  const api = createListFoundation(
    state,
    () => events.push('scroll'),
    () => {
      events.push('bottom');
      if (reenter) {
        reenter = false;
        api.handleScroll(event);
      }
    },
  );
  api.handleScroll(event);
  assert.deepEqual(events, ['bottom', 'bottom', 'scroll', 'scroll']);
});

test('list instances do not share direction history', () => {
  const first = list(),
    second = list();
  first.scroll(60);
  first.scroll(60);
  second.scroll(60);
  assert.deepEqual(first.events, [['bottom'], ['scroll'], ['scroll']]);
  assert.deepEqual(second.events, [['bottom'], ['scroll']]);
});

for (const masked of [false, true]) {
  test(`password toggles retain inverted public visibility and ordered notifications: ${masked}`, () => {
    const state = { masked };
    const trace: unknown[] = [];
    const api = createInputPasswordFoundation(
      state,
      (value) => trace.push(['change', value]),
      (value) => trace.push(['model', value]),
      (value) => {
        trace.push(['local', value]);
        state.masked = value;
      },
    );
    assert.deepEqual(trace, []);
    api.setMasked(masked);
    assert.deepEqual(trace, []);
    api.toggle();
    assert.deepEqual(trace, [
      ['change', !masked],
      ['model', !masked],
      ['local', !masked],
    ]);
    assert.equal(state.masked, !masked);
  });
}

test('password toggle re-reads merged state before deciding to notify', () => {
  let reads = 0;
  const api = createInputPasswordFoundation(
    {
      get masked() {
        return ++reads === 1;
      },
    },
    () => assert.fail('change'),
    () => assert.fail('model'),
    () => assert.fail('local'),
  );
  assert.equal(reads, 0);
  api.toggle();
  assert.equal(reads, 2);
});

for (const rejectedAt of ['change', 'model', 'local']) {
  test(`password callback failure preserves earlier notifications: ${rejectedAt}`, () => {
    const trace: string[] = [];
    const call = (name: string) => {
      trace.push(name);
      if (name === rejectedAt) throw new Error(name);
    };
    const api = createInputPasswordFoundation(
      { masked: true },
      () => call('change'),
      () => call('model'),
      () => call('local'),
    );
    assert.throws(() => api.toggle(), new RegExp(rejectedAt));
    assert.deepEqual(
      trace,
      ['change', 'model', 'local'].slice(0, ['change', 'model', 'local'].indexOf(rejectedAt) + 1),
    );
  });
}

test('password parent mutation does not change remaining callback payloads', () => {
  const trace: boolean[] = [];
  const state = { masked: true };
  const api = createInputPasswordFoundation(
    state,
    (value) => {
      trace.push(value);
      state.masked = true;
    },
    (value) => trace.push(value),
    (value) => trace.push(value),
  );
  api.toggle();
  assert.deepEqual(trace, [false, false, false]);
});

test('password rejected controlled state still receives local fallback updates', () => {
  const trace: boolean[] = [];
  const api = createInputPasswordFoundation(
    { masked: true },
    () => {},
    () => {},
    (value) => trace.push(value),
  );
  api.toggle();
  api.toggle();
  assert.deepEqual(trace, [false, false]);
});
