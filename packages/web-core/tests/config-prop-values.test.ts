import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolveConfigProp,
  resolveDropdownVirtualList,
  resolveAllowClear,
  resolveAllowSearch,
} from '../dist/config/prop-values.js';

function observed<T extends object>(value: T) {
  const reads: string[] = [];
  const state = new Proxy(value, {
    get(target, key, receiver) {
      reads.push(String(key));
      return Reflect.get(target, key, receiver);
    },
  });
  return { state, reads };
}

for (const localValue of [undefined, false, 0, '', null]) {
  test(`explicit config ${String(localValue)} suppresses global configuration`, () => {
    const { state, reads } = observed({
      hasLocalProp: true,
      localValue,
      get globalValue(): typeof localValue {
        throw new Error('Global must remain unread');
      },
    });
    assert.equal(resolveConfigProp(state), localValue);
    assert.deepEqual(reads, ['hasLocalProp', 'localValue']);
  });
}

test('generic config inherits false, zero and empty values; only nullish global values fall back', () => {
  for (const globalValue of [undefined, null, false, 0, '']) {
    const { state, reads } = observed({ hasLocalProp: false, localValue: 'default', globalValue });
    assert.equal(resolveConfigProp(state), globalValue ?? 'default');
    assert.deepEqual(
      reads,
      globalValue == null
        ? ['hasLocalProp', 'globalValue', 'localValue']
        : ['hasLocalProp', 'globalValue'],
    );
  }
});

test('generic config reads current ports and preserves object identity', () => {
  const localValue = {},
    globalValue = {},
    state = { hasLocalProp: false, localValue, globalValue };
  assert.equal(resolveConfigProp(state), globalValue);
  state.hasLocalProp = true;
  assert.equal(resolveConfigProp(state), localValue);
});

test('virtual-list explicit undefined disables inheritance after reading local options first', () => {
  const { state, reads } = observed({
    hasLocalProp: true,
    localValue: undefined,
    get globalValue(): undefined {
      throw new Error('Global must remain unread');
    },
  });
  assert.equal(resolveDropdownVirtualList(state), undefined);
  assert.deepEqual(reads, ['localValue', 'hasLocalProp']);
});

test('virtual-list inferred local options retain identity without reading global options', () => {
  const localValue = { height: 123 };
  const { state, reads } = observed({
    hasLocalProp: false,
    localValue,
    get globalValue(): typeof localValue {
      throw new Error('Global must remain unread');
    },
  });
  assert.equal(resolveDropdownVirtualList(state), localValue);
  assert.deepEqual(reads, ['localValue', 'hasLocalProp']);
});

test('virtual-list inheritance reads local only once and retains the global object', () => {
  const globalValue = { height: 456 };
  const { state, reads } = observed({ hasLocalProp: false, localValue: undefined, globalValue });
  assert.equal(resolveDropdownVirtualList(state), globalValue);
  assert.deepEqual(reads, ['localValue', 'hasLocalProp', 'globalValue']);
});

for (const localValue of [undefined, false, true]) {
  test(`explicit clear ${String(localValue)} blocks global true`, () => {
    const { state, reads } = observed({ hasLocalProp: true, localValue, globalValue: true });
    assert.equal(resolveAllowClear(state), localValue);
    assert.deepEqual(reads, ['hasLocalProp', 'localValue']);
  });
}

test('only global true enables inherited clear and short-circuits local reads', () => {
  const { state, reads } = observed({
    hasLocalProp: false,
    get localValue(): undefined {
      throw new Error('Local must remain unread');
    },
    globalValue: true,
  });
  assert.equal(resolveAllowClear(state), true);
  assert.deepEqual(reads, ['hasLocalProp', 'globalValue']);
  assert.equal(
    resolveAllowClear({ hasLocalProp: false, localValue: true, globalValue: false }),
    true,
  );
  assert.equal(
    resolveAllowClear({ hasLocalProp: false, localValue: undefined, globalValue: false }),
    undefined,
  );
});

const searchDefaults = {
  hasLocalProp: false,
  hasCompatProp: false,
  localValue: undefined as unknown,
  compatValue: undefined as unknown,
  globalValue: undefined as boolean | undefined,
  defaultValue: undefined as unknown,
};

test('explicit search undefined suppresses compat/global/default and reads no lower-priority ports', () => {
  const { state, reads } = observed({
    ...searchDefaults,
    hasLocalProp: true,
    hasCompatProp: true,
    globalValue: true,
    defaultValue: 'default',
  });
  assert.equal(resolveAllowSearch(state), undefined);
  assert.deepEqual(reads, ['hasLocalProp', 'localValue']);
});

test('explicit compatibility search undefined also blocks global/default values', () => {
  const { state, reads } = observed({
    ...searchDefaults,
    hasCompatProp: true,
    globalValue: true,
    defaultValue: 'default',
  });
  assert.equal(resolveAllowSearch(state), undefined);
  assert.deepEqual(reads, ['hasLocalProp', 'hasCompatProp', 'compatValue']);
});

test('global search true short-circuits defaults and local reads', () => {
  const { state, reads } = observed({ ...searchDefaults, globalValue: true });
  assert.equal(resolveAllowSearch(state), true);
  assert.deepEqual(reads, ['hasLocalProp', 'hasCompatProp', 'globalValue']);
});

test('search false, zero, empty string and object defaults retain their values and identity', () => {
  for (const defaultValue of [false, 0, '', { retainInputValue: true }]) {
    const { state, reads } = observed({
      ...searchDefaults,
      globalValue: false,
      defaultValue,
      localValue: 'local',
    });
    assert.equal(resolveAllowSearch(state), defaultValue);
    assert.deepEqual(reads, ['hasLocalProp', 'hasCompatProp', 'globalValue', 'defaultValue']);
  }
});

test('search nullish defaults use the current local value last', () => {
  for (const defaultValue of [null, undefined]) {
    const { state, reads } = observed({ ...searchDefaults, defaultValue, localValue: 'local' });
    assert.equal(resolveAllowSearch(state), 'local');
    assert.deepEqual(reads, [
      'hasLocalProp',
      'hasCompatProp',
      'globalValue',
      'defaultValue',
      'localValue',
    ]);
  }
});

test('search getter exceptions propagate before any lower-priority evaluation', () => {
  const error = new Error('compat callback');
  const { state, reads } = observed({
    ...searchDefaults,
    hasCompatProp: true,
    get compatValue(): unknown {
      throw error;
    },
  });
  assert.throws(
    () => resolveAllowSearch(state),
    (candidate) => candidate === error,
  );
  assert.deepEqual(reads, ['hasLocalProp', 'hasCompatProp', 'compatValue']);
});
