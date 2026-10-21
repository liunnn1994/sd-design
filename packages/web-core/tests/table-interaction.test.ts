import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TableDragState } from '../src/table/drag.ts';
import type { Filters, Sorter } from '../src/table/query.ts';

import { reorderRows } from '../dist/table/data.js';
import { createTableDragFoundation } from '../dist/table/drag.js';
import { createTableChangeFoundation } from '../dist/table/interaction.js';
import { getTableFixedColumns, getTableOperations } from '../dist/table/layout.js';

type Raw = { id: string };
type Row = { key: string; raw: Raw; children?: Row[] };
function setup() {
  const raw: Raw[] = [{ id: 'first' }, { id: 'second' }],
    sorted: Row[] = raw.map((item) => ({ key: item.id, raw: item }));
  const state = {
    page: 1,
    pageSize: 10,
    sorter: undefined as Sorter | undefined,
    filters: {} as Filters,
    dragTarget: raw[0]!,
    rawData: raw,
    sortedData: sorted,
    onlyCurrent: false,
  };
  const calls: unknown[][] = [];
  const adapter: Parameters<typeof createTableChangeFoundation<Raw, Row>>[1] = {
    setFilters: (value) => {
      calls.push(['filters', value]);
      state.filters = value;
    },
    setSorter: (value) => {
      calls.push(['sorter', value]);
      state.sorter = value;
    },
    onFilterChange: (field, values) => {
      calls.push(['filterChange', field, values]);
    },
    onSorterChange: (field, direction) => {
      calls.push(['sorterChange', field, direction]);
    },
    onChange: (data, extra, current) => {
      calls.push(['change', data, extra, current]);
    },
    changePage: (value) => {
      calls.push(['page', value]);
      state.page = value;
    },
    changePageSize: (value) => {
      calls.push(['pageSize', value]);
      state.pageSize = value;
      state.page = 1;
    },
    clearSelected: () => {
      calls.push(['clearSelected']);
    },
  };
  const drag: TableDragState = {
    dragging: false,
    committing: false,
    sourceKey: undefined,
    sourcePath: [],
    targetPath: [],
    data: {},
  };
  return { state, calls, adapter, drag, foundation: createTableChangeFoundation(state, adapter) };
}

test('table change construction is lazy and aggregate reads extra before raw and sorted payloads', () => {
  const s = setup(),
    reads: PropertyKey[] = [];
  const state = new Proxy(s.state, {
    get(target, key, receiver) {
      reads.push(key);
      return Reflect.get(target, key, receiver);
    },
  });
  const f = createTableChangeFoundation(state, s.adapter);
  assert.deepEqual(reads, []);
  f.change('filter');
  assert.deepEqual(reads, ['page', 'pageSize', 'sorter', 'filters', 'rawData', 'sortedData']);
  const call = s.calls[0]!;
  assert.equal(call[1], s.state.rawData);
  assert.equal(call[3], s.state.sortedData);
  assert.equal(Object.hasOwn(call[2] as object, 'dragTarget'), true);
  assert.equal((call[2] as { dragTarget: unknown }).dragTarget, undefined);
});

test('table filters merge before specific notification and aggregate sees callback-accepted state', () => {
  const s = setup(),
    previous = { old: ['old'] },
    requested = ['new'];
  s.state.filters = previous;
  const accepted = { accepted: ['yes'] };
  s.adapter.onFilterChange = (field, values) => {
    s.calls.push(['filterChange', field, values]);
    assert.equal(s.state.filters.current, requested);
    s.state.filters = accepted;
    s.state.page = 4;
  };
  s.foundation.filter('current', requested);
  assert.deepEqual(
    s.calls.map((call) => call[0]),
    ['filters', 'filterChange', 'change'],
  );
  assert.equal(previous.old[0], 'old');
  assert.equal(Object.hasOwn(previous, 'current'), false);
  const extra = s.calls[2]![2] as { filters: Filters; page: number };
  assert.equal(extra.filters, accepted);
  assert.equal(extra.page, 4);
});

test('table controlled sort requests do not replace authoritative aggregate state and empty direction clears', () => {
  const s = setup(),
    accepted: Sorter = { field: 'accepted', direction: 'descend' };
  s.state.sorter = accepted;
  s.adapter.setSorter = (value) => {
    s.calls.push(['sorter', value]);
  };
  s.foundation.sort('requested', 'ascend');
  assert.deepEqual(s.calls[0], ['sorter', { field: 'requested', direction: 'ascend' }]);
  assert.deepEqual(s.calls[1], ['sorterChange', 'requested', 'ascend']);
  assert.equal((s.calls[2]![2] as { sorter: Sorter }).sorter, accepted);
  s.calls.length = 0;
  s.foundation.sort('requested', '');
  assert.deepEqual(s.calls[0], ['sorter', undefined]);
  assert.deepEqual(s.calls[1], ['sorterChange', 'requested', '']);
});

test('table pagination sends aggregate only after current page/size handlers finish', () => {
  const s = setup();
  s.foundation.page(3);
  assert.deepEqual(
    s.calls.map((call) => call[0]),
    ['page', 'change'],
  );
  assert.equal((s.calls[1]![2] as { page: number }).page, 3);
  s.calls.length = 0;
  s.foundation.pageSize(30);
  assert.deepEqual(
    s.calls.map((call) => call[0]),
    ['pageSize', 'change'],
  );
  assert.equal((s.calls[1]![2] as { page: number }).page, 1);
  assert.equal((s.calls[1]![2] as { pageSize: number }).pageSize, 30);
});

test('table page selection policy skips unchanged pages and consults live only-current policy', () => {
  const s = setup();
  const f = createTableChangeFoundation(
    {
      ...s.state,
      get onlyCurrent(): never {
        throw Error('unused policy');
      },
    },
    s.adapter,
  );
  f.pageStateChanged(1, 1);
  assert.deepEqual(s.calls, []);
  s.foundation.pageStateChanged(2, 1);
  assert.deepEqual(s.calls, []);
  s.state.onlyCurrent = true;
  s.foundation.pageStateChanged(2, 1);
  assert.deepEqual(s.calls, [['clearSelected']]);
});

test('table specific notification failure prevents aggregate while retaining the original state write', () => {
  const s = setup(),
    failure = Error('specific failed');
  s.adapter.onFilterChange = () => {
    throw failure;
  };
  assert.throws(
    () => s.foundation.filter('field', ['value']),
    (error) => error === failure,
  );
  assert.deepEqual(s.state.filters, { field: ['value'] });
  assert.equal(
    s.calls.some((call) => call[0] === 'change'),
    false,
  );
});

test('table drag resolves nested paths before checking draggable and keeps exact source identity', () => {
  const s = setup(),
    child = { key: 'child', raw: { id: 'child' } };
  s.state.sortedData[0]!.children = [child];
  const reads: string[] = [];
  const f = createTableDragFoundation(s.drag, {
    get sortedData() {
      reads.push('data');
      return s.state.sortedData;
    },
    get draggable() {
      reads.push('draggable');
      return true;
    },
    onChange() {
      throw Error('unused');
    },
  });
  assert.deepEqual(reads, []);
  const path = [0, 0];
  f.start(path);
  assert.deepEqual(reads, ['data', 'draggable']);
  assert.equal(s.drag.sourceKey, 'child');
  assert.equal(s.drag.sourcePath, path);
  assert.equal(s.drag.data, child.raw);
  f.start([99]);
  assert.equal(s.drag.sourceKey, 'child');
  assert.equal(f.recordAtPath([]), undefined);
});

test('table drag only accepts sibling paths and preserves the supplied target array', () => {
  const s = setup();
  const f = createTableDragFoundation(s.drag, {
    sortedData: s.state.sortedData,
    draggable: true,
    onChange() {},
  });
  s.drag.sourcePath = [1, 0];
  const target = [1, 2];
  f.over(target);
  assert.equal(s.drag.targetPath, target);
  for (const path of [[2, 0], [1], [], [1, 0, 1]]) {
    f.over(path);
    assert.deepEqual(s.drag.targetPath, []);
  }
});

test('table drag marks committing before aggregate reorder and clears the drag session afterward', () => {
  const s = setup();
  let notified = 0;
  const f = createTableDragFoundation(s.drag, {
    sortedData: s.state.sortedData,
    draggable: true,
    onChange() {
      assert.equal(s.drag.committing, true);
      assert.equal(s.drag.dragging, true);
      assert.equal(s.drag.data, s.state.rawData[0]);
      reorderRows(s.state.sortedData, s.drag.sourcePath, s.drag.targetPath);
      notified++;
    },
  });
  f.start([0]);
  f.over([1]);
  f.end(false);
  assert.equal(notified, 1);
  assert.deepEqual(
    s.state.sortedData.map((row) => row.key),
    ['second', 'first'],
  );
  assert.deepEqual(s.drag, {
    dragging: false,
    committing: false,
    sourceKey: undefined,
    sourcePath: [],
    targetPath: [],
    data: {},
  });
});

test('table drag cancellation, disabled state and same path clean up without notifying', () => {
  for (const mode of ['cancelled', 'disabled', 'same'] as const) {
    const s = setup();
    let enabled = true;
    const f = createTableDragFoundation(s.drag, {
      sortedData: s.state.sortedData,
      get draggable() {
        return enabled;
      },
      onChange() {
        throw Error('unexpected change');
      },
    });
    f.start([0]);
    f.over(mode === 'same' ? [0] : [1]);
    if (mode === 'disabled') enabled = false;
    f.end(mode === 'cancelled');
    assert.equal(s.drag.committing, false);
    assert.equal(s.drag.dragging, false);
    assert.deepEqual(s.drag.data, {});
  }
});

test('table drag preserves notification exception semantics without eager cleanup', () => {
  const s = setup(),
    failure = Error('aggregate failed');
  const f = createTableDragFoundation(s.drag, {
    sortedData: s.state.sortedData,
    draggable: true,
    onChange() {
      throw failure;
    },
  });
  f.start([0]);
  f.over([1]);
  assert.throws(
    () => f.end(false),
    (error) => error === failure,
  );
  assert.equal(s.drag.committing, true);
  assert.equal(s.drag.dragging, true);
  assert.deepEqual(s.drag.targetPath, [1]);
});

test('table fixed-column detection preserves operation short circuits and data-side distinctions', () => {
  assert.deepEqual(
    getTableFixedColumns({
      rowSelection: { fixed: true },
      get expandable(): never {
        throw Error('unused expand');
      },
      get draggable(): never {
        throw Error('unused drag');
      },
      columns: [{ fixed: 'right' }],
    }),
    { left: true, right: true, leftData: false },
  );
  assert.deepEqual(
    getTableFixedColumns({
      rowSelection: undefined,
      expandable: undefined,
      draggable: undefined,
      columns: [{ fixed: 'left' }, { fixed: 'right' }],
    }),
    { left: true, right: true, leftData: true },
  );
});

test('table operation descriptors retain opaque title identity, order, fixed fallback and final marker', () => {
  const title = () => ({ opaque: true });
  const result = getTableOperations({
    hasLeftFixedColumn: false,
    hasRightFixedColumn: true,
    hasLeftFixedDataColumns: false,
    draggable: { title, width: 20, fixed: false },
    expandable: { title, width: 30 },
    rowSelection: { title, width: 40, type: 'radio' },
    operations: undefined,
  });
  assert.deepEqual(
    result.map((item) => item.name),
    ['drag-handle', 'expand', 'selection-radio'],
  );
  for (const item of result) {
    assert.equal(item.title, title);
    assert.equal(item.fixed, true);
  }
  assert.equal(result[0]!.isLastLeftFixed, undefined);
  assert.equal(result[2]!.isLastLeftFixed, true);
  const noMarker = getTableOperations({
    hasLeftFixedColumn: true,
    hasRightFixedColumn: false,
    hasLeftFixedDataColumns: true,
    draggable: undefined,
    expandable: undefined,
    rowSelection: { type: 'other' },
    operations: undefined,
  });
  assert.equal(noMarker[0]!.name, 'selection-checkbox');
  assert.equal(Object.hasOwn(noMarker[0]!, 'isLastLeftFixed'), false);
});

test('table operations override receives original named descriptors after marker assignment with plain-call receiver', () => {
  const custom = [{ name: 'custom', render: () => 'opaque view callback' }];
  const result = getTableOperations({
    hasLeftFixedColumn: true,
    hasRightFixedColumn: false,
    hasLeftFixedDataColumns: false,
    draggable: { title: 'drag' },
    expandable: undefined,
    rowSelection: undefined,
    operations: function (columns) {
      assert.equal(this, undefined);
      assert.equal(columns.dragHandle?.isLastLeftFixed, true);
      assert.deepEqual(Object.keys(columns), ['dragHandle', 'expand', 'selection']);
      assert.equal(columns.expand, undefined);
      return custom;
    },
  });
  assert.equal(result, custom);
});
