import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createLegacyPaginationFoundation,
  getDefaultCurrent,
  getDefaultPageSize,
  type LegacyPaginationState,
} from '../dist/pagination/legacy.js';
import { createCursorFoundation, type CursorSelection } from '../dist/text-input/cursor.js';

function pagination(pagination: LegacyPaginationState['pagination'] = undefined) {
  const state = {
    pagination,
    localCurrent: getDefaultCurrent({ pagination }),
    localPageSize: getDefaultPageSize({ pagination }),
  };
  const events: unknown[][] = [];
  const api = createLegacyPaginationFoundation(state, function (name, value) {
    assert.equal(this, undefined);
    events.push([name, value, state.localCurrent, state.localPageSize]);
  });
  return { state, events, api };
}

test('compat pagination defaults preserve absent/boolean and explicit zero/nonfinite values', () => {
  for (const config of [undefined, false, true]) {
    assert.equal(getDefaultCurrent({ pagination: config }), 1);
    assert.equal(getDefaultPageSize({ pagination: config }), 10);
  }
  assert.equal(getDefaultCurrent({ pagination: { defaultCurrent: 0 } }), 0);
  assert.equal(getDefaultPageSize({ pagination: { defaultPageSize: -2 } }), -2);
  assert.ok(Number.isNaN(getDefaultCurrent({ pagination: { defaultCurrent: NaN } })));
  assert.equal(getDefaultPageSize({ pagination: { defaultPageSize: Infinity } }), Infinity);
});

test('pagination defaults preserve repeated live configuration reads', () => {
  let reads = 0;
  assert.equal(
    getDefaultCurrent({
      get pagination() {
        reads++;
        return { defaultCurrent: reads };
      },
    }),
    2,
  );
  assert.equal(reads, 2);
});

test('pagination factory is inert until a derived value or event is requested', () => {
  createLegacyPaginationFoundation(
    {
      get pagination() {
        throw Error('config');
      },
      get localCurrent() {
        throw Error('page');
      },
      set localCurrent(_value: number) {
        throw Error('page');
      },
      get localPageSize() {
        throw Error('size');
      },
      set localPageSize(_value: number) {
        throw Error('size');
      },
    },
    () => {},
  );
});

test('controlled pagination requests retain local state for later release without accepting the model', () => {
  const { state, api, events } = pagination({
    current: 0,
    pageSize: 3,
    defaultCurrent: 2,
    defaultPageSize: 7,
  });
  api.handlePageChange(8);
  api.handlePageSizeChange(11);
  assert.equal(api.getCurrent(), 0);
  assert.equal(api.getPageSize(), 3);
  state.pagination = undefined;
  assert.equal(api.getCurrent(), 8);
  assert.equal(api.getPageSize(), 11);
  assert.deepEqual(events, [
    ['pageChange', 8, 8, 7],
    ['pageSizeChange', 11, 8, 11],
  ]);
});

test('changing pagination defaults does not reinitialize existing local state', () => {
  const { state, api } = pagination({ defaultCurrent: 4, defaultPageSize: 6 });
  state.pagination = { defaultCurrent: 9, defaultPageSize: 12 };
  assert.equal(api.getCurrent(), 4);
  assert.equal(api.getPageSize(), 6);
  state.pagination = false;
  assert.equal(api.getCurrent(), 4);
  assert.equal(api.getPageSize(), 6);
});

test('pagination page-size requests do not reset page or normalize payloads', () => {
  const { state, api } = pagination();
  api.handlePageChange(-3);
  api.handlePageSizeChange(0);
  assert.equal(state.localCurrent, -3);
  assert.equal(state.localPageSize, 0);
  assert.equal(api.getCurrent(), -3);
});

test('pagination controlled values short-circuit unused local getters', () => {
  const api = createLegacyPaginationFoundation(
    {
      pagination: { current: 0, pageSize: 0 },
      get localCurrent() {
        throw Error('page');
      },
      set localCurrent(_value: number) {},
      get localPageSize() {
        throw Error('size');
      },
      set localPageSize(_value: number) {},
    },
    () => {},
  );
  assert.equal(api.getCurrent(), 0);
  assert.equal(api.getPageSize(), 0);
});

test('pagination commits before notification and preserves state when a callback throws', () => {
  const error = Error('emit'),
    state = { pagination: undefined, localCurrent: 1, localPageSize: 10 };
  const api = createLegacyPaginationFoundation(state, () => {
    assert.equal(state.localCurrent, 5);
    throw error;
  });
  assert.throws(
    () => api.handlePageChange(5),
    (value) => value === error,
  );
  assert.equal(state.localCurrent, 5);
});

function cursor(value = 'abcXYZ', start: number | null = 3, end: number | null = start) {
  const calls: number[][] = [];
  const input = {
    value,
    selectionStart: start,
    selectionEnd: end,
    setSelectionRange(a: number, b: number) {
      assert.equal(this, input);
      calls.push([a, b]);
    },
  };
  const state = {
    input: input as unknown as HTMLInputElement | undefined,
    selection: undefined as CursorSelection | undefined,
  };
  return { input, state, calls, api: createCursorFoundation(state) };
}

test('cursor controller is inert without an input or prior snapshot', () => {
  const { api, state, calls } = cursor();
  api.setCursor();
  assert.deepEqual(calls, []);
  state.input = undefined;
  api.recordCursor();
  api.setCursor();
  assert.deepEqual(calls, []);
});

test('cursor suffix recovery retains the caret relative to unchanged trailing text', () => {
  const { input, api, calls } = cursor();
  api.recordCursor();
  input.value = 'longabcXYZ';
  api.setCursor();
  assert.deepEqual(calls, [[7, 7]]);
});

test('cursor snapshot ports receive a complete replacement with only fields used for recovery', () => {
  const { input, state, api } = cursor();
  api.recordCursor();
  const first = state.selection;
  assert.deepEqual(first, { selectionStart: 3, beforeTxt: 'abc', afterTxt: 'XYZ' });
  input.value = 'newXYZ';
  api.recordCursor();
  assert.notEqual(state.selection, first);
  assert.deepEqual(state.selection, { selectionStart: 3, beforeTxt: 'new', afterTxt: 'XYZ' });
});

test('cursor prefix recovery is used when trailing text was replaced', () => {
  const { input, api, calls } = cursor();
  api.recordCursor();
  input.value = 'abcNEW';
  api.setCursor();
  assert.deepEqual(calls, [[3, 3]]);
});

test('cursor searches the prior last character from the original selection offset', () => {
  const { input, api, calls } = cursor();
  api.recordCursor();
  input.value = 'c--cZ';
  api.setCursor();
  assert.deepEqual(calls, [[4, 4]]);
});

test('cursor falls back to the end when no prefix, suffix or prior character survives', () => {
  const { input, api, calls } = cursor();
  api.recordCursor();
  input.value = 'none';
  api.setCursor();
  assert.deepEqual(calls, [[4, 4]]);
});

test('cursor collapses an original selection after formatting using the original suffix', () => {
  const { input, api, calls } = cursor('abCDxyz', 2, 4);
  api.recordCursor();
  input.value = 'ABab--xyz';
  api.setCursor();
  assert.deepEqual(calls, [[6, 6]]);
});

test('invalid native selection and a temporarily missing input preserve the prior snapshot', () => {
  const { input, state, api, calls } = cursor();
  api.recordCursor();
  input.selectionStart = null;
  api.recordCursor();
  state.input = undefined;
  api.recordCursor();
  state.input = input as unknown as HTMLInputElement;
  input.value = 'longabcXYZ';
  api.setCursor();
  assert.deepEqual(calls, [[7, 7]]);
});

test('cursor record clamps slice offsets but keeps end-of-input recovery', () => {
  const { input, api, calls } = cursor('abc', -2, -1);
  api.recordCursor();
  input.value = 'newabc';
  api.setCursor();
  assert.deepEqual(calls, [[3, 3]]);
  input.selectionStart = 100;
  input.selectionEnd = 100;
  api.recordCursor();
  input.value = 'changed';
  api.setCursor();
  assert.deepEqual(calls.at(-1), [7, 7]);
});

test('cursor targets the latest native ref after reading the formatted value', () => {
  const { input, state, api } = cursor();
  api.recordCursor();
  const calls: number[][] = [];
  const latest = {
    setSelectionRange(a: number, b: number) {
      assert.equal(this, latest);
      calls.push([a, b]);
    },
  } as HTMLInputElement;
  Object.defineProperty(input, 'value', {
    get() {
      state.input = latest;
      return 'longabcXYZ';
    },
  });
  api.setCursor();
  assert.deepEqual(calls, [[7, 7]]);
});

test('native selection errors propagate without swallowing or retries', () => {
  const { input, api } = cursor();
  api.recordCursor();
  const error = Error('selection');
  let calls = 0;
  input.setSelectionRange = () => {
    calls++;
    throw error;
  };
  assert.throws(
    () => api.setCursor(),
    (value) => value === error,
  );
  assert.equal(calls, 1);
});
