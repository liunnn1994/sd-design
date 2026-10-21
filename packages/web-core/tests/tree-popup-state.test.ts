import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { CheckNode } from '../dist/tree/types.js';

import { createCheckedStateFoundation, type CheckedState } from '../dist/tree/checked-state.js';
import {
  createCompatTriggerFoundation,
  getDefaultPopupVisible,
  type CompatTriggerState,
} from '../dist/trigger/compat-state.js';

function tree(overrides: Partial<CheckedState> = {}) {
  const parent: CheckNode = { key: 'p', checkable: true };
  const a: CheckNode = { key: 'a', parent, checkable: true },
    b: CheckNode = { key: 'b', parent, checkable: true };
  parent.children = [a, b];
  const state: CheckedState = {
    defaultCheckedKeys: ['a'],
    checkedKeys: undefined,
    halfCheckedKeys: undefined,
    key2TreeNode: new Map([
      ['p', parent],
      ['a', a],
      ['b', b],
    ]),
    checkStrictly: false,
    onlyCheckLeaf: false,
    isInitialized: false,
    localCheckedKeys: [],
    localIndeterminateKeys: [],
    computedCheckedKeys: undefined,
    computedIndeterminateKeys: undefined,
    ...overrides,
  };
  return { state, api: createCheckedStateFoundation(state) };
}
test('tree initial default linked state survives the first uncontrolled synchronization', () => {
  const { state, api } = tree();
  api.initialize();
  api.sync();
  assert.deepEqual(api.getCheckedKeys(), ['a']);
  assert.deepEqual(api.getIndeterminateKeys(), ['p']);
  assert.equal(state.isInitialized, true);
});
test('controlled empty checked keys override defaults and retain their computed priority', () => {
  const { state, api } = tree({ checkedKeys: [], defaultCheckedKeys: ['p'] });
  api.initialize();
  api.sync();
  api.setCheckedState(['b'], ['p']);
  assert.deepEqual(api.getCheckedKeys(), []);
  state.checkedKeys = undefined;
  api.sync();
  assert.deepEqual(api.getCheckedKeys(), []);
  assert.deepEqual(api.getIndeterminateKeys(), []);
  assert.equal(state.computedCheckedKeys, undefined);
});
test('tree state setter retains exact local array identities and returns pending state while controlled', () => {
  const { state, api } = tree({ checkedKeys: ['a'], checkStrictly: true });
  api.initialize();
  api.sync();
  const keys = ['b'],
    half = ['p'],
    result = api.setCheckedState(keys, half);
  assert.equal(state.localCheckedKeys, keys);
  assert.equal(result[0], keys);
  assert.equal(result[1], half);
  assert.deepEqual(api.getCheckedKeys(), ['a']);
});
test('tree reinitialize derives local linked state and ignores supplied indeterminate state', () => {
  const { api } = tree();
  const result = api.setCheckedState(['a'], ['ignored'], true);
  assert.deepEqual(result, [['a'], ['p']]);
});
test('tree strict half keys use the provided array including an explicit empty array', () => {
  const half: string[] = [],
    { state, api } = tree({ checkStrictly: true, halfCheckedKeys: half });
  api.initialize();
  api.sync();
  api.setCheckedState(['a'], ['local']);
  assert.equal(api.getIndeterminateKeys(), half);
  state.checkStrictly = false;
  assert.deepEqual(api.getIndeterminateKeys(), ['local']);
});
test('tree initialization reads current leaf policy and current node map', () => {
  const { state, api } = tree({ defaultCheckedKeys: ['p'], onlyCheckLeaf: true });
  api.initialize();
  assert.deepEqual(api.getCheckedKeys(), []);
  state.onlyCheckLeaf = false;
  api.initialize();
  assert.deepEqual(api.getCheckedKeys(), ['p', 'a', 'b']);
  state.key2TreeNode = new Map();
  api.initialize();
  assert.deepEqual(api.getCheckedKeys(), []);
});
test('tree controlled synchronization recomputes from current flags', () => {
  const { state, api } = tree({ checkedKeys: ['p'], checkStrictly: true });
  api.initialize();
  api.sync();
  assert.deepEqual(api.getCheckedKeys(), ['p']);
  state.checkStrictly = false;
  api.sync();
  assert.deepEqual(api.getCheckedKeys(), ['p', 'a', 'b']);
});

function trigger(overrides: Partial<CompatTriggerState> = {}) {
  let api: ReturnType<typeof createCompatTriggerFoundation>;
  const events: unknown[][] = [];
  const state: CompatTriggerState = {
    defaultPopupVisible: undefined,
    defaultShow: undefined,
    popupVisible: undefined,
    show: undefined,
    localVisible: false,
    get visible(): boolean {
      return api.getVisible();
    },
    ...overrides,
  };
  state.localVisible = getDefaultPopupVisible(state);
  api = createCompatTriggerFoundation(state, function (name, value) {
    assert.equal(this, undefined);
    events.push([name, value, state.localVisible, state.visible]);
  });
  return { state, api, events };
}
test('popup defaults and controlled visibility preserve false and nullish precedence', () => {
  assert.equal(getDefaultPopupVisible({ defaultPopupVisible: false, defaultShow: true }), false);
  const { state, api } = trigger({ popupVisible: false, show: true, defaultShow: true });
  assert.equal(api.getVisible(), false);
  state.popupVisible = undefined;
  assert.equal(api.getVisible(), true);
  state.show = undefined;
  assert.equal(api.getVisible(), true);
});
test('popup requests commit before all four ordered compatibility notifications', () => {
  const { api, events } = trigger();
  api.handlePopupVisibleChange(true);
  assert.deepEqual(events, [
    ['update:popupVisible', true, true, true],
    ['popupVisibleChange', true, true, true],
    ['update:show', true, true, true],
    ['showChange', true, true, true],
  ]);
  api.handlePopupVisibleChange(true);
  assert.equal(events.length, 4);
});
test('controlled popup rejection retains pending local state and repeats requests against the public value', () => {
  const { state, api, events } = trigger({ popupVisible: false });
  api.handlePopupVisibleChange(true);
  api.handlePopupVisibleChange(true);
  assert.equal(events.length, 8);
  assert.equal(api.getVisible(), false);
  state.popupVisible = undefined;
  assert.equal(api.getVisible(), true);
});
test('popup synchronization only assigns local state when different', () => {
  const { state, api } = trigger();
  api.syncLocal(true);
  assert.equal(state.localVisible, true);
  api.syncLocal(false);
  assert.equal(state.localVisible, false);
});
test('popup notification error leaves the committed local state and stops later events', () => {
  const error = Error('notify'),
    state = {
      defaultPopupVisible: undefined,
      defaultShow: undefined,
      popupVisible: undefined,
      show: undefined,
      localVisible: false,
      get visible() {
        return false;
      },
    },
    names: string[] = [];
  const api = createCompatTriggerFoundation(state, (name) => {
    names.push(name);
    if (name === 'popupVisibleChange') throw error;
  });
  assert.throws(
    () => api.handlePopupVisibleChange(true),
    (value) => value === error,
  );
  assert.equal(state.localVisible, true);
  assert.deepEqual(names, ['update:popupVisible', 'popupVisibleChange']);
});

const previous = Object.fromEntries(
  ['window', 'document', 'CSS'].map((key) => [
    key,
    Object.getOwnPropertyDescriptor(globalThis, key),
  ]),
);
const root = {} as HTMLElement,
  body = {} as HTMLElement,
  portal = {} as HTMLElement;
let nodes = new Map<string, HTMLElement>([
    ['body', body],
    ['#portal', portal],
  ]),
  reads = 0;
const documentStub = {
  documentElement: root,
  querySelector(selector: string) {
    reads++;
    if (selector === 'bad[') throw Error('invalid selector');
    return nodes.get(selector) ?? null;
  },
};
Object.defineProperty(globalThis, 'document', { configurable: true, value: documentStub });
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: { document: documentStub },
});
Object.defineProperty(globalThis, 'CSS', {
  configurable: true,
  value: { escape: (value: string) => value },
});
const { createTeleportContainerFoundation } = await import('../dist/trigger/teleport-container.js');
for (const key of ['window', 'document', 'CSS']) {
  if (previous[key]) Object.defineProperty(globalThis, key, previous[key]!);
  else Reflect.deleteProperty(globalThis, key);
}
function teleport(
  t: import('node:test').TestContext,
  popupContainer: string | HTMLElement | null | undefined,
  documentContainer?: boolean,
) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document'),
    css = Object.getOwnPropertyDescriptor(globalThis, 'CSS');
  Object.defineProperty(globalThis, 'document', { configurable: true, value: documentStub });
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    value: { escape: (value: string) => value },
  });
  t.after(() => {
    for (const [key, value] of [
      ['document', descriptor],
      ['CSS', css],
    ] as const) {
      if (value) Object.defineProperty(globalThis, key, value);
      else Reflect.deleteProperty(globalThis, key);
    }
  });
  nodes = new Map([
    ['body', body],
    ['#portal', portal],
  ]);
  reads = 0;
  const state = {
    popupContainer,
    teleportContainer: popupContainer,
    containerElement: undefined as HTMLElement | undefined,
  };
  return {
    state,
    api: createTeleportContainerFoundation(state, { defaultContainer: 'body', documentContainer }),
  };
}
test('teleport resolves valid selectors and falls back to body for missing selectors', (t) => {
  const { state, api } = teleport(t, '#portal');
  api.getContainer();
  assert.equal(state.teleportContainer, '#portal');
  assert.equal(state.containerElement, portal);
  state.popupContainer = '#missing';
  api.getContainer();
  assert.equal(state.teleportContainer, 'body');
  assert.equal(state.containerElement, body);
});
test('teleport document mode keeps fallback target while measuring documentElement', (t) => {
  const { state, api } = teleport(t, null, true);
  api.getContainer();
  assert.equal(state.teleportContainer, 'body');
  assert.equal(state.containerElement, root);
});
test('teleport keeps direct native targets and skips queries', (t) => {
  const { state, api } = teleport(t, portal);
  api.getContainer();
  assert.equal(state.teleportContainer, portal);
  assert.equal(state.containerElement, portal);
  assert.equal(reads, 0);
});
test('teleport hidden changes defer resolution and visible mismatch reads latest selector', (t) => {
  const { state, api } = teleport(t, '#missing');
  api.getContainer();
  state.popupContainer = '#portal';
  const before = reads;
  api.sync('#portal', false);
  assert.equal(reads, before);
  assert.equal(state.containerElement, body);
  api.sync('#older', true);
  assert.equal(state.containerElement, portal);
  assert.equal(state.teleportContainer, '#portal');
});
test('teleport equal selector deliberately retains its old element until an actual mismatch', (t) => {
  const { state, api } = teleport(t, '#portal');
  api.getContainer();
  const before = reads;
  nodes.set('#portal', {} as HTMLElement);
  api.sync('#portal', true);
  assert.equal(reads, before);
  assert.equal(state.containerElement, portal);
});
test('teleport selector errors propagate before changing public container state', (t) => {
  const { state, api } = teleport(t, 'bad[');
  assert.throws(() => api.getContainer(), /invalid selector/);
  assert.equal(state.teleportContainer, 'bad[');
  assert.equal(state.containerElement, undefined);
});
