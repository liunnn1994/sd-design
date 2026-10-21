import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import assert from 'node:assert/strict';
import test from 'node:test';

import type { Cell, Mode, IsSameTime } from '../dist/date-picker/types.js';
import type { TreeNodeContext } from '../dist/tree/node.js';

import { createDateCellRangeFoundation } from '../dist/date-picker/cell-range.js';
import { createDatePanelBodyFoundation } from '../dist/date-picker/panel-body.js';
import { createTreeNodeFoundation } from '../dist/tree/node.js';

function tree() {
  const trace: unknown[] = [];
  const state = {
    key: 'node' as string | number,
    isLeaf: false,
    children: undefined as unknown[] | undefined,
    expanded: false as boolean | undefined,
    disableCheckbox: false,
    disabled: false,
    selectable: true,
    actionOnNodeClick: [] as string[],
  };
  const context: Partial<TreeNodeContext> = {
    onExpand(...args) {
      assert.equal(this, context);
      trace.push(['expand', ...args]);
    },
    onSelect(...args) {
      assert.equal(this, context);
      trace.push(['select', ...args]);
    },
    onCheck(...args) {
      assert.equal(this, context);
      trace.push(['check', ...args]);
    },
    onNodeEvent(...args) {
      assert.equal(this, context);
      trace.push(['event', ...args]);
    },
    onNodeKeydown(...args) {
      assert.equal(this, context);
      trace.push(['keyboard', ...args]);
    },
  };
  const api = createTreeNodeFoundation(state, context);
  const event = new Event('click');
  return { state, context, api, trace, event };
}

for (const isLeaf of [false, true])
  for (const children of [undefined, [], [1]])
    for (const loader of [false, true]) {
      test(`tree switcher preserves leaf/load/expand branches: ${isLeaf}/${children?.length}/${loader}`, () => {
        const { state, context, api, trace, event } = tree();
        state.isLeaf = isLeaf;
        state.children = children;
        if (loader)
          context.onLoadMore = function (key) {
            assert.equal(this, context);
            trace.push(['load', key]);
          };
        api.onSwitcherClick(event);
        assert.deepEqual(
          trace,
          isLeaf
            ? []
            : loader && !children?.length
              ? [['load', 'node']]
              : [['expand', true, 'node', event]],
        );
      });
    }

test('tree constructor and missing optional callbacks/arrays do not read node key', () => {
  const base = tree().state;
  const api = createTreeNodeFoundation(
    {
      ...base,
      get key(): string {
        assert.fail('key');
      },
      isLeaf: true,
      selectable: false,
    },
    {},
  );
  assert.equal(api.getChecked(), undefined);
  assert.equal(api.getIndeterminate(), undefined);
  assert.equal(api.getSelected(), undefined);
  assert.equal(api.getExpanded(), undefined);
  assert.equal(api.getLoading(), undefined);
  api.onSwitcherClick(new Event('click'));
  api.onCheckboxChange(true, new Event('change'));
  api.onTitleClick(new Event('click'));
  api.onTreeitemKeydown({} as KeyboardEvent);
});

test('tree status lookup keeps numeric/string distinction and live context arrays', () => {
  const { state, context, api } = tree();
  state.key = 0;
  for (const name of [
    'checkedKeys',
    'indeterminateKeys',
    'selectedKeys',
    'expandedKeys',
    'loadingKeys',
  ] as const)
    context[name] = ['0'];
  assert.equal(api.getChecked(), false);
  context.checkedKeys = [0];
  context.indeterminateKeys = [0];
  context.selectedKeys = [0];
  context.expandedKeys = [0];
  context.loadingKeys = [0];
  assert.deepEqual(
    [
      api.getChecked(),
      api.getIndeterminate(),
      api.getSelected(),
      api.getExpanded(),
      api.getLoading(),
    ],
    [true, true, true, true, true],
  );
});

test('tree click actions retain array identity and normalize only truthy actions', () => {
  const { context, api } = tree();
  assert.deepEqual(api.getActionOnNodeClick(), []);
  context.treeProps = { actionOnNodeClick: 'expand' };
  assert.deepEqual(api.getActionOnNodeClick(), ['expand']);
  const actions: 'expand'[] = ['expand'];
  context.treeProps.actionOnNodeClick = actions;
  assert.equal(api.getActionOnNodeClick(), actions);
});

test('tree title notification precedes live expansion policy and post-expand selection', () => {
  const { state, context, api, trace, event } = tree();
  state.selectable = false;
  context.onNodeEvent = function (name, key, e) {
    assert.equal(this, context);
    trace.push(['event', name, key, e]);
    state.actionOnNodeClick = ['expand'];
  };
  context.onExpand = function (...args) {
    assert.equal(this, context);
    trace.push(['expand', ...args]);
    state.key = 'new';
    state.selectable = true;
  };
  api.onTitleClick(event);
  assert.deepEqual(trace, [
    ['event', 'click', 'node', event],
    ['expand', true, 'node', event],
    ['select', 'new', event],
  ]);
});

test('tree disabled/nonselectable nodes still notify click and may expand, without selection', () => {
  const { state, api, trace, event } = tree();
  state.disabled = true;
  state.actionOnNodeClick = ['expand'];
  api.onTitleClick(event);
  assert.deepEqual(trace, [
    ['event', 'click', 'node', event],
    ['expand', true, 'node', event],
  ]);
});

for (const disabled of [false, true])
  for (const disableCheckbox of [false, true])
    for (const array of [false, true]) {
      test(`tree checkbox guards retain array/disabled policy: ${disabled}/${disableCheckbox}/${array}`, () => {
        const { state, api, trace, event } = tree();
        state.disabled = disabled;
        state.disableCheckbox = disableCheckbox;
        api.onCheckboxChange(array ? ['a'] : true, event);
        assert.deepEqual(
          trace,
          !disabled && !disableCheckbox && !array ? [['check', true, 'node', event]] : [],
        );
      });
    }

test('tree keyboard notifies before routing and re-reads key after callback mutation', () => {
  const { state, context, api, trace } = tree();
  const event = {} as KeyboardEvent;
  context.onNodeEvent = (name, key, e) => {
    trace.push(['event', name, key, e]);
    state.key = 0;
  };
  api.onTreeitemKeydown(event);
  assert.deepEqual(trace, [
    ['event', 'keydown', 'node', event],
    ['keyboard', 0, event],
  ]);
});

test('tree callback failure terminates remaining actions', () => {
  const { state, context, api, trace, event } = tree();
  state.actionOnNodeClick = ['expand'];
  context.onNodeEvent = () => {
    throw new Error('event');
  };
  assert.throws(() => api.onTitleClick(event), /event/);
  assert.deepEqual(trace, []);
  context.onNodeEvent = () => {};
  context.onLoadMore = () => {
    throw new Error('load');
  };
  assert.throws(() => api.onTitleClick(event), /load/);
  assert.deepEqual(trace, []);
});

function body() {
  const cell: Cell = { value: dayjs('2024-02-15'), label: '15' };
  const state = {
    value: undefined as Dayjs | undefined,
    disabledDate: undefined as ((date: Date) => boolean) | undefined,
    mode: 'date' as Mode | undefined,
    hideNotInViewDates: false,
  };
  const events: unknown[] = [];
  const classes = ['class'];
  const sameTime = {
    value: function (this: unknown, a: Dayjs, b: Dayjs) {
      assert.equal(this, sameTime);
      return a.isSame(b, 'date');
    },
  };
  const api = createDatePanelBodyFoundation(
    state,
    sameTime,
    (item, disabled) => {
      events.push(['class', item, disabled]);
      return classes;
    },
    (item) => events.push(['click', item]),
    (item) => events.push(['hover', item]),
  );
  return { cell, state, events, classes, sameTime, api };
}

for (const mode of ['date', 'week', 'month', 'quarter', 'year'] as const) {
  test(`date body preserves period-aware disabled checks: ${mode}`, () => {
    const { cell, state, api, events } = body();
    state.mode = mode;
    let calls = 0;
    state.disabledDate = function (this: unknown) {
      assert.equal(this, undefined);
      calls++;
      return true;
    };
    assert.equal(api.isCellDisabled(cell), true);
    assert.equal(calls, { date: 1, week: 1, month: 29, quarter: 91, year: 366 }[mode]);
    api.onCellClick(cell);
    api.onCellMouseEnter(cell);
    api.onCellMouseLeave(cell);
    assert.deepEqual(events, []);
    assert.equal(api.getIsWeek(), mode === 'week');
  });
}

test('date selected comparison retains cell receiver and current value', () => {
  const { cell, state, api } = body();
  assert.equal(api.isCellSelected(cell), false);
  state.value = cell.value;
  assert.equal(api.isCellSelected(cell), true);
  state.value = dayjs('2024-02-16');
  assert.equal(api.isCellSelected(cell), false);
});

test('date selected skips comparator/date reads without value or comparator', () => {
  const { state } = body();
  const cell = {
    get value(): Dayjs {
      assert.fail('date');
    },
    label: '',
  };
  const api = createDatePanelBodyFoundation(
    state,
    undefined,
    () => '',
    () => {},
    () => {},
  );
  assert.equal(api.isCellSelected(cell), false);
  state.value = dayjs('2024-01-01');
  assert.equal(api.isCellSelected(cell), false);
});

test('date selected keeps two callback/value reads and original callback receiver', () => {
  const trace: string[] = [];
  const first = dayjs('2024-01-01'),
    second = dayjs('2024-01-02');
  let current = first;
  const sameTime = {
    get value(): IsSameTime {
      trace.push('fn');
      return function (this: unknown, _date, value) {
        assert.equal(this, sameTime);
        assert.equal(value, second);
        trace.push('compare');
        return true;
      };
    },
  };
  const api = createDatePanelBodyFoundation(
    {
      get value() {
        trace.push('value');
        return current;
      },
      disabledDate: undefined,
      mode: undefined,
      hideNotInViewDates: false,
    },
    sameTime,
    () => '',
    () => {},
    () => {},
  );
  const cell = {
    get value() {
      trace.push('cell');
      current = second;
      return first;
    },
    label: '',
  };
  assert.equal(api.isCellSelected(cell), true);
  assert.deepEqual(trace, ['value', 'fn', 'fn', 'cell', 'value', 'compare']);
});

test('date hidden guard retains undefined and short-circuit flags behavior', () => {
  const { cell, state, api } = body();
  assert.equal(api.isHiddenNotInViewCell(cell), false);
  state.hideNotInViewDates = true;
  assert.equal(api.isHiddenNotInViewCell(cell), undefined);
  cell.isPrev = true;
  assert.equal(api.isHiddenNotInViewCell(cell), true);
  cell.isPrev = false;
  cell.isNext = true;
  assert.equal(api.isHiddenNotInViewCell(cell), true);
});

test('date class callback retains disabled argument and output identity, while leave retains hover emission', () => {
  const { cell, api, events, classes } = body();
  assert.equal(api.getCellClassNameFn(cell), classes);
  api.onCellClick(cell);
  api.onCellMouseEnter(cell);
  api.onCellMouseLeave(cell);
  assert.deepEqual(events, [
    ['class', cell, false],
    ['click', cell],
    ['hover', cell],
    ['hover', cell],
  ]);
});

test('date disabled callback precedes hidden guard and may change that guard', () => {
  const { cell, state, api, events } = body();
  cell.isPrev = true;
  state.disabledDate = () => {
    state.hideNotInViewDates = true;
    return false;
  };
  api.onCellClick(cell);
  assert.deepEqual(events, []);
  const guarded = createDatePanelBodyFoundation(
    {
      value: undefined,
      disabledDate: () => true,
      mode: 'date',
      get hideNotInViewDates(): boolean {
        assert.fail('hidden');
      },
    },
    undefined,
    () => '',
    () => assert.fail('click'),
    () => assert.fail('hover'),
  );
  guarded.onCellClick(cell);
  guarded.onCellMouseEnter(cell);
  guarded.onCellMouseLeave(cell);
});

test('date callback exception prevents class and event forwarding', () => {
  const { cell, state, api, events } = body();
  state.disabledDate = () => {
    throw new Error('disabled');
  };
  assert.throws(() => api.getCellClassNameFn(cell), /disabled/);
  assert.throws(() => api.onCellClick(cell), /disabled/);
  assert.deepEqual(events, []);
});

test('date range sorting clones complete arrays and retains endpoint identity', () => {
  const first = dayjs('2024-01-01'),
    last = dayjs('2024-01-31'),
    original = [last, first];
  const state = {
    rangeValues: original as Array<Dayjs | undefined> | undefined,
    sortedRangeValues: undefined as Array<Dayjs | undefined> | undefined,
  };
  const api = createDateCellRangeFoundation(state);
  const sorted = api.getSortedRangeValues();
  assert.notEqual(sorted, original);
  assert.deepEqual(original, [last, first]);
  assert.equal(sorted?.[0], first);
  state.sortedRangeValues = sorted;
  assert.equal(api.getRangeStart(), first);
  assert.equal(api.getRangeEnd(), last);
});

test('date incomplete ranges preserve array identity and undefined endpoints', () => {
  for (const values of [
    undefined,
    [undefined, dayjs('2024-01-01')],
    [dayjs('2024-01-01'), undefined],
  ]) {
    const api = createDateCellRangeFoundation({ rangeValues: values, sortedRangeValues: values });
    assert.equal(api.getSortedRangeValues(), values);
    assert.equal(api.getRangeStart(), values?.[0]);
    assert.equal(api.getRangeEnd(), values?.[1]);
  }
});

test('date empty range is sorted to a fresh empty array, without eager constructor reads', () => {
  let reads = 0;
  const source: Dayjs[] = [];
  const api = createDateCellRangeFoundation({
    get rangeValues() {
      reads++;
      return source;
    },
    get sortedRangeValues(): Dayjs[] {
      assert.fail('sorted');
    },
  });
  assert.equal(reads, 0);
  const sorted = api.getSortedRangeValues();
  assert.deepEqual(sorted, []);
  assert.notEqual(sorted, source);
  assert.equal(reads, 3);
});
