import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { DataColumn } from '../src/table/data.ts';
import type { LayoutColumn } from '../src/table/layout.ts';
import type { RowKey } from '../src/table/selection.ts';

import {
  collectRawKeys,
  collectRowKeys,
  filterRows,
  getSummaryData,
  mapRawTableData,
  pageRows,
  processRows,
  reorderRows,
  sortRows,
} from '../dist/table/data.js';
import { createExpansionFoundation, getDefaultExpandedRowKeys } from '../dist/table/expand.js';
import {
  getGroupColumns,
  getFixedNumber,
  getTableGridTemplate,
  getGridSpanStyle,
} from '../dist/table/layout.js';
import { computeTableSpans } from '../dist/table/span.js';

interface Raw extends Record<string, unknown> {
  key: RowKey;
  children?: Raw[];
  disabled?: boolean;
  isLeaf?: boolean;
  rank?: number;
  kind?: string;
  expand?: unknown;
}
const process = (data: Raw[]) =>
  processRows(data, {
    rowKey: 'key',
    loadMore: false,
    hideExpandButtonOnEmpty: true,
    lazyLoadData: new Map(),
  });

test('lazy row modeling keeps opaque render content, empty-child rules and raw identity', () => {
  const render = () => {
    throw new Error('a foundation must never render');
  };
  const data: Raw[] = [
    { key: 'empty', children: [], expand: render },
    { key: 'lazy', disabled: true },
    { key: 'leaf', isLeaf: true },
  ];
  const rows = processRows(data, {
    rowKey: 'key',
    loadMore: true,
    hideExpandButtonOnEmpty: true,
    lazyLoadData: new Map([['lazy', [{ key: 2, isLeaf: true }]]]),
  });
  assert.equal(rows[0].isLeaf, false);
  assert.equal(rows[0].hasSubtree, false);
  assert.equal(rows[0].expand, render);
  assert.equal(rows[1].children![0].raw.key, 2);
  assert.equal(rows[2].hasSubtree, false);
  assert.deepEqual(collectRowKeys(rows, true), ['empty', 2, 'leaf']);
  assert.deepEqual(collectRawKeys(data, 'key'), ['empty', 'lazy', 'leaf']);
  assert.equal(mapRawTableData(rows)[1], data[1]);
  assert.equal(Object.hasOwn(data[1], 'children'), false);
});

test('filtering clones modeled nodes, keeps raw records, and prunes rejected parent subtrees', () => {
  const data: Raw[] = [
    {
      key: 'keep',
      kind: 'show',
      children: [
        { key: 1, kind: 'hide' },
        { key: 2, kind: 'show' },
      ],
    },
    { key: 'drop', kind: 'hide', children: [{ key: 3, kind: 'show' }] },
  ];
  const rows = process(data);
  const seen: RowKey[] = [];
  const columns = new Map<string, DataColumn<Raw>>([
    [
      'kind',
      {
        filterable: {
          filter: (values, record) => {
            seen.push(record.key);
            return values.includes(record.kind!);
          },
        },
      },
    ],
  ]);
  assert.equal(filterRows(rows, {}, columns), rows);
  const filtered = filterRows(rows, { kind: ['show'] }, columns);
  assert.deepEqual(collectRowKeys(filtered), ['keep', 2]);
  assert.deepEqual(seen, ['keep', 1, 2, 'drop']);
  assert.equal(filtered[0].raw, data[0]);
  assert.notEqual(filtered[0], rows[0]);
  assert.equal(rows[0].children!.length, 2);
});

test('sorting preserves remote and custom contracts and leaves child sort order unchanged', () => {
  const rows = process([
    {
      key: 'b',
      rank: 2,
      children: [
        { key: 'high', rank: 9 },
        { key: 'low', rank: 1 },
      ],
    },
    { key: 'a', rank: 1 },
  ]);
  const columns = new Map<string, DataColumn<Raw>>([['rank', { sortable: { sorter: false } }]]);
  const ascending = sortRows(rows, { field: 'rank', direction: 'ascend' }, columns);
  assert.deepEqual(
    ascending.map((row) => row.key),
    ['a', 'b'],
  );
  assert.deepEqual(
    ascending[1].children!.map((row) => row.key),
    ['high', 'low'],
  );
  assert.deepEqual(
    rows.map((row) => row.key),
    ['b', 'a'],
  );
  columns.set('rank', { sortable: { sorter: true } });
  assert.deepEqual(
    sortRows(rows, { field: 'rank', direction: 'ascend' }, columns).map((row) => row.key),
    ['b', 'a'],
  );
  const calls: unknown[] = [];
  columns.set('rank', {
    sortable: {
      sorter: (a, b, extra) => {
        calls.push(extra);
        return b.rank! - a.rank!;
      },
    },
  });
  assert.deepEqual(
    sortRows(rows, { field: 'rank', direction: 'ascend' }, columns).map((row) => row.key),
    ['b', 'a'],
  );
  assert.deepEqual(calls[0], { dataIndex: 'rank', direction: 'ascend' });
});

test('sibling reorder, pagination and summaries retain data boundaries without mutating raw input', () => {
  const rows = process([
    { key: 'root', children: [{ key: 1 }, { key: 2 }] },
    { key: 'other', children: [{ key: 3 }] },
  ]);
  const moved = sortRows(rows, undefined, new Map());
  reorderRows(moved, [0, 0], [0, 1]);
  assert.deepEqual(
    moved[0].children!.map((row) => row.key),
    [2, 1],
  );
  reorderRows(moved, [0, 0], [1, 0]);
  assert.deepEqual(
    moved[0].children!.map((row) => row.key),
    [2, 1],
  );
  assert.deepEqual(
    rows[0].children!.map((row) => row.key),
    [1, 2],
  );
  assert.equal(pageRows(rows, 1, 10, true), rows);
  assert.deepEqual(pageRows(rows, 2, 1, true), [rows[1]]);
  const summary = getSummaryData(
    [
      { dataIndex: 'label' },
      { dataIndex: 'nested.amount' },
      { dataIndex: 'mixed' },
      { dataIndex: '__proto__.polluted' },
    ],
    process([
      { key: 1, nested: { amount: 1 }, mixed: 2 },
      { key: 2, nested: { amount: 3 }, mixed: 'x' },
    ]),
    'Total',
  );
  assert.deepEqual(summary, { label: 'Total', nested: { amount: 4 }, mixed: '' });
  assert.equal(Object.hasOwn(Object.prototype, 'polluted'), false);
});

test('grouped columns retain renderer-owned fields, fixed boundaries and own-key width overrides', () => {
  interface Column extends LayoutColumn<Column> {
    title?: unknown;
  }
  const title = { opaqueRenderer: true };
  const columns: Column[] = [
    {
      title,
      fixed: 'left',
      children: [
        { dataIndex: '__proto__', width: 40 },
        { dataIndex: 'name', width: 60 },
      ],
    },
    { dataIndex: 'right', fixed: 'right', width: 80 },
  ];
  const widths: Record<string, number> = Object.create({ name: 999 });
  Object.defineProperty(widths, '__proto__', { value: 72, enumerable: true });
  const columnMap = new Map<string, Column>();
  const { dataColumns, groupColumns } = getGroupColumns(columns, columnMap, widths);
  assert.equal(groupColumns.length, 2);
  assert.equal(groupColumns[0][0].colSpan, 2);
  assert.equal(groupColumns[0][0].title, title);
  assert.equal(groupColumns[0][0].isLastLeftFixed, true);
  assert.equal(dataColumns[0]._resizeWidth, 72);
  assert.equal(dataColumns[1]._resizeWidth, undefined);
  assert.equal(dataColumns[1].isLastLeftFixed, true);
  assert.equal(dataColumns[2].rowSpan, 2);
  assert.equal(dataColumns[2].isFirstRightFixed, true);
  assert.equal(columns[0].children![0].fixed, undefined);
  assert.equal(
    getFixedNumber(dataColumns[1], { dataColumns, operations: [{ name: 'selection' }] }),
    112,
  );
  assert.equal(
    getTableGridTemplate(dataColumns, [{ name: 'selection' }], widths),
    '40px 72px 60px 80px',
  );
  assert.deepEqual(getGridSpanStyle(2, 3), { gridRow: 'span 2', gridColumn: 'span 3' });
});

test('span calculation returns covered cells and expansion reads current keys with existing event order', () => {
  const data = process([{ key: 'a' }, { key: 'b' }]);
  const span = computeTableSpans(data, ['first', 'second'], ({ rowIndex, columnIndex }) =>
    rowIndex === 0 && columnIndex === 0 ? { rowspan: 2, colspan: 2 } : undefined,
  );
  assert.deepEqual(span.tableSpan, { '0-0-a': [2, 2] });
  assert.deepEqual(span.removedCells, ['0-1-a', '1-0-b', '1-1-b']);
  assert.deepEqual(
    getDefaultExpandedRowKeys({
      defaultExpandedKeys: [],
      defaultExpandAllRows: true,
      allRowKeys: [1, 2],
    }),
    [],
  );
  let keys: RowKey[] = [];
  let all: RowKey[] = [1, '2'];
  const events: string[] = [];
  const expansion = createExpansionFoundation<Raw>({
    getExpandedKeys: () => keys,
    getAllKeys: () => all,
    setExpandedKeys: (value) => {
      keys = value;
      events.push('commit');
    },
    onExpand: () => {
      events.push('expand');
    },
    onExpandedChange: () => {
      events.push('change');
    },
    onUpdateExpandedKeys: () => {
      events.push('update');
    },
  });
  expansion.handleExpand(1, { key: 1 });
  assert.deepEqual(events, ['commit', 'expand', 'change', 'update']);
  expansion.expand([1, '2']);
  assert.deepEqual(keys, [1, '2']);
  all = [3];
  expansion.expandAll();
  assert.deepEqual(keys, [3]);
});
