import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SelectAdapter } from '../src/select/foundation.ts';
import type {
  OptionValueWithKey,
  SelectModelValue,
  SelectOptionData,
  SelectOptionInfo,
} from '../src/select/types.ts';

import { createSelectFoundation } from '../dist/select/foundation.js';
import { createSelectNavigation } from '../dist/select/navigation.js';
import {
  DEFAULT_FIELD_NAMES,
  getKeyFromValue,
  getOptionInfos,
  getValidOptions,
  syncOptionInfoMap,
} from '../dist/select/options.js';
import { getValueObjects, hasExtraValueChanges } from '../dist/select/values.js';

test('option keys distinguish empty strings, false, zero, numeric strings and object value keys', () => {
  const values = ['', false, 0, '0', { id: 0 }];
  assert.equal(new Set(values.map((value) => getKeyFromValue(value, 'id'))).size, 5);
  assert.deepEqual(getValueObjects(null, 'id'), []);
  assert.deepEqual(getValueObjects(undefined, 'id'), []);
  assert.deepEqual(getValueObjects(false, 'id'), [
    { value: false, key: '__sd__option__boolean-false' },
  ]);
  assert.deepEqual(getValueObjects('', 'id'), [{ value: '', key: '__sd__option__string-' }]);
});

test('group modeling preserves raw tag payloads and the first duplicate in the merged index', () => {
  const tag = { render: () => 'opaque' };
  const first = { id: 'a', caption: 'First', tag };
  const map = new Map<string, SelectOptionInfo>();
  const groups = getOptionInfos(
    [{ caption: 'Group', children: [first, { id: 'a', caption: 'Duplicate' }] }],
    {
      valueKey: 'value',
      fieldNames: { ...DEFAULT_FIELD_NAMES, value: 'id', label: 'caption', tagProps: 'tag' },
      origin: 'options',
      optionInfoMap: map,
    },
  );
  assert.equal(map.get(getKeyFromValue('a'))?.raw, first);
  assert.equal(map.get(getKeyFromValue('a'))?.tagProps, tag);
  const extra = new Map<string, SelectOptionInfo>();
  getOptionInfos(['a', 'b'], {
    valueKey: 'value',
    fieldNames: DEFAULT_FIELD_NAMES,
    origin: 'extraOptions',
    optionInfoMap: extra,
  });
  const merged = new Map<string, SelectOptionInfo>();
  syncOptionInfoMap(merged, map, extra);
  assert.equal(merged.size, 2);
  assert.equal(merged.get(getKeyFromValue('a'))?.raw, first);
  assert.deepEqual(
    [...merged.values()].map((item) => item.index),
    [0, 1],
  );
  const calls: SelectOptionData[] = [];
  assert.equal(
    getValidOptions(groups, {
      inputValue: '',
      filterOption: (_input, raw) => {
        calls.push(raw);
        return false;
      },
    }).length,
    1,
  );
  assert.deepEqual(calls, []);
  assert.equal(getValidOptions(groups, { inputValue: 'absent', filterOption: true }).length, 0);
});

function fixture() {
  const map = new Map<string, SelectOptionInfo>();
  getOptionInfos(
    [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
      { value: 'd', label: 'Disabled', disabled: true },
    ],
    {
      valueKey: 'value',
      fieldNames: DEFAULT_FIELD_NAMES,
      origin: 'options',
      optionInfoMap: map,
    },
  );
  const state = {
    local: [] as SelectModelValue,
    external: [] as SelectModelValue,
    controlled: false,
    multiple: true,
    readonly: false,
    limit: 0,
    input: 'query',
    retain: false,
    popup: true,
    allowCreate: false,
    fallback: true,
    selected: {} as Record<string, unknown>,
  };
  const key = getKeyFromValue;
  const objects = () => getValueObjects(state.controlled ? state.external : state.local, 'value');
  const events: { name: string; value?: unknown }[] = [];
  const adapter: SelectAdapter<object> = {
    getOptions: () => map,
    getMultiple: () => state.multiple,
    getReadonly: () => state.readonly,
    getLimit: () => state.limit,
    getValueKey: () => 'value',
    getFieldNames: () => DEFAULT_FIELD_NAMES,
    getAllowCreate: () => state.allowCreate,
    getFallbackOption: () => state.fallback,
    getInputValue: () => state.input,
    getValueObjects: objects,
    getValueKeys: () => objects().map((item) => item.key),
    getEnabledKeys: () =>
      [...map.values()].filter((item) => !item.disabled).map((item) => item.key),
    getPopupVisible: () => state.popup,
    getRetainInput: () => state.retain,
    getAllowSearch: () => true,
    getSelectedOptions: () => state.selected,
    setSelectedOptions: (options) => {
      state.selected = options;
      events.push({ name: 'snapshot' });
    },
    setValue: (value) => {
      state.local = value;
    },
    setInputValue: (value) => {
      state.input = value;
    },
    setPopupVisible: (value) => {
      state.popup = value;
      events.push({ name: 'popup', value });
    },
    search: (value) => {
      events.push({ name: 'search', value });
    },
    onFormChange: () => {
      events.push({ name: 'form' });
    },
    events: {
      updateValue: (value) => {
        events.push({ name: 'update', value });
      },
      change: (value) => {
        events.push({ name: 'change', value });
      },
      updateInput: (value) => {
        events.push({ name: 'updateInput', value });
      },
      inputChange: (value) => {
        events.push({ name: 'inputChange', value });
      },
      exceedLimit: (value) => {
        events.push({ name: 'limit', value });
      },
      remove: (value) => {
        events.push({ name: 'remove', value });
      },
      clear: (value) => {
        events.push({ name: 'clear', value });
      },
    },
  };
  return { map, state, key, events, adapter, actions: createSelectFoundation(adapter) };
}

test('multi-select limits clear input but do not commit; declined controlled values stay authoritative', () => {
  const { actions, state, key, events } = fixture();
  state.local = ['a'];
  state.limit = 1;
  actions.handleSelect(key('b'), {});
  assert.deepEqual(state.local, ['a']);
  assert.deepEqual(
    events.map((event) => event.name),
    ['limit', 'updateInput', 'inputChange'],
  );
  state.controlled = true;
  state.external = [];
  state.limit = 0;
  events.length = 0;
  actions.handleSelect(key('a'), {});
  actions.handleSelect(key('b'), {});
  assert.deepEqual(
    events.filter((event) => event.name === 'update').map((event) => event.value),
    [['a'], ['b']],
  );
});

test('clear preserves disabled selections and distinguishes an explicit empty-string option', () => {
  const { actions, state, key, map, events } = fixture();
  state.local = ['a', 'd'];
  actions.handleClear({});
  assert.deepEqual(state.local, ['d']);
  assert.deepEqual(
    events.map((event) => event.name),
    ['update', 'change', 'form', 'snapshot', 'updateInput', 'inputChange', 'clear'],
  );
  state.multiple = false;
  actions.handleClear({});
  assert.equal(state.local, 'd');
  state.local = 'a';
  actions.handleClear({});
  assert.equal(state.local, '');
  getOptionInfos([''], {
    valueKey: 'value',
    fieldNames: DEFAULT_FIELD_NAMES,
    origin: 'options',
    optionInfoMap: map,
  });
  actions.handleClear({});
  assert.equal(state.local, undefined);
  state.readonly = true;
  events.length = 0;
  actions.handleSelect(key('a'), {});
  actions.handleClear({});
  actions.handleRemove(key('d'));
  assert.deepEqual(events, []);
});

test('single re-selection retains search labels and closes without committing a second value', () => {
  const { actions, state, key, events } = fixture();
  state.multiple = false;
  state.local = 'a';
  state.retain = true;
  actions.handleSelect(key('a'), {});
  assert.deepEqual(events, [
    { name: 'updateInput', value: 'Alpha' },
    { name: 'inputChange', value: 'Alpha' },
    { name: 'popup', value: false },
  ]);
});

test('creation deduplicates fallback values and restores historical option payloads', () => {
  const { actions, state, key } = fixture();
  state.local = ['a', 'missing', 'missing', ''];
  state.allowCreate = true;
  state.input = 'missing';
  assert.deepEqual(actions.getExtraValueData(), [{ value: 'missing', key: key('missing') }]);
  const tag = { tone: 'custom' };
  state.selected[key('missing')] = { label: 'Remembered', tagProps: tag };
  const extra = actions.getExtraOptions(actions.getExtraValueData());
  assert.equal(extra[0].label, 'Remembered');
  assert.equal(extra[0].tagProps, tag);
  const raw = { id: 'same' };
  const proxy = { id: 'same' };
  const current: OptionValueWithKey[] = [{ value: raw, key: 'same' }];
  assert.equal(
    hasExtraValueChanges([{ value: proxy, key: 'same' }], current, (value) =>
      value === proxy ? raw : value,
    ),
    false,
  );
  assert.equal(
    hasExtraValueChanges([{ value: { id: 'same' }, key: 'same' }], current, (value) => value),
    true,
  );
});

test('input changes open before publishing input/search and popup hide respects retention', () => {
  const { actions, state, events } = fixture();
  state.popup = false;
  actions.handleInputValueChange('next');
  assert.deepEqual(
    events.map((event) => event.name),
    ['popup', 'updateInput', 'inputChange', 'search'],
  );
  state.retain = true;
  actions.popupChanged(false);
  assert.equal(state.input, 'next');
  state.retain = false;
  actions.popupChanged(false);
  assert.equal(state.input, '');
});

test('navigation honors selected keys, composition/loading, wraparound and settled scrolling', () => {
  let active: string | undefined;
  let popup = true;
  let loading = false;
  const enabled = ['a', 'b', 'c'];
  const scheduled: (() => void)[] = [];
  const calls: string[] = [];
  const nav = createSelectNavigation({
    getEnabledKeys: () => enabled,
    getActiveKey: () => active,
    getValueKeys: () => ['b'],
    getDefaultActiveFirst: () => false,
    getLoading: () => loading,
    getPopupVisible: () => popup,
    getEnterToOpen: () => true,
    setActiveKey: (value) => {
      active = value;
    },
    scrollIntoView: (key) => {
      calls.push(`scroll:${key}`);
    },
    select: (key: string) => {
      calls.push(`select:${key}`);
    },
    setPopupVisible: (value) => {
      popup = value;
    },
    afterRender: (task) => {
      scheduled.push(task);
    },
  });
  nav.opened();
  assert.equal(active, 'b');
  active = 'c';
  scheduled[0]();
  assert.deepEqual(calls, ['scroll:c']);
  const event = {
    preventDefault: () => {
      calls.push('prevent');
    },
  };
  nav.keydown('Enter', event, true);
  loading = true;
  nav.keydown('Enter', event);
  assert.equal(calls.length, 1);
  loading = false;
  nav.keydown('ArrowDown', event);
  assert.equal(active, 'a');
  nav.keydown('Enter', event);
  assert.deepEqual(calls.slice(-2), ['select:a', 'prevent']);
  active = 'missing';
  assert.equal(nav.getNextActiveKey('up'), 'b');
  nav.enabledKeysChanged(['b']);
  assert.equal(active, 'b');
});
