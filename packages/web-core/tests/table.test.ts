import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Filters, QueryColumn, Sorter } from '../src/table/query.ts';
import type { RowKey } from '../src/table/selection.ts';

import {
  createFilterFoundation,
  createSorterFoundation,
  getDefaultFilters,
  getDefaultSorter,
} from '../dist/table/query.js';
import { createRowSelectionFoundation, getSelectionStatus } from '../dist/table/selection.js';

test('filter defaults, controlled empty values and selective resets retain precedence', () => {
  const columns: QueryColumn[] = [
    { dataIndex: 'name', filterable: { defaultFilteredValue: ['default'] } },
    { dataIndex: '__proto__', filterable: { filteredValue: [] } },
  ];
  let state: Filters = { name: ['edited'], other: ['keep'] };
  const calls: unknown[] = [];
  const foundation = createFilterFoundation({
    getColumns: () => columns,
    getState: () => state,
    setState: (value) => {
      state = value;
    },
    onFilterChange: (field, value) => calls.push([field, value, state.name]),
  });
  assert.equal(Object.getPrototypeOf(getDefaultFilters(columns)), null);
  assert.equal(Object.getPrototypeOf(foundation.getValues()), null);
  assert.deepEqual(foundation.getValues().__proto__, []);
  foundation.resetFilters('name');
  assert.deepEqual(state, { name: ['default'], other: ['keep'] });
  assert.deepEqual(calls, [['name', ['default'], ['edited']]]);
  columns[0].filterable!.filteredValue = [];
  assert.deepEqual(foundation.getValues().name, []);
  foundation.clearFilters();
  assert.deepEqual(Object.keys(state), ['name', '__proto__']);
  assert.deepEqual(state.name, []);
});

test('sorter rules use the first active column and distinguish empty controlled order', () => {
  const columns: QueryColumn[] = [
    { dataIndex: 'first', sortable: { defaultSortOrder: 'ascend', sortOrder: '' } },
    { dataIndex: 'second', sortable: { sortOrder: 'descend', defaultSortOrder: 'descend' } },
  ];
  let state: Sorter | undefined = getDefaultSorter(columns);
  const calls: unknown[] = [];
  const foundation = createSorterFoundation({
    getColumns: () => columns,
    getState: () => state,
    setState: (value) => {
      state = value;
    },
    onSorterChange: (field, direction) => calls.push([field, direction]),
  });
  assert.deepEqual(state, { field: 'first', direction: 'ascend' });
  assert.deepEqual(foundation.getValue(), { field: 'second', direction: 'descend' });
  foundation.resetSorters();
  assert.deepEqual(calls, [
    ['first', 'ascend'],
    ['second', 'descend'],
  ]);
  columns[0].sortable!.sortOrder = undefined;
  assert.deepEqual(foundation.getValue(), state);
  foundation.clearSorters();
  assert.deepEqual(calls.slice(-2), [
    ['first', ''],
    ['second', ''],
  ]);
});

test('row selection preserves off-page keys, enabled boundaries and event order', () => {
  let keys: RowKey[] = ['off-page', 'disabled'];
  let radio = false;
  const events: unknown[] = [];
  const foundation = createRowSelectionFoundation<{ label: string }>({
    getSelectedKeys: () => keys,
    getEnabledKeys: () => [1, 2],
    isRadio: () => radio,
    setSelectedKeys: (value) => {
      keys = value;
      events.push('commit');
    },
    onSelectAll: (value) => events.push(['all', value]),
    onSelect: (value, key, raw) => events.push(['select', value, key, raw]),
    onSelectionChange: (value) => events.push(['change', value]),
    onUpdateSelectedKeys: (value) => events.push(['update', value]),
  });
  foundation.handleSelectAll(true);
  assert.deepEqual(keys, ['off-page', 'disabled', 1, 2]);
  assert.deepEqual(
    events.map((event) => (Array.isArray(event) ? event[0] : event)),
    ['commit', 'all', 'change', 'update'],
  );
  foundation.selectAll(false);
  assert.deepEqual(keys, ['off-page', 'disabled']);
  foundation.handleSelectAllLeafs(
    {
      key: 'parent',
      raw: { label: 'root' },
      children: [
        { key: 1, raw: { label: 'one' }, isLeaf: true },
        { key: 'disabled-child', raw: { label: 'disabled' }, isLeaf: true },
      ],
    },
    true,
  );
  assert.deepEqual(keys, ['off-page', 'disabled', 1]);
  assert.deepEqual(getSelectionStatus(keys, [1, 2]), { checked: false, indeterminate: true });
  radio = true;
  foundation.handleSelect(true, { key: 2, raw: { label: 'two' } });
  assert.deepEqual(keys, [2]);
  foundation.select(2, false);
  assert.deepEqual(keys, []);
});

test('controlled selection always reads the adapter instead of retaining stale internal keys', () => {
  let controlled: RowKey[] = [];
  let internal: RowKey[] = [];
  const foundation = createRowSelectionFoundation<unknown>({
    getSelectedKeys: () => controlled,
    getEnabledKeys: () => [],
    isRadio: () => false,
    setSelectedKeys: (keys) => {
      internal = keys;
    },
    onSelectAll: () => {},
    onSelect: () => {},
    onSelectionChange: () => {},
    onUpdateSelectedKeys: () => {},
  });
  foundation.select('first');
  assert.deepEqual(internal, ['first']);
  foundation.select('second');
  assert.deepEqual(internal, ['second']);
  controlled = ['second'];
  foundation.select(2);
  assert.deepEqual(internal, ['second', 2]);
});
