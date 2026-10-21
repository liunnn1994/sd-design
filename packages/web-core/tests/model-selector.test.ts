import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  createModelSelectorFoundation,
  getModelSelectorVisible,
  updateModelSelectorVisible,
  type ModelSelectorFoundationState,
} from '../dist/model-selector/foundation.js';
import {
  createModelSelectorGroupFoundation,
  getModelSelectorGroupInitialExpanded,
} from '../dist/model-selector/group.js';
import { createModelSelectorInputFoundation } from '../dist/model-selector/input.js';
import { createModelSelectorItemFoundation } from '../dist/model-selector/item.js';
import { getShortcutKeys, isShortcutPressed } from '../dist/model-selector/shortcut.js';
import {
  MODEL_SELECTOR_PROVIDERS,
  type ModelSelectorItemData,
} from '../dist/model-selector/types.js';

function item(value: string, extra: Partial<ModelSelectorItemData> = {}): ModelSelectorItemData {
  return {
    id: Symbol(value),
    domId: value,
    value,
    label: value,
    disabled: false,
    keywords: [],
    select() {},
    ...extra,
  };
}
function key(key: string, extra: Partial<KeyboardEvent> = {}) {
  const calls: string[] = [];
  return {
    calls,
    event: {
      key,
      code: key,
      type: 'keydown',
      repeat: false,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      isComposing: false,
      preventDefault() {
        calls.push('prevent');
      },
      stopPropagation() {
        calls.push('stop');
      },
      ...extra,
    } as KeyboardEvent,
  };
}
function fixture() {
  const props = { closeOnSelect: true, resetQueryOnClose: true };
  const ownership = { controlled: false, accept: true, model: undefined as boolean | undefined };
  const events: unknown[][] = [];
  const currentKeys = new Set<string>();
  let currentKeyReads = 0;
  let foundation!: ReturnType<typeof createModelSelectorFoundation>;
  const state: ModelSelectorFoundationState = {
    props,
    innerVisible: true,
    query: '',
    activeId: undefined,
    itemsVersion: 0,
    get visibleModel() {
      return ownership.model;
    },
    set visibleModel(value) {
      events.push(['update', value]);
      if (ownership.accept) ownership.model = value;
    },
    get mergedVisible() {
      return getModelSelectorVisible(ownership.controlled, ownership.model, this.innerVisible);
    },
    get normalizedQuery() {
      return foundation.getNormalizedQuery();
    },
    get visibleItems() {
      return foundation.getVisibleItems();
    },
    get navigableItems() {
      return foundation.getNavigableItems();
    },
  };
  foundation = createModelSelectorFoundation(state, {
    keyAliases: { ctrl: 'control', page_up: 'pageup' },
    get currentKeys() {
      currentKeyReads++;
      return currentKeys;
    },
    visibleChange: (value) => {
      events.push(['visible', value, state.innerVisible, ownership.model]);
    },
    select: (value, event) => {
      events.push(['select', value, event]);
    },
  });
  return {
    state,
    props,
    events,
    ownership,
    currentKeys,
    get currentKeyReads() {
      return currentKeyReads;
    },
    foundation,
  };
}

test('known provider catalogue retains literal order and ids', () => {
  assert.equal(MODEL_SELECTOR_PROVIDERS.length, 56);
  assert.equal(MODEL_SELECTOR_PROVIDERS[0], 'moonshotai-cn');
  assert.equal(MODEL_SELECTOR_PROVIDERS.at(-1), 'cerebras');
  assert.equal(new Set(MODEL_SELECTOR_PROVIDERS).size, MODEL_SELECTOR_PROVIDERS.length);
});
test('visibility distinguishes a bound undefined from an absent model and retains fallback writes', () => {
  assert.equal(getModelSelectorVisible(true, undefined, true), false);
  assert.equal(getModelSelectorVisible(false, false, true), true);
  const f = fixture();
  f.ownership.controlled = true;
  f.ownership.model = true;
  f.ownership.accept = false;
  f.foundation.setVisible(false);
  assert.deepEqual(f.events, [
    ['update', false],
    ['visible', false, false, true],
  ]);
  assert.equal(f.state.mergedVisible, true);
  f.ownership.controlled = false;
  assert.equal(f.state.mergedVisible, false);
  f.foundation.setVisible(false);
  assert.equal(f.events.length, 2);
});
test('dialog update coerces undefined and writes inner state before the model callback', () => {
  const writes: unknown[] = [];
  let inner = true;
  updateModelSelectorVisible(
    {
      get innerVisible() {
        return inner;
      },
      set innerVisible(value) {
        inner = value;
        writes.push(['inner', value]);
      },
      get visibleModel() {
        return true;
      },
      set visibleModel(value) {
        writes.push(['model', value, inner]);
      },
    },
    undefined,
  );
  assert.deepEqual(writes, [
    ['inner', false],
    ['model', false, false],
  ]);
});
test('registry filters value, rendered label and keywords without losing object identity', () => {
  const f = fixture(),
    group = Symbol('group'),
    a = item('alpha', { label: 'First', groupId: group }),
    b = item('beta', { keywords: ['Special'] });
  f.foundation.registerItem(a);
  f.foundation.registerItem(b);
  assert.equal(f.state.itemsVersion, 2);
  assert.equal(f.foundation.getVisibleItems(group)[0], a);
  for (const query of [' ALPHA ', 'first']) {
    f.state.query = query;
    assert.deepEqual(f.foundation.getVisibleItems(), [a]);
  }
  f.state.query = 'special';
  assert.deepEqual(f.foundation.getVisibleItems(), [b]);
  const updated = { ...b, keywords: ['Changed'] };
  f.foundation.updateItem(updated);
  assert.equal(f.state.itemsVersion, 3);
  assert.deepEqual(f.foundation.getVisibleItems(), []);
  f.state.query = 'changed';
  assert.equal(f.foundation.getVisibleItems()[0], updated);
});
test('collapsed groups exclude navigation while their filtered items remain counted', () => {
  const f = fixture(),
    group = Symbol('group'),
    expanded = { value: false },
    a = item('a', { groupId: group }),
    b = item('b');
  f.foundation.registerGroup(group, expanded);
  f.foundation.registerItem(a);
  f.foundation.registerItem(b);
  assert.deepEqual(f.state.visibleItems, [a, b]);
  assert.deepEqual(f.state.navigableItems, [b]);
  expanded.value = true;
  assert.deepEqual(f.state.navigableItems, [a, b]);
  expanded.value = false;
  f.foundation.unregisterGroup(group);
  assert.deepEqual(f.state.navigableItems, [a, b]);
});
test('navigation wraps enabled items and does not mutate registration order', () => {
  const f = fixture(),
    a = item('a'),
    disabled = item('disabled', { disabled: true }),
    b = item('b');
  for (const row of [a, disabled, b]) f.foundation.registerItem(row);
  f.foundation.moveActive(-1);
  assert.equal(f.state.activeId, b.id);
  f.foundation.moveActive(1);
  assert.equal(f.state.activeId, a.id);
  f.foundation.moveActive(1);
  assert.equal(f.state.activeId, b.id);
  assert.deepEqual(f.foundation.getVisibleItems(), [a, disabled, b]);
  f.foundation.unregisterItem(b.id);
  assert.equal(f.state.activeId, undefined);
  assert.equal(f.state.itemsVersion, 4);
  f.foundation.unregisterItem(a.id);
  f.foundation.moveActive(1);
  assert.equal(f.state.activeId, undefined);
});
test('navigation uses live document order and scrolls the chosen element', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'Node');
  Object.defineProperty(globalThis, 'Node', {
    configurable: true,
    value: { DOCUMENT_POSITION_FOLLOWING: 4, DOCUMENT_POSITION_PRECEDING: 2 },
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'Node', descriptor);
    else Reflect.deleteProperty(globalThis, 'Node');
  });
  const order: string[] = ['b', 'a'],
    scrolled: unknown[] = [];
  const element = (name: string) =>
    ({
      compareDocumentPosition(other: { name: string }) {
        return order.indexOf(name) < order.indexOf(other.name) ? 4 : 2;
      },
      name,
      scrollIntoView(options: unknown) {
        scrolled.push([name, options]);
      },
    }) as unknown as HTMLElement;
  const f = fixture(),
    a = item('a', { element: element('a') }),
    b = item('b', { element: element('b') });
  f.foundation.registerItem(a);
  f.foundation.registerItem(b);
  f.foundation.moveActive(1);
  assert.equal(f.state.activeId, b.id);
  order.reverse();
  f.foundation.setActive(undefined);
  f.foundation.moveActive(1);
  assert.equal(f.state.activeId, a.id);
  assert.deepEqual(scrolled, [
    ['b', { block: 'nearest' }],
    ['a', { block: 'nearest' }],
  ]);
});
test('query, availability and close synchronizers retain their distinct active selection rules', () => {
  const f = fixture(),
    a = item('a'),
    b = item('b', { disabled: true });
  f.foundation.registerItem(b);
  f.foundation.registerItem(a);
  f.foundation.syncNavigableItems([a]);
  assert.equal(f.state.activeId, undefined);
  f.foundation.syncQuery();
  assert.equal(f.state.activeId, a.id);
  assert.equal(f.foundation.getActiveDescendant(), 'a');
  f.foundation.setActive(b.id);
  f.foundation.syncNavigableItems([a, b]);
  assert.equal(f.state.activeId, b.id);
  f.foundation.syncNavigableItems([a]);
  assert.equal(f.state.activeId, a.id);
  f.state.query = 'a';
  f.props.resetQueryOnClose = false;
  f.foundation.syncVisible(false);
  assert.equal(f.state.query, 'a');
  f.props.resetQueryOnClose = true;
  f.foundation.syncVisible(true);
  assert.equal(f.state.query, 'a');
  f.foundation.syncVisible(false);
  assert.equal(f.state.query, '');
  assert.equal(f.state.activeId, undefined);
});
test('item selection publishes the original event before requesting close and supports close opt-out', () => {
  const f = fixture(),
    row = item('a'),
    event = new Event('click');
  f.foundation.selectItem({ ...row, disabled: true }, event);
  assert.deepEqual(f.events, []);
  f.foundation.selectItem(row, event);
  assert.equal(f.events[0][2], event);
  assert.deepEqual(
    f.events.map((x) => x[0]),
    ['select', 'update', 'visible'],
  );
  f.props.closeOnSelect = false;
  f.events.length = 0;
  f.foundation.selectItem(row, event);
  assert.deepEqual(f.events, [['select', 'a', event]]);
});
test('active selection delegates to the current registered item and ignores filtered-out items', () => {
  const f = fixture(),
    events: Event[] = [],
    row = item('a', { select: (event) => events.push(event) }),
    event = new Event('keydown');
  f.foundation.registerItem(row);
  f.foundation.setActive(row.id);
  f.foundation.selectActive(event);
  assert.equal(events[0], event);
  f.state.query = 'missing';
  f.foundation.selectActive(event);
  assert.equal(events.length, 1);
  f.foundation.unregisterItem(row.id);
  assert.equal(f.foundation.getActiveDescendant(), undefined);
});
test('shortcut parsing preserves literal minus/underscore, digits and consumer aliases', () => {
  const aliases = { page_up: 'pageup' };
  assert.deepEqual(getShortcutKeys(' Cmd + Shift + 1 ', aliases), ['meta', 'shift', 'digit1']);
  assert.deepEqual(getShortcutKeys('Ctrl+-', aliases), ['control', '-']);
  assert.deepEqual(getShortcutKeys('option+page_up', aliases), ['alt', 'pageup']);
  assert.deepEqual(getShortcutKeys('Esc+Del+Ins+Return+Spacebar', aliases), [
    'escape',
    'delete',
    'insert',
    'enter',
    'space',
  ]);
});
test('shortcut triggers require a non-modifier event and all modifiers/current keys', () => {
  assert.equal(
    isShortcutPressed('Control', key('Control', { ctrlKey: true }).event, new Set(), {}),
    false,
  );
  assert.equal(
    isShortcutPressed('Ctrl+1', key('!', { code: 'Digit1', ctrlKey: true }).event, new Set(), {}),
    true,
  );
  assert.equal(
    isShortcutPressed('Ctrl+1', key('1', { code: 'Digit1' }).event, new Set(), {}),
    false,
  );
  assert.equal(isShortcutPressed('a+b', key('b').event, new Set(['a']), {}), true);
  assert.equal(isShortcutPressed('a+b', key('b').event, new Set(), {}), false);
});
test('global shortcut guards do not read current keys; matching chooses first enabled navigable item', () => {
  const f = fixture(),
    selected: string[] = [],
    group = Symbol('g');
  f.foundation.registerGroup(group, { value: false });
  for (const row of [
    item('collapsed', {
      groupId: group,
      shortcut: 'Ctrl+k',
      select: () => selected.push('collapsed'),
    }),
    item('disabled', {
      disabled: true,
      shortcut: 'Ctrl+k',
      select: () => selected.push('disabled'),
    }),
    item('match', { shortcut: 'Ctrl+k', select: () => selected.push('match') }),
  ])
    f.foundation.registerItem(row);
  f.foundation.handleShortcut(key('k', { ctrlKey: true, type: 'keyup' }).event);
  f.foundation.handleShortcut(key('k', { ctrlKey: true, repeat: true }).event);
  f.state.innerVisible = false;
  f.foundation.handleShortcut(key('k', { ctrlKey: true }).event);
  assert.equal(f.currentKeyReads, 0);
  f.state.innerVisible = true;
  const event = key('k', { ctrlKey: true });
  f.foundation.handleShortcut(event.event);
  assert.deepEqual(selected, ['match']);
  assert.deepEqual(event.calls, ['prevent', 'stop']);
  assert.equal(f.currentKeyReads, 1);
});
test('group expansion preserves pre-search state and resets per-query overrides', () => {
  assert.equal(getModelSelectorGroupInitialExpanded('', false), true);
  assert.equal(getModelSelectorGroupInitialExpanded('Heading', false), false);
  let foundation!: ReturnType<typeof createModelSelectorGroupFoundation>;
  const state = {
    query: '',
    expanded: false,
    searchExpanded: undefined as boolean | undefined,
    get isSearching() {
      return foundation.getIsSearching();
    },
    get isExpanded() {
      return foundation.getIsExpanded();
    },
  };
  foundation = createModelSelectorGroupFoundation(state);
  assert.equal(state.isExpanded, false);
  state.query = ' model ';
  assert.equal(state.isExpanded, true);
  foundation.toggleExpanded();
  assert.equal(state.isExpanded, false);
  assert.equal(state.expanded, false);
  foundation.syncQuery();
  assert.equal(state.isExpanded, true);
  state.query = ' ';
  assert.equal(state.isExpanded, false);
  foundation.toggleExpanded();
  assert.equal(state.expanded, true);
});
function input() {
  const state = {
    modelValue: undefined as string | undefined,
    query: 'context',
    inputAttrs: { role: 'custom', placeholder: 'Find' },
    listId: 'list',
    visible: true,
    activeDescendant: 'item',
  };
  const calls: unknown[][] = [];
  const foundation = createModelSelectorInputFoundation(state, {
    update: (value) => calls.push(['update', value, state.query]),
    moveActive: (offset) => calls.push(['move', offset]),
    selectActive: (event) => calls.push(['select', event]),
    setVisible: (value) => calls.push(['visible', value]),
  });
  return { state, calls, foundation };
}
test('input query ownership and ARIA retain forced attributes with custom attribute passthrough', () => {
  const f = input();
  assert.equal(f.foundation.getMergedValue(), 'context');
  f.state.modelValue = '';
  assert.equal(f.foundation.getMergedValue(), '');
  f.foundation.syncModelValue(undefined);
  assert.equal(f.state.query, 'context');
  f.foundation.syncModelValue('external');
  assert.equal(f.state.query, 'external');
  f.foundation.handleInput('typed');
  assert.deepEqual(f.calls, [['update', 'typed', 'typed']]);
  assert.deepEqual(f.foundation.getInputAttrs(), {
    'placeholder': 'Find',
    'type': 'search',
    'role': 'combobox',
    'autocomplete': 'off',
    'aria-controls': 'list',
    'aria-expanded': true,
    'aria-activedescendant': 'item',
  });
  assert.equal(f.state.inputAttrs.role, 'custom');
});
test('input native keyboard guards preserve composition and cancellation order', () => {
  const f = input();
  const composing = key('Enter', { isComposing: true });
  f.foundation.handleKeydown(composing.event);
  assert.deepEqual(f.calls, []);
  assert.deepEqual(composing.calls, []);
  for (const [name, action] of [
    ['ArrowDown', ['move', 1]],
    ['ArrowUp', ['move', -1]],
    ['Enter', undefined],
    ['Escape', ['visible', false]],
  ] as const) {
    const k = key(name);
    f.foundation.handleKeydown(k.event);
    assert.deepEqual(k.calls, name === 'Escape' ? ['prevent', 'stop'] : ['prevent']);
    assert.deepEqual(f.calls.at(-1), action ?? ['select', k.event]);
  }
  const other = key('Tab');
  f.foundation.handleKeydown(other.event);
  assert.deepEqual(other.calls, []);
});
function itemFixture() {
  const props = {
    label: '',
    value: 'value',
    keywords: ['keyword'],
    disabled: false,
    shortcut: ' Ctrl+k ',
  };
  const element = { textContent: '  Rendered  ' } as HTMLElement;
  const events: unknown[][] = [];
  let foundation!: ReturnType<typeof createModelSelectorItemFoundation>;
  const state = {
    props,
    element: element as HTMLElement | null,
    id: Symbol('item'),
    domId: 'dom',
    groupId: Symbol('group') as symbol | undefined,
    domTextVersion: 0,
    get renderedLabel(): string {
      return foundation.getRenderedLabel();
    },
  };
  foundation = createModelSelectorItemFoundation(state, {
    select: (value, event) => events.push(['item', value, event]),
    selectItem: (data, event) => events.push(['root', data, event]),
  });
  return { props, state, events, foundation };
}
test('item snapshots retain keyword, DOM and identity references while normalizing label/shortcut', () => {
  const f = itemFixture(),
    data = f.foundation.getItemData();
  assert.equal(data.label, 'Rendered');
  assert.equal(data.shortcut, 'Ctrl+k');
  assert.equal(data.keywords, f.props.keywords);
  assert.equal(data.element, f.state.element);
  assert.equal(data.id, f.state.id);
  assert.equal(data.groupId, f.state.groupId);
  f.props.label = 'Explicit';
  assert.equal(f.foundation.getRenderedLabel(), 'Explicit');
  f.props.label = '';
  f.state.element = null;
  assert.equal(f.foundation.getRenderedLabel(), 'value');
  f.props.shortcut = ' ';
  assert.equal(f.foundation.getItemData().shortcut, undefined);
});
test('item event precedes root selection, preserves event identity and honors current disabled state', () => {
  const f = itemFixture(),
    event = new Event('click');
  f.foundation.handleSelect(event);
  assert.deepEqual(
    f.events.map((x) => x[0]),
    ['item', 'root'],
  );
  assert.equal(f.events[0][2], event);
  assert.equal(f.events[1][2], event);
  f.props.disabled = true;
  f.foundation.handleSelect(event);
  assert.equal(f.events.length, 2);
});
test('rendered text observer watches text descendants and disconnects on cleanup', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'MutationObserver'),
    observations: unknown[] = [],
    disconnections: unknown[] = [];
  let notify!: () => void;
  class Observer {
    constructor(callback: () => void) {
      notify = callback;
    }
    observe(element: unknown, options: unknown) {
      observations.push([element, options]);
    }
    disconnect() {
      disconnections.push(true);
    }
  }
  Object.defineProperty(globalThis, 'MutationObserver', { configurable: true, value: Observer });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'MutationObserver', descriptor);
    else Reflect.deleteProperty(globalThis, 'MutationObserver');
  });
  const f = itemFixture();
  let cached = 'Rendered';
  Object.defineProperty(f.state, 'renderedLabel', { get: () => cached });
  f.foundation.startLabelObserver();
  assert.deepEqual(observations, [
    [f.state.element, { childList: true, characterData: true, subtree: true }],
  ]);
  notify();
  assert.equal(f.state.domTextVersion, 0);
  f.state.element!.textContent = 'Changed';
  notify();
  assert.equal(f.state.domTextVersion, 1);
  cached = 'Changed';
  notify();
  assert.equal(f.state.domTextVersion, 1);
  f.foundation.stopLabelObserver();
  f.foundation.stopLabelObserver();
  assert.equal(disconnections.length, 1);
});
test('item observer lifecycle remains inert without a DOM or native observer', () => {
  const f = itemFixture();
  f.state.element = null;
  f.foundation.startLabelObserver();
  f.foundation.stopLabelObserver();
  assert.equal(f.state.domTextVersion, 0);
});
