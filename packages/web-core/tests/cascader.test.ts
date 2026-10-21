import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CascaderLoadRequest, CascaderLoader } from '../src/cascader/lazy-load.ts';
import type {
  CascaderOption,
  CascaderOptionInfo,
  CascaderModelValue,
  CascaderLazyLoadOptions,
} from '../src/cascader/types.ts';

import {
  DEFAULT_FIELD_NAMES,
  getOptionInfos,
  getCheckedStatus,
  getLeafOptionInfos,
  getLeafOptionKeys,
  getValueKey,
  getValidValues,
} from '../dist/cascader/data.js';
import { createCascaderFoundation } from '../dist/cascader/foundation.js';
import { createCascaderInteraction } from '../dist/cascader/interaction.js';
import { createCascaderKeyboard } from '../dist/cascader/keyboard.js';
import { createCascaderLazyLoad } from '../dist/cascader/lazy-load.js';
import { createCascaderPath } from '../dist/cascader/navigation.js';
import {
  getCascaderValueMap,
  getDefaultCascaderValue,
  filterCascaderOptions,
  getCascaderViewValues,
} from '../dist/cascader/values.js';

function build(raw: CascaderOption[], config: Partial<Parameters<typeof getOptionInfos>[1]> = {}) {
  const context = {
    optionMap: new Map<string, CascaderOptionInfo>(),
    leafOptionMap: new Map<string, CascaderOptionInfo>(),
    leafOptionSet: new Set<CascaderOptionInfo>(),
    leafOptionValueMap: new Map<string | number, string>(),
    totalLevel: { value: 1 },
    checkStrictly: { value: false },
    valueKey: { value: 'value' },
    fieldNames: DEFAULT_FIELD_NAMES,
    enabledLazyLoad: false,
    lazyLoadOptions: {} as CascaderLazyLoadOptions,
    ...config,
  };
  return { ...context, options: getOptionInfos(raw, context) };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));

test('modeling escapes path separators, preserves raw tag payloads and excludes disabled leaves from totals', () => {
  const tag = { render: () => 'opaque' };
  const raw = [
    {
      value: 'a-b',
      children: [
        { value: 'c', tagProps: tag },
        { value: 'd', disabled: true },
      ],
    },
    { value: 'a', children: [{ value: 'b-c' }] },
  ];
  const model = build(raw);
  assert.equal(model.options[0].key, 'a%2Db');
  assert.equal(model.options[0].children![0].key, 'a%2Db-c');
  assert.equal(model.options[1].children![0].key, 'a-b%2Dc');
  assert.equal(model.options[0].children![0].raw, raw[0].children[0]);
  assert.equal(model.options[0].children![0].tagProps, tag);
  assert.equal(model.totalLevel.value, 2);
  assert.equal(model.options[0].totalLeafOptions, 1);
  assert.deepEqual(getLeafOptionKeys(model.options[0]), ['a%2Db-c', 'a%2Db-d']);
  assert.deepEqual(
    getLeafOptionInfos(model.options[0]).map((option) => option.key),
    ['a%2Db-c'],
  );
  assert.deepEqual(getCheckedStatus(model.options[0], new Map([['a-b%2Dc', true]])), {
    checked: false,
    indeterminate: false,
  });
});

test('empty branches and object-value lookup retain strict checking and first-leaf precedence', () => {
  const raw = [
    { value: 'empty', children: [] },
    { value: { id: 0 }, label: 'First' },
    { value: { id: 0 }, label: 'Second' },
  ];
  const model = build(raw, { valueKey: { value: 'id' } });
  assert.equal(model.options[0].isLeaf, false);
  assert.equal(model.options[0].selectionDisabled, true);
  assert.equal(
    getValueKey({ id: 0 }, { valueKey: 'id', leafOptionValueMap: model.leafOptionValueMap }),
    model.options[1].key,
  );
  assert.equal(model.leafOptionSet.has(model.options[0]), false);
  const strict = build(raw, { checkStrictly: { value: true }, valueKey: { value: 'id' } });
  assert.equal(strict.options[0].selectionDisabled, false);
  assert.equal(strict.leafOptionSet.has(strict.options[0]), true);
});

test('lazy data cache compares source identity through the adapter unwrap operation', () => {
  const raw = { value: 'branch', isLeaf: false };
  const proxy = new Proxy(raw, {});
  const cached = { branch: { source: proxy, children: [{ value: 'cached' }] } };
  const options = { enabledLazyLoad: true, lazyLoadOptions: cached };
  assert.equal(build([raw], options).options[0].children, undefined);
  const matching = build([raw], { ...options, unwrap: (value) => (value === proxy ? raw : value) });
  assert.equal(matching.options[0].children![0].value, 'cached');
  assert.equal(
    build([{ ...raw }], { ...options, unwrap: (value) => (value === proxy ? raw : value) })
      .options[0].children,
    undefined,
  );
});

test('path values, fallback labels and search callbacks retain their distinct contracts', () => {
  const model = build([
    { value: 'p', label: 'Parent', children: [{ value: 'c', label: 'Child' }] },
  ]);
  assert.deepEqual(getValidValues(['p', 'c'], { multiple: false, pathMode: true }), [['p', 'c']]);
  assert.deepEqual(getValidValues(['p', 'c'], { multiple: true, pathMode: false }), ['p', 'c']);
  assert.equal(getDefaultCascaderValue(false, true), undefined);
  assert.deepEqual(getDefaultCascaderValue(true, true), []);
  const values = getCascaderValueMap(['p', 'c'], {
    multiple: false,
    pathMode: true,
    valueKey: 'value',
    leafOptionValueMap: model.leafOptionValueMap,
  });
  assert.deepEqual([...values.keys()], ['p-c']);
  const leaves = [...model.leafOptionSet];
  assert.equal(filterCascaderOptions(leaves, 'parent', false).length, 1);
  assert.equal(filterCascaderOptions(leaves, 'parent', true).length, 0);
  let calls = 0;
  filterCascaderOptions(leaves, '', false, () => {
    calls++;
    return true;
  });
  assert.equal(calls, 1);
  values.set('missing', ['unknown', 'leaf']);
  assert.deepEqual(
    getCascaderViewValues(values, model.leafOptionMap, {
      showPath: true,
      separator: ' > ',
      fallback: true,
    }).map((item) => item.label),
    ['Parent > Child', 'unknown > leaf'],
  );
});

function selectionFixture() {
  const model = build([{ value: 'p', children: [{ value: 'a' }, { value: 'd', disabled: true }] }]);
  const state = {
    value: [] as CascaderModelValue,
    multiple: true,
    pathMode: false,
    strict: false,
    readonly: false,
  };
  const events: string[] = [];
  const getValues = () =>
    getCascaderValueMap(state.value, {
      multiple: state.multiple,
      pathMode: state.pathMode,
      valueKey: 'value',
      leafOptionValueMap: model.leafOptionValueMap,
    });
  const actions = createCascaderFoundation({
    getMultiple: () => state.multiple,
    getPathMode: () => state.pathMode,
    getCheckStrictly: () => state.strict,
    getReadonly: () => state.readonly,
    getValueMap: getValues,
    getLeafOptions: () => model.leafOptionMap,
    setValue: (value) => {
      state.value = value;
    },
    setSelectedPath: () => {
      events.push('path');
    },
    setActiveKey: () => {
      events.push('active');
    },
    onReadonly: () => {
      events.push('readonly');
    },
    afterSingleSelect: () => {
      events.push('close');
    },
    afterMultipleSelect: () => {
      events.push('input');
    },
    onFormChange: () => {
      events.push('form');
    },
    updateValue: () => {
      events.push('update');
    },
    change: () => {
      events.push('change');
    },
  });
  return { model, state, events, getValues, actions };
}

test('selection and clear preserve disabled retained values, empty reset timing and readonly guards', () => {
  const { model, state, events, actions } = selectionFixture();
  state.value = ['d'];
  actions.click(model.options[0], true);
  assert.deepEqual(state.value, ['d', 'a']);
  assert.deepEqual(events, ['update', 'change', 'form', 'input']);
  actions.clear();
  assert.deepEqual(state.value, ['d']);
  actions.click(model.options[0], false);
  assert.deepEqual(state.value, []);
  assert.deepEqual(events.slice(-6), ['path', 'active', 'update', 'change', 'form', 'input']);
  state.readonly = true;
  events.length = 0;
  actions.click(model.options[0]);
  actions.remove('p-a');
  assert.equal(actions.clear(), false);
  assert.deepEqual(events, ['readonly', 'readonly', 'readonly']);
});

test('single non-strict selection rejects branches and empty path-mode clear still publishes an empty string', () => {
  const { model, state, events, actions } = selectionFixture();
  state.multiple = false;
  state.pathMode = true;
  actions.click(model.options[0]);
  assert.deepEqual(events, []);
  actions.click(model.options[0].children![0]);
  assert.deepEqual(state.value, ['p', 'a']);
  assert.deepEqual(events, ['update', 'change', 'form', 'close']);
  actions.clear();
  assert.equal(state.value, '');
});

test('lazy loading ignores replaced requests and disposed views without deleting newer pending work', async () => {
  let model = build([{ value: 'lazy', isLeaf: false }], { enabledLazyLoad: true });
  const pending = new Map<string, CascaderLoadRequest<unknown>>();
  const callbacks: ((children?: CascaderOption[]) => void)[] = [];
  const added: CascaderOption[][] = [];
  const loader: CascaderLoader<unknown> = (_option, done) => {
    callbacks.push(done);
  };
  const engine = createCascaderLazyLoad({
    getLoader: () => loader,
    getOptions: () => model.optionMap,
    getPending: () => pending,
    setPending: (key, request) => {
      pending.set(key, request);
    },
    deletePending: (key) => {
      pending.delete(key);
    },
    clearPending: () => pending.clear(),
    unwrap: (value) => value,
    addChildren: (children) => {
      added.push(children);
    },
  });
  engine.loadOption(model.options[0]);
  engine.loadOption(model.options[0]);
  assert.equal(callbacks.length, 1);
  model = build([{ value: 'lazy', isLeaf: false }], { enabledLazyLoad: true });
  engine.loadOption(model.options[0]);
  assert.equal(callbacks.length, 2);
  callbacks[0]([{ value: 'old' }]);
  await tick();
  assert.equal(pending.size, 1);
  assert.deepEqual(added, []);
  callbacks[1]([]);
  await tick();
  assert.deepEqual(added, [[]]);
  assert.equal(pending.size, 0);
  engine.loadOption(model.options[0]);
  engine.dispose();
  callbacks[2]([{ value: 'disposed' }]);
  await tick();
  assert.deepEqual(added, [[]]);
  assert.equal(pending.size, 0);
  engine.loadOption(model.options[0]);
  assert.equal(callbacks.length, 3);
});

test('rejected lazy loaders release their pending state', async () => {
  const model = build([{ value: 'lazy', isLeaf: false }], { enabledLazyLoad: true });
  const pending = new Map<string, CascaderLoadRequest<unknown>>();
  const engine = createCascaderLazyLoad({
    getLoader: () => async () => {
      throw new Error('rejected');
    },
    getOptions: () => model.optionMap,
    getPending: () => pending,
    setPending: (key, request) => {
      pending.set(key, request);
    },
    deletePending: (key) => {
      pending.delete(key);
    },
    clearPending: () => pending.clear(),
    unwrap: (value) => value,
    addChildren: () => {
      assert.fail('rejected loader cannot add children');
    },
  });
  engine.loadOption(model.options[0]);
  assert.equal(pending.size, 1);
  await tick();
  assert.equal(pending.size, 0);
});

test('path expansion preserves first-child traversal while keyboard focus skips disabled children', () => {
  const model = build([{ value: 'p', children: [{ value: 'd', disabled: true }, { value: 'a' }] }]);
  let active: string | undefined = 'p';
  let selected: string[] = [];
  let search = false;
  const path = createCascaderPath({
    getOptions: () => model.options,
    getOptionMap: () => model.optionMap,
    getActiveKey: () => active,
    getSelectedPath: () => selected,
    getSearchPanel: () => search,
    getFilteredOptions: () => [...model.leafOptionSet],
    getExpandChild: () => true,
    setSelectedPath: (value) => {
      selected = value;
    },
  });
  path.setSelectedPath('p');
  assert.deepEqual(selected, ['p', 'p-d']);
  assert.equal(path.displayColumns().length, 2);
  const calls: string[] = [];
  const keyboard = createCascaderKeyboard({
    getPopupVisible: () => true,
    getActiveOption: path.activeOption,
    getCheckStrictly: () => false,
    getValues: () => new Map(),
    getSearchPanel: () => search,
    next: path.getNextActiveNode,
    load: () => {
      calls.push('load');
    },
    select: () => {
      calls.push('select');
    },
    setSelectedPath: path.setSelectedPath,
    setActiveKey: (key) => {
      active = key;
    },
  });
  const event = {
    preventDefault: () => {
      calls.push('prevent');
    },
  };
  keyboard('ArrowRight', event);
  assert.equal(active, 'p-a');
  assert.deepEqual(calls, ['prevent', 'load']);
  search = true;
  calls.length = 0;
  keyboard('ArrowLeft', event);
  assert.deepEqual(calls, []);
  keyboard('Enter', event);
  assert.deepEqual(calls, ['load', 'select']);
});

test('input and popup transitions keep manual-open and search notification ordering', () => {
  const { model } = selectionFixture();
  let input = 'query';
  let popup = false;
  const calls: string[] = [];
  const interaction = createCascaderInteraction({
    getInputValue: () => input,
    getPopupVisible: () => popup,
    getAllowSearch: () => true,
    getValues: () => new Map(),
    getLeafOptions: () => model.leafOptionMap,
    getActiveKey: () => undefined,
    setInputValue: (value) => {
      input = value;
      calls.push('input');
    },
    setPopupVisible: (value) => {
      popup = value;
      calls.push('popup');
    },
    setSelectedPath: () => {
      calls.push('path');
    },
    setActiveKey: () => {
      calls.push('active');
    },
    clearSelection: () => true,
    inputChange: () => {
      calls.push('notify');
    },
    search: () => {
      calls.push('search');
    },
    clear: () => {
      calls.push('clear');
    },
  });
  interaction.inputChange('new', 'manual');
  assert.deepEqual(calls, ['popup', 'input', 'notify', 'search']);
  popup = false;
  calls.length = 0;
  interaction.popupChanged(false);
  assert.deepEqual(calls, ['path', 'active', 'input', 'notify', 'search']);
  assert.equal(popup, false);
});
