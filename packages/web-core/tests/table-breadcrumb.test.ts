import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createBreadcrumbItemFoundation,
  getBreadcrumbNeedHide,
  getBreadcrumbRouteEntries,
} from '../dist/breadcrumb/foundation.js';
import {
  createTableCellLoadingFoundation,
  createTableOperationFoundation,
  getTableHeaderCheckboxStatus,
  type TableSelectionContext,
} from '../dist/table/cell.js';
const tick = () => new Promise<void>((resolve) => queueMicrotask(resolve));

test('Table cell ports accept explicit undefined getters in strict declaration consumers', () => {
  execFileSync(
    process.execPath,
    [
      fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)),
      '--noEmit',
      '--ignoreConfig',
      '--strict',
      '--exactOptionalPropertyTypes',
      '--skipLibCheck',
      '--module',
      'nodenext',
      '--target',
      'es2022',
      fileURLToPath(new URL('./fixtures/table-cell-optional-getters.ts', import.meta.url)),
    ],
    { encoding: 'utf8' },
  );
});

test('Table cell deduplicates pending loads, retains receiver and settles into the current record', async () => {
  const first = { raw: { key: 'first' } },
    second = { raw: { key: 'second' } },
    state = { isLoading: false, record: first },
    trace: unknown[] = [];
  let finish: (children?: Array<{ key: string }>) => void = () => assert.fail('load not started');
  const ctx = {
    loadMore(raw: { key: string }, done: typeof finish) {
      assert.equal(this, ctx);
      trace.push(['load', raw]);
      finish = done;
    },
    addLazyLoadData(children: Array<{ key: string }> | undefined, record: typeof first) {
      assert.equal(this, ctx);
      trace.push(['add', children, record]);
      assert.equal(state.isLoading, true);
    },
  };
  const event = {
    stopPropagation() {
      assert.equal(this, event);
      trace.push('stop');
    },
  } as Event;
  const api = createTableCellLoadingFoundation(state, ctx);
  assert.equal(api.handleClick(event), undefined);
  assert.equal(state.isLoading, true);
  api.handleClick(event);
  state.record = second;
  const children = [{ key: 'child' }];
  finish(children);
  assert.equal(state.isLoading, true);
  await tick();
  assert.equal(state.isLoading, false);
  assert.deepEqual(trace, [['load', first.raw], 'stop', 'stop', ['add', children, second]]);
});
for (const kind of ['loading', 'missing-loader', 'leaf', 'children', 'empty-children'] as const) {
  test(`Table cell skips load for ${kind} and still stops native propagation`, () => {
    let reads = 0,
      stops = 0;
    const state = {
        isLoading: kind === 'loading',
        get record() {
          reads++;
          return {
            raw: { key: 0 },
            isLeaf: kind === 'leaf',
            children: kind === 'children' ? [{}] : kind === 'empty-children' ? [] : undefined,
          };
        },
      },
      ctx =
        kind === 'missing-loader'
          ? {}
          : {
              loadMore() {
                assert.fail('guard must skip');
              },
            };
    createTableCellLoadingFoundation(state, ctx).handleClick({
      stopPropagation() {
        stops++;
      },
    } as Event);
    assert.equal(stops, 1);
    if (kind === 'loading' || kind === 'missing-loader') assert.equal(reads, 0);
  });
}
test('Table cell synchronous resolution is deferred and omitted callback values remain undefined', async () => {
  const trace: unknown[] = [],
    state = { isLoading: false, record: { raw: 0 } },
    api = createTableCellLoadingFoundation(state, {
      loadMore(raw, done) {
        assert.equal(raw, 0);
        done();
        done([1]);
        trace.push('done');
      },
      addLazyLoadData(children) {
        trace.push(children);
      },
    });
  api.handleClick({
    stopPropagation() {
      trace.push('stop');
    },
  } as Event);
  assert.deepEqual(trace, ['done', 'stop']);
  await tick();
  assert.deepEqual(trace, ['done', 'stop', undefined]);
  assert.equal(state.isLoading, false);
});
test('Table cell keeps loader/getter and optional settlement argument evaluation order', async () => {
  const trace: string[] = [],
    state = {
      isLoading: false,
      get record() {
        trace.push('record');
        return { raw: 0 };
      },
    };
  let finish: (children?: number[]) => void = () => {};
  const ctx = {
    get loadMore() {
      trace.push('loader');
      return (_raw: number, done: typeof finish) => {
        trace.push('call');
        finish = done;
      };
    },
    get addLazyLoadData() {
      trace.push('add');
      return undefined;
    },
  };
  createTableCellLoadingFoundation(state, ctx).handleClick({
    stopPropagation() {
      trace.push('stop');
    },
  } as Event);
  assert.deepEqual(trace, ['loader', 'record', 'record', 'loader', 'record', 'call', 'stop']);
  trace.length = 0;
  finish([1]);
  await tick();
  assert.deepEqual(trace, ['add']);
  assert.equal(state.isLoading, false);
});
for (const phase of ['load', 'add'] as const) {
  test(`Table cell ${phase} errors preserve the original rejected-promise/loading behavior`, () => {
    const entry = new URL('../dist/table/cell.js', import.meta.url).href;
    const code = `import assert from'node:assert/strict';import{createTableCellLoadingFoundation}from ${JSON.stringify(entry)};const state={isLoading:false,record:{raw:0}},trace=[];process.once('unhandledRejection',error=>{assert.equal(error.message,'expected ${phase}');assert.equal(state.isLoading,true);assert.deepEqual(trace,['stop']);process.stdout.write('expected rejection');});createTableCellLoadingFoundation(state,{loadMore(raw,done){${phase === 'load' ? 'throw Error("expected load");' : 'done([]);'}},addLazyLoadData(){${phase === 'add' ? 'throw Error("expected add");' : ''}}}).handleClick({stopPropagation(){trace.push('stop');}});`;
    assert.equal(
      execFileSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8' }),
      'expected rejection',
    );
  });
}
for (const [selected, enabled, expected] of [
  [undefined, undefined, [false, false]],
  [[], [], [false, false]],
  [[0], undefined, [true, false]],
  [[0], [], [false, false]],
  [[0], [0, 1], [false, true]],
  [
    [0, 0],
    [0, 1],
    [true, false],
  ],
  [
    [0, 1, 2],
    [0, 1],
    [true, false],
  ],
  [[NaN], [NaN], [true, false]],
] as const) {
  test(`Table header selection preserves ${JSON.stringify([selected, enabled])}`, () => {
    const result = getTableHeaderCheckboxStatus({
      currentSelectedRowKeys: selected as number[] | undefined,
      currentAllEnabledRowKeys: enabled as number[] | undefined,
    });
    assert.deepEqual([result.checked, result.indeterminate], expected);
  });
}
test('Table header rereads enabled keys for each selected key and once for length', () => {
  let reads = 0;
  const result = getTableHeaderCheckboxStatus({
    currentSelectedRowKeys: [0, 1],
    get currentAllEnabledRowKeys() {
      reads++;
      return reads === 1 ? [0] : [0, 1];
    },
  });
  assert.equal(reads, 3);
  assert.deepEqual(result, { checked: true, indeterminate: false });
});
test('Table operations use cached leaf status but live context and original zero-key record', () => {
  const leaf0 = { key: 0, isLeaf: true },
    leaf1 = { key: 1, isLeaf: true },
    record = { key: 'p', children: [leaf0, leaf1] },
    props = { record, selectedRowKeys: [0] },
    state = {
      leafKeys: [0, 1],
      selectionStatus: { checked: false, indeterminate: true },
      isTreeSelection: true,
    },
    events: unknown[] = [];
  const ctx: TableSelectionContext<typeof record> = {
    currentAllEnabledRowKeys: [0],
    currentSelectedRowKeys: [0],
    checkStrictly: false,
    onSelectAllLeafs(row, value) {
      assert.equal(this, ctx);
      events.push(['tree', row, value]);
    },
    onSelect(value, row) {
      assert.equal(this, ctx);
      events.push(['row', value, row]);
    },
  };
  const api = createTableOperationFoundation(props, ctx, state);
  assert.deepEqual(api.getEnabledLeafKeys(), [0]);
  assert.deepEqual(api.getCurrentSelectionStatus(), { checked: false, indeterminate: true });
  assert.equal(api.getIsTreeSelection(), true);
  assert.equal(api.getCheckboxValue(), false);
  api.handleCheckboxChange('raw');
  state.isTreeSelection = false;
  api.handleCheckboxChange(0);
  api.handleRadioChange(true);
  assert.deepEqual(events, [
    ['tree', record, 'raw'],
    ['row', 0, record],
    ['row', true, record],
  ]);
  ctx.checkStrictly = true;
  assert.equal(api.getIsTreeSelection(), false);
});
test('Table operation optional handlers skip record reads; checked branch skips selection state', () => {
  const props = {
      get record() {
        assert.fail('record read');
        return { key: 0 };
      },
      selectedRowKeys: undefined,
    },
    state = {
      leafKeys: [],
      get selectionStatus() {
        assert.fail('selection read');
        return { checked: false, indeterminate: false };
      },
      isTreeSelection: false,
    },
    api = createTableOperationFoundation(props, {}, state);
  assert.equal(api.getCheckboxValue(), false);
  api.handleCheckboxChange(true);
  api.handleRadioChange(false);
});
test('Table operation optional handler getter mutation is observed before live record argument', () => {
  let record = { key: 0 };
  const next = { key: 1 },
    props = {
      get record() {
        return record;
      },
    },
    state = {
      leafKeys: [],
      selectionStatus: { checked: false, indeterminate: false },
      isTreeSelection: false,
    };
  const ctx = {
    get onSelect() {
      record = next;
      return function (this: unknown, value: boolean, row: { key: number }) {
        assert.equal(this, ctx);
        assert.equal(row, next);
        assert.equal(value, true);
      };
    },
  };
  createTableOperationFoundation(props, ctx, state).handleCheckboxChange(true);
});
test('Breadcrumb route entries accumulate paths, keep route identity and independent arrays', () => {
  const routes = [
      { path: '/root', label: 'Root' },
      { path: '/child', label: 'Child' },
      { path: '', label: 'Empty' },
    ],
    result = getBreadcrumbRouteEntries({ routes });
  assert.deepEqual(
    result.map((item) => [item.index, item.paths, item.last, item.href]),
    [
      [0, ['root'], false, '#/root'],
      [1, ['root', 'child'], false, '#/root/child'],
      [2, ['root', 'child', ''], true, '#/root/child/'],
    ],
  );
  assert.equal(result[0]!.route, routes[0]);
  assert.notEqual(result[0]!.paths, result[1]!.paths);
});
test('Breadcrumb customUrl keeps receiver and path array identity, mutations and nullish fallback', () => {
  const calls: string[][] = [],
    props = {
      routes: [{ path: '//root' }, { path: '/child' }, { path: '/last' }],
      customUrl(paths: string[]) {
        assert.equal(this, props);
        calls.push(paths);
        paths.push('mutated');
        return paths.length === 2 ? '' : (undefined as unknown as string);
      },
    };
  const result = getBreadcrumbRouteEntries(props);
  assert.equal(result[0]!.href, '');
  assert.equal(result[1]!.href, '#/root/child/mutated');
  assert.equal(result[2]!.href, '#/root/child/last/mutated');
  for (let i = 0; i < result.length; i++) assert.equal(result[i]!.paths, calls[i]);
});
test('Breadcrumb preserves route length guard reread and sparse indexes/origin last semantics', () => {
  const routes = new Array<{ path: string }>(3);
  routes[0] = { path: '/a' };
  routes[2] = { path: '/c' };
  let reads = 0;
  const result = getBreadcrumbRouteEntries({
    get routes() {
      reads++;
      return routes;
    },
  });
  assert.equal(reads, 2);
  assert.equal(1 in result, false);
  assert.deepEqual(result[2]!.paths, ['a', 'c']);
  assert.equal(result[2]!.index, 2);
  assert.equal(result[2]!.last, true);
  reads = 0;
  assert.deepEqual(
    getBreadcrumbRouteEntries({
      get routes() {
        reads++;
        return undefined;
      },
    }),
    [],
  );
  assert.equal(reads, 1);
});
test('Breadcrumb URL callback errors propagate synchronously and stop remaining entries', () => {
  let calls = 0;
  assert.throws(
    () =>
      getBreadcrumbRouteEntries({
        routes: [{ path: 'a' }, { path: 'b' }],
        customUrl() {
          calls++;
          throw Error('url');
        },
      }),
    /url/,
  );
  assert.equal(calls, 1);
});
test('Breadcrumb hide threshold retains max/total getter order and strict positive guard', () => {
  let reads = 0;
  assert.equal(
    getBreadcrumbNeedHide({
      get maxCount() {
        reads++;
        return reads === 1 ? 1 : 3;
      },
      get total() {
        assert.equal(reads, 1);
        return 5;
      },
    }),
    true,
  );
  assert.equal(reads, 2);
  assert.equal(
    getBreadcrumbNeedHide({
      maxCount: 0,
      get total() {
        assert.fail('total read');
        return 3;
      },
    }),
    false,
  );
  for (const total of [0, 2, 3, 4])
    assert.equal(getBreadcrumbNeedHide({ maxCount: 2, total }), total > 3);
});
for (const index of [0, 1, 2, 3, 4, 5]) {
  test(`Breadcrumb item overflow index ${index}`, () => {
    const api = createBreadcrumbItemFoundation(
      { index },
      { needHide: true, total: 6, maxCount: 2 },
    );
    assert.equal(api.getShow(), !(index > 1 && index <= 4));
    assert.equal(api.getDisplayMore(), index === 1);
    assert.equal(api.getShowSeparator(), index < 5);
  });
}
test('Breadcrumb item absence/default visibility and repeated live index reads remain intact', () => {
  const absent = createBreadcrumbItemFoundation(
    {
      get index() {
        assert.fail('index read');
        return 0;
      },
    },
    undefined,
  );
  assert.equal(absent.getShow(), true);
  assert.equal(absent.getDisplayMore(), false);
  assert.equal(absent.getShowSeparator(), false);
  let reads = 0;
  const api = createBreadcrumbItemFoundation(
    {
      get index() {
        return ++reads;
      },
    },
    { needHide: true, total: 6, maxCount: 2 },
  );
  assert.equal(api.getShow(), true);
  assert.equal(reads, 1);
  const context = { needHide: false, total: 3, maxCount: 1 },
    props = { index: 2 },
    live = createBreadcrumbItemFoundation(props, context);
  assert.equal(live.getShow(), true);
  context.needHide = true;
  assert.equal(live.getShow(), false);
  props.index = 1;
  assert.equal(live.getDisplayMore(), true);
});
