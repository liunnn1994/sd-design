import assert from 'node:assert/strict';
import test from 'node:test';

import type { TreeNodeKey } from '../dist/tree/types.js';

import {
  createPagerFoundation,
  createStepPagerFoundation,
  createEllipsisPagerFoundation,
  createPageOptionsFoundation,
} from '../dist/pagination/items.js';
import { createTreeSelectPanelFoundation } from '../dist/tree-select/panel.js';

function keyEvent(key: string, trace: unknown[], cancel = () => {}) {
  const event = {
    get key() {
      trace.push('key');
      return key;
    },
    preventDefault() {
      assert.equal(this, event);
      trace.push('cancel');
      cancel();
    },
  };
  return event as unknown as KeyboardEvent;
}

for (const kind of ['page', 'step', 'ellipsis'] as const)
  for (const key of ['Enter', ' ', 'Spacebar', 'ArrowRight']) {
    test(`${kind} keyboard ${JSON.stringify(key)} retains guard, key reads and payload arity`, () => {
      const trace: unknown[] = [];
      const state = {
        disabled: false,
        current: 2,
        pageNumber: 3,
        mergedDisabled: false,
        nextPage: 4,
        pages: 10,
        isNext: true,
        step: 5,
      };
      const notify = (...args: unknown[]) => trace.push(['click', ...args]);
      const api =
        kind === 'page'
          ? createPagerFoundation(state, notify)
          : kind === 'step'
            ? createStepPagerFoundation(state, notify)
            : createEllipsisPagerFoundation(state, notify);
      const event = keyEvent(key, trace);
      api.handleKeydown(event);
      const keys = key === 'Enter' ? ['key'] : ['key', 'key'];
      assert.deepEqual(
        trace,
        key === 'Enter' || key === ' '
          ? [...keys, 'cancel', kind === 'page' ? ['click', 3, event] : ['click', 4]]
          : keys,
      );
    });
  }
for (const kind of ['page', 'step', 'ellipsis'] as const) {
  test(`${kind} disabled skips keyboard and target getters`, () => {
    const state = {
      disabled: true,
      mergedDisabled: true,
      current: 1,
      pages: 10,
      pageNumber: 2,
      isNext: true,
      step: 5,
      get nextPage(): number {
        throw Error('skip target');
      },
    };
    const notify = () => {
      throw Error('skip notify');
    };
    const api =
      kind === 'page'
        ? createPagerFoundation(state, notify)
        : kind === 'step'
          ? createStepPagerFoundation(state, notify)
          : createEllipsisPagerFoundation(state, notify);
    const event = {
      get key(): string {
        throw Error('skip key');
      },
      preventDefault() {
        throw Error('skip cancel');
      },
    } as unknown as KeyboardEvent;
    api.handleKeydown(event);
    api.handleClick(new Event('click') as MouseEvent);
  });
  test(`${kind} cancel mutation preserves variant-specific disabled reread`, () => {
    const trace: unknown[] = [],
      state = {
        disabled: false,
        mergedDisabled: false,
        current: 1,
        pages: 10,
        pageNumber: 2,
        isNext: true,
        step: 5,
        nextPage: 3,
      };
    const notify = (...args: unknown[]) => trace.push(['click', ...args]);
    const api =
      kind === 'page'
        ? createPagerFoundation(state, notify)
        : kind === 'step'
          ? createStepPagerFoundation(state, notify)
          : createEllipsisPagerFoundation(state, notify);
    const event = keyEvent('Enter', trace, () => {
      state.disabled = true;
      state.mergedDisabled = true;
      state.pageNumber = 8;
      state.nextPage = 9;
    });
    api.handleKeydown(event);
    assert.deepEqual(trace, kind === 'page' ? ['key', 'cancel'] : ['key', 'cancel', ['click', 9]]);
  });
  test(`${kind} cancel exception stops target and notification`, () => {
    const state = {
        disabled: false,
        mergedDisabled: false,
        current: 1,
        pages: 10,
        pageNumber: 2,
        isNext: true,
        step: 5,
        get nextPage(): number {
          throw Error('skip target');
        },
      },
      trace: unknown[] = [];
    const notify = () => trace.push('notify'),
      api =
        kind === 'page'
          ? createPagerFoundation(state, notify)
          : kind === 'step'
            ? createStepPagerFoundation(state, notify)
            : createEllipsisPagerFoundation(state, notify);
    assert.throws(
      () =>
        api.handleKeydown(
          keyEvent(' ', trace, () => {
            throw Error('cancel');
          }),
        ),
      /cancel/,
    );
    assert.deepEqual(trace, ['key', 'key', 'cancel']);
  });
}
test('ordinary Pager rechecks disabled but reads live page after successful cancellation', () => {
  const trace: unknown[] = [],
    state = { disabled: false, current: 1, pageNumber: 2 };
  const api = createPagerFoundation(state, (...args) => trace.push(args));
  const event = keyEvent('Enter', [], () => {
    state.pageNumber = 7;
  });
  api.handleKeydown(event);
  assert.deepEqual(trace, [[7, event]]);
  assert.equal(api.getIsActive(), false);
  state.current = 7;
  assert.equal(api.getIsActive(), true);
});
test('ordinary Pager keeps optional undefined page equality and legacy undefined payload', () => {
  const trace: unknown[] = [],
    event = new Event('click') as MouseEvent,
    api = createPagerFoundation({ disabled: false }, (...args) => trace.push(args));
  assert.equal(api.getIsActive(), true);
  api.handleClick(event);
  assert.deepEqual(trace, [[undefined, event]]);
});
test('step and ellipsis mouse handlers do not inspect the event and emit one target', () => {
  for (const create of [createStepPagerFoundation, createEllipsisPagerFoundation]) {
    const trace: unknown[] = [],
      state = {
        disabled: false,
        current: 2,
        pages: 10,
        isNext: true,
        step: 5,
        mergedDisabled: false,
        nextPage: 8,
      };
    const api = create(state, (...args) => trace.push(args));
    api.handleClick(undefined as unknown as MouseEvent);
    assert.deepEqual(trace, [[8]]);
  }
});
test('step derived state preserves boundaries and cached target ports', () => {
  const state = {
      disabled: false,
      current: 1,
      pages: 5,
      isNext: false,
      mergedDisabled: false,
      nextPage: 99,
    },
    events: number[] = [];
  const api = createStepPagerFoundation(state, (value) => events.push(value));
  assert.equal(api.getMergedDisabled(), true);
  assert.equal(api.getNextPage(), 1);
  state.isNext = true;
  assert.equal(api.getMergedDisabled(), false);
  assert.equal(api.getNextPage(), 2);
  api.handleClick(new Event('click') as MouseEvent);
  assert.deepEqual(events, [99]);
  state.current = 5;
  assert.equal(api.getMergedDisabled(), true);
  assert.equal(api.getNextPage(), 5);
  state.pages = 0;
  assert.equal(api.getMergedDisabled(), true);
  assert.equal(api.getNextPage(), 0);
});
test('step disabled calculation evaluates original arguments before helper short circuit', () => {
  const trace: string[] = [],
    state = {
      get disabled() {
        trace.push('disabled');
        return true;
      },
      get pages() {
        trace.push('pages');
        return 5;
      },
      get current() {
        trace.push('current');
        return 2;
      },
      get isNext() {
        trace.push('direction');
        return true;
      },
      mergedDisabled: false,
      nextPage: 3,
    };
  const api = createStepPagerFoundation(state, () => {});
  assert.deepEqual(trace, []);
  assert.equal(api.getMergedDisabled(), true);
  assert.deepEqual(trace, ['disabled', 'pages', 'current', 'direction']);
});
test('ellipsis derives zero-page guard, signed steps and accepts NaN target semantics', () => {
  const state = {
    disabled: false,
    current: 3,
    pages: 10,
    step: -5,
    mergedDisabled: false,
    nextPage: 0,
  };
  const api = createEllipsisPagerFoundation(state, () => {});
  assert.equal(api.getMergedDisabled(), false);
  assert.equal(api.getNextPage(), 1);
  state.step = 20;
  assert.equal(api.getNextPage(), 10);
  state.pages = 0;
  assert.equal(api.getMergedDisabled(), true);
  state.pages = 10;
  state.step = NaN;
  assert.equal(Number.isNaN(api.getNextPage()), true);
});
test('pagination constructors do not read state getters', () => {
  const state = new Proxy(
    {},
    {
      get() {
        throw Error('eager state');
      },
    },
  );
  createPagerFoundation(state as Parameters<typeof createPagerFoundation>[0], () => {});
  createStepPagerFoundation(state as Parameters<typeof createStepPagerFoundation>[0], () => {});
  createEllipsisPagerFoundation(
    state as Parameters<typeof createEllipsisPagerFoundation>[0],
    () => {},
  );
  createPageOptionsFoundation(
    state as Parameters<typeof createPageOptionsFoundation>[0],
    () => '',
    () => {},
  );
});
for (const value of [0, -0, 10, NaN, Infinity, -1])
  test(`PageOptions forwards numeric ${String(value)} without narrowing`, () => {
    const events: unknown[] = [],
      api = createPageOptionsFoundation(
        { sizeOptions: [] },
        () => '',
        (value) => events.push(value),
      );
    api.handleChange(value);
    assert.equal(events.length, 1);
    assert.equal(Object.is(events[0], value), true);
  });
test('PageOptions rejects non-number values and preserves no-return notification behavior', () => {
  const events: unknown[] = [],
    api = createPageOptionsFoundation(
      { sizeOptions: [] },
      () => '',
      (value) => {
        events.push(value);
        return 9;
      },
    );
  for (const value of [undefined, null, '10', true, [10], new Number(10), {}, 10n, Symbol('value')])
    api.handleChange(value);
  assert.deepEqual(events, []);
  assert.equal(api.handleChange(10), undefined);
  assert.deepEqual(events, [10]);
});
test('PageOptions keeps nullable model fallback, zero and NaN', () => {
  const state = { pageSize: undefined as number | undefined, sizeOptions: [] },
    api = createPageOptionsFoundation(
      state,
      () => '',
      () => {},
    );
  assert.equal(api.getModelValue(), undefined);
  state.pageSize = 0;
  assert.equal(api.getModelValue(), 0);
  state.pageSize = null as unknown as number;
  assert.equal(api.getModelValue(), undefined);
  state.pageSize = NaN;
  assert.equal(Number.isNaN(api.getModelValue()), true);
});
test('PageOptions translates each existing array item and retains holes', () => {
  const options = new Array<number>(3);
  options[0] = 10;
  options[2] = 20;
  let calls = 0;
  const state = { sizeOptions: options },
    api = createPageOptionsFoundation(
      state,
      () => `locale${++calls}`,
      () => {},
    );
  const expected = new Array<{ value: number; label: string }>(3);
  expected[0] = { value: 10, label: '10 locale1' };
  expected[2] = { value: 20, label: '20 locale2' };
  assert.deepEqual(api.getOptions(), expected);
  assert.equal(calls, 2);
  state.sizeOptions = [];
  assert.deepEqual(api.getOptions(), []);
  assert.equal(calls, 2);
});
test('TreeSelect projection retains key array identity and fresh opposite arrays', () => {
  const keys: TreeNodeKey[] = [0, 'a'],
    state = { showCheckable: false, selectedKeys: keys, tree: undefined };
  const api = createTreeSelectPanelFoundation(state, () => {}),
    first = api.getSelectionProps(),
    second = api.getSelectionProps();
  assert.equal(first.selectedKeys, keys);
  assert.notEqual(first.checkedKeys, second.checkedKeys);
  assert.deepEqual(first.checkedKeys, []);
  assert.equal(first.disableSelectActionOnly, true);
  state.showCheckable = true;
  const checked = api.getSelectionProps();
  assert.equal(checked.checkedKeys, keys);
  assert.deepEqual(checked.selectedKeys, []);
});
test('TreeSelect projection rereads mode for each output and preserves undefined keys', () => {
  let reads = 0;
  const keys: TreeNodeKey[] = [1],
    api = createTreeSelectPanelFoundation(
      {
        get showCheckable() {
          return ++reads === 1;
        },
        selectedKeys: keys,
        tree: undefined,
      },
      () => {},
    ),
    value = api.getSelectionProps();
  assert.equal(value.checkedKeys, keys);
  assert.equal(value.selectedKeys, keys);
  assert.equal(reads, 2);
  const empty = createTreeSelectPanelFoundation(
    { showCheckable: true, selectedKeys: undefined, tree: undefined },
    () => {},
  ).getSelectionProps();
  assert.equal(Object.hasOwn(empty, 'checkedKeys'), true);
  assert.equal(empty.checkedKeys, undefined);
});
test('TreeSelect single selection and all check events forward original arrays without reading event/tree', () => {
  const keys: TreeNodeKey[] = [0],
    events: TreeNodeKey[][] = [],
    state = {
      showCheckable: false,
      selectedKeys: undefined,
      get tree(): never {
        throw Error('skip tree');
      },
    },
    api = createTreeSelectPanelFoundation(state, (value) => {
      events.push(value);
      return 5;
    });
  assert.equal(api.onSelect(keys, undefined as unknown as { e?: Event }), undefined);
  assert.equal(api.onCheck(keys), undefined);
  assert.equal(events[0], keys);
  assert.equal(events[1], keys);
  state.showCheckable = true;
  api.onCheck(keys);
  assert.equal(events[2], keys);
});
test('TreeSelect checked selection accepts key zero and preserves imperative receiver', () => {
  const event = new Event('click'),
    events: unknown[] = [],
    tree = {
      toggleCheck(key: TreeNodeKey, e: Event) {
        assert.equal(this, tree);
        events.push([key, e]);
      },
    },
    api = createTreeSelectPanelFoundation({ showCheckable: true, selectedKeys: [], tree }, () => {
      throw Error('skip emit');
    });
  api.onSelect([0], { e: event });
  assert.deepEqual(events, [[0, event]]);
});
test('TreeSelect empty keys and missing event skip imperative lookup', () => {
  let eventReads = 0;
  const api = createTreeSelectPanelFoundation(
    {
      showCheckable: true,
      selectedKeys: undefined,
      get tree(): never {
        throw Error('skip tree');
      },
    },
    () => {},
  );
  api.onSelect([], {
    get e() {
      eventReads++;
      throw Error('skip event');
    },
  });
  assert.equal(eventReads, 0);
  api.onSelect([0], {});
});
test('TreeSelect missing instance or method skips the second key/event reads', () => {
  for (const tree of [undefined, {}]) {
    let keys = 0,
      events = 0;
    const values = new Proxy([0], {
        get(target, key, receiver) {
          if (key === '0') keys++;
          return Reflect.get(target, key, receiver);
        },
      }),
      api = createTreeSelectPanelFoundation(
        { showCheckable: true, selectedKeys: [], tree },
        () => {},
      );
    api.onSelect(values, {
      get e() {
        events++;
        return new Event('click');
      },
    });
    assert.equal(keys, 1);
    assert.equal(events, 1);
  }
});
test('TreeSelect method lookup can replace key/event before their second read', () => {
  const trace: unknown[] = [],
    keys: TreeNodeKey[] = [0],
    first = new Event('first'),
    second = new Event('second');
  let reads = 0;
  const tree = {
      get toggleCheck() {
        trace.push('method');
        keys[0] = 'changed';
        return function (this: unknown, key: TreeNodeKey, event: Event) {
          assert.equal(this, tree);
          trace.push([key, event]);
        };
      },
    },
    api = createTreeSelectPanelFoundation(
      {
        showCheckable: true,
        selectedKeys: [],
        get tree() {
          trace.push('tree');
          return tree;
        },
      },
      () => {},
    );
  api.onSelect(keys, {
    get e() {
      trace.push('event');
      return ++reads === 1 ? first : second;
    },
  });
  assert.deepEqual(trace, ['event', 'tree', 'method', 'event', ['changed', second]]);
});
test('TreeSelect construction is lazy and imperative errors propagate', () => {
  const state = {
    get showCheckable(): boolean {
      throw Error('lazy');
    },
    selectedKeys: undefined,
    tree: undefined,
  };
  const api = createTreeSelectPanelFoundation(state, () => {});
  assert.throws(() => api.onSelect([], { e: new Event('click') }), /lazy/);
  const tree = {
      toggleCheck() {
        throw Error('imperative');
      },
    },
    active = createTreeSelectPanelFoundation(
      { showCheckable: true, selectedKeys: [], tree },
      () => {},
    );
  assert.throws(() => active.onSelect([0], { e: new Event('click') }), /imperative/);
});
