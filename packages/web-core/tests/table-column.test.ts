import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SortDirection } from '../dist/table/query.js';

import {
  createColumnFilterFoundation,
  type ColumnFilterState,
} from '../dist/table/column-filter.js';
import {
  createColumnSorterFoundation,
  type ColumnSorterState,
} from '../dist/table/column-sorter.js';
function filterFixture() {
  let controller: ReturnType<typeof createColumnFilterFoundation>;
  const applied = ['alpha'];
  const state: { -readonly [Key in keyof ColumnFilterState]: ColumnFilterState[Key] } = {
    column: { dataIndex: 'name', filterable: { multiple: true } },
    context: { filters: { name: applied } },
    get filterValue() {
      return controller.getFilterValue();
    },
    filterPopupVisible: true,
    columnFilterValue: applied,
  };
  controller = createColumnFilterFoundation(state);
  return { state, controller, applied };
}
function sorterFixture() {
  let controller: ReturnType<typeof createColumnSorterFoundation>;
  const state: { -readonly [Key in keyof ColumnSorterState]: ColumnSorterState[Key] } = {
    column: { dataIndex: 'name', sortable: { sortDirections: ['ascend', 'descend'] } },
    context: { sorter: { field: 'name', direction: 'ascend' } },
    get sortOrder() {
      return controller.getSortOrder();
    },
    get sortDirections() {
      return controller.getSortDirections();
    },
    get nextSortOrder() {
      return controller.getNextSortOrder();
    },
  };
  controller = createColumnSorterFoundation(state);
  return { state, controller };
}
const event = { type: 'native' } as Event;

test('filter reads applied state and multiple settings without owning parent filters', () => {
  const { state, controller, applied } = filterFixture();
  assert.equal(controller.getFilterValue(), applied);
  assert.equal(controller.isFilterActive(), true);
  assert.equal(controller.isMultipleFilter(), true);
  controller.setFilterValue([]);
  assert.equal(controller.isFilterActive(), true);
  assert.equal(state.context.filters!.name, applied);
  state.column = { dataIndex: 'other' };
  assert.deepEqual(controller.getFilterValue(), []);
  assert.equal(controller.isFilterActive(), false);
  assert.equal(controller.isMultipleFilter(), false);
});
test('external equal arrays preserve draft identity while changed arrays replace it without cloning', () => {
  const { state, controller } = filterFixture();
  const draft = ['beta'];
  controller.setFilterValue(draft);
  controller.syncFilterValue(['beta']);
  assert.equal(state.columnFilterValue, draft);
  controller.syncFilterValue('invalid' as never);
  assert.equal(state.columnFilterValue, draft);
  const external = ['gamma'];
  controller.syncFilterValue(external);
  assert.equal(state.columnFilterValue, external);
});
test('checkbox and radio drafts retain original value/array conventions and popup controls stay local', () => {
  const { state, controller, applied } = filterFixture();
  const values = ['alpha', 'alpha', '0'];
  controller.handleCheckboxFilterChange(values);
  assert.equal(state.columnFilterValue, values);
  controller.handleRadioFilterChange('0');
  assert.deepEqual(state.columnFilterValue, ['0']);
  controller.handleFilterPopupVisibleChange(false);
  assert.equal(state.filterPopupVisible, false);
  assert.equal(state.context.filters!.name, applied);
});
test('confirm notifies with current draft and exact event before closing, preserving context receiver', () => {
  const { state, controller, applied } = filterFixture();
  const draft = ['draft'];
  controller.setFilterValue(draft);
  let called = 0;
  state.context = {
    filters: { name: applied },
    onFilterChange(field, values, received) {
      called++;
      assert.equal(this, state.context);
      assert.equal(field, 'name');
      assert.equal(values, draft);
      assert.equal(received, event);
      assert.equal(state.filterPopupVisible, true);
    },
  };
  controller.handleFilterConfirm(event);
  assert.equal(called, 1);
  assert.equal(state.filterPopupVisible, false);
  assert.equal(state.context.filters!.name, applied);
  assert.equal(state.columnFilterValue, draft);
});
test('reset clears first, notifies while visible and keeps callback changes before closing', () => {
  const { state, controller } = filterFixture();
  const replacement = ['callback'];
  state.context = {
    onFilterChange(field, values, received) {
      assert.equal(field, 'name');
      assert.equal(values, state.columnFilterValue);
      assert.deepEqual(values, []);
      assert.equal(received, event);
      assert.equal(state.filterPopupVisible, true);
      controller.setFilterValue(replacement);
    },
  };
  controller.handleFilterReset(event);
  assert.equal(state.columnFilterValue, replacement);
  assert.equal(state.filterPopupVisible, false);
});
test('missing field does not read context and missing callbacks still close/reset locally', () => {
  const { state, controller } = filterFixture();
  state.column = { dataIndex: '' };
  Object.defineProperty(state, 'context', {
    configurable: true,
    get() {
      throw Error('context read');
    },
  });
  assert.deepEqual(controller.getFilterValue(), []);
  controller.handleFilterConfirm(event);
  assert.equal(state.filterPopupVisible, false);
  controller.handleFilterReset(event);
  assert.deepEqual(state.columnFilterValue, []);
  Object.defineProperty(state, 'context', { configurable: true, value: {} });
  state.column = { dataIndex: 'name' };
  controller.handleFilterPopupVisibleChange(true);
  controller.handleFilterConfirm(event);
  assert.equal(state.filterPopupVisible, false);
});
test('callback failures retain the original confirm/reset notification and close order', () => {
  const { state, controller } = filterFixture();
  const failure = Error('consumer failed');
  state.context = {
    onFilterChange() {
      throw failure;
    },
  };
  assert.throws(() => controller.handleFilterConfirm(event), failure);
  assert.equal(state.filterPopupVisible, true);
  assert.deepEqual(state.columnFilterValue, ['alpha']);
  assert.throws(() => controller.handleFilterReset(event), failure);
  assert.equal(state.filterPopupVisible, true);
  assert.deepEqual(state.columnFilterValue, []);
});
test('field and context replacements are read live for applied filters and subsequent requests', () => {
  const { state, controller } = filterFixture();
  const next = ['new'];
  state.column = { dataIndex: 'next' };
  state.context = {
    filters: { next },
    onFilterChange(field, values) {
      assert.equal(field, 'next');
      assert.equal(values, next);
    },
  };
  assert.equal(controller.getFilterValue(), next);
  controller.syncFilterValue(controller.getFilterValue());
  controller.handleFilterConfirm(event);
});
test('sort state only follows the matching field and exposes original direction array identity', () => {
  const { state, controller } = sorterFixture();
  const directions = state.column.sortable!.sortDirections!;
  assert.equal(controller.getSortDirections(), directions);
  assert.equal(controller.getSortOrder(), 'ascend');
  assert.equal(controller.hasSorter(), true);
  assert.equal(controller.hasAscendBtn(), true);
  assert.equal(controller.hasDescendBtn(), true);
  state.column = { dataIndex: 'other' };
  assert.equal(controller.getSortOrder(), undefined);
  assert.deepEqual(controller.getSortDirections(), []);
  assert.equal(controller.hasSorter(), false);
});
test('sort cycle preserves custom order, single directions and clearing behavior', () => {
  const { state, controller } = sorterFixture();
  for (const [directions, current, expected] of [
    [['ascend', 'descend'], undefined, 'ascend'],
    [['ascend', 'descend'], 'ascend', 'descend'],
    [['ascend', 'descend'], 'descend', ''],
    [['descend', 'ascend'], undefined, 'descend'],
    [['descend'], 'descend', ''],
    [[], undefined, ''],
  ] as const) {
    state.column = { dataIndex: 'name', sortable: { sortDirections: [...directions] } };
    state.context = current ? { sorter: { field: 'name', direction: current } } : {};
    assert.equal(controller.getNextSortOrder(), expected);
  }
  state.column = { dataIndex: 'name', sortable: { sortDirections: ['descend'] } };
  assert.equal(controller.hasAscendBtn(), false);
  assert.equal(controller.hasDescendBtn(), true);
});
test('sort requests preserve event and context, do not commit controlled state and use live next order', () => {
  const { state, controller } = sorterFixture();
  const calls: SortDirection[] = [];
  state.context = {
    sorter: { field: 'name', direction: 'ascend' },
    onSorterChange(field, direction, received) {
      assert.equal(this, state.context);
      assert.equal(field, 'name');
      assert.equal(received, event);
      calls.push(direction);
    },
  };
  controller.handleClickSorter(event);
  assert.deepEqual(calls, ['descend']);
  assert.equal(state.context.sorter!.direction, 'ascend');
  state.column = { dataIndex: 'name', sortable: { sortDirections: ['ascend'] } };
  controller.handleClickSorter(event);
  assert.deepEqual(calls, ['descend', '']);
});
test('sort field guards and absent callbacks preserve short-circuit reads', () => {
  const { state, controller } = sorterFixture();
  state.column = { dataIndex: '' };
  Object.defineProperty(state, 'context', {
    configurable: true,
    get() {
      throw Error('context read');
    },
  });
  assert.equal(controller.getSortOrder(), undefined);
  controller.handleClickSorter(event);
  Object.defineProperty(state, 'context', { configurable: true, value: {} });
  state.column = { dataIndex: 'name' };
  controller.handleClickSorter(event);
});
