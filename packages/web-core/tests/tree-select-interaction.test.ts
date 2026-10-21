import assert from 'node:assert/strict';
import { test } from 'node:test';

import type {
  TreeSelectInteractionAdapter,
  TreeSelectInteractionState,
} from '../src/tree-select/interaction.ts';

import { createTreeSelectInteraction } from '../dist/tree-select/interaction.js';
import {
  getTreeSelectDisplayValue,
  getTreeSelectSelectedOptions,
  getTreeSelectTriggerValue,
  getTreeSelectViewValues,
  isTreeSelectSelectable,
} from '../dist/tree-select/presentation.js';

function setup() {
  const state = {
    inputValue: '',
    panelVisible: false,
    readonly: false as boolean | string | undefined,
    disabled: false,
    allowSearch: true,
  };
  const calls: unknown[][] = [];
  const adapter: TreeSelectInteractionAdapter = {
    setInputValue: (value) => {
      calls.push(['input', value]);
      state.inputValue = value;
    },
    setPanelVisible: (value) => {
      calls.push(['panel', value]);
      state.panelVisible = value;
    },
    showReadonlyTip: () => {
      calls.push(['tip']);
    },
    blur: () => {
      calls.push(['blur']);
    },
    events: {
      updateInputValue: (value) => {
        calls.push(['updateInput', value]);
      },
      inputValueChange: (value) => {
        calls.push(['inputChange', value]);
      },
      search: (value) => {
        calls.push(['search', value]);
      },
      popupVisibleChange: (value) => {
        calls.push(['popupChange', value]);
      },
      updatePopupVisible: (value) => {
        calls.push(['updatePopup', value]);
      },
      showChange: (value) => {
        calls.push(['showChange', value]);
      },
      updateShow: (value) => {
        calls.push(['updateShow', value]);
      },
    },
  };
  return { state, calls, adapter, foundation: createTreeSelectInteraction(state, adapter) };
}

test('tree-select interaction construction and identical input notifications read no unrelated state', () => {
  const s = setup();
  const state: TreeSelectInteractionState = {
    inputValue: 'same',
    get panelVisible(): never {
      throw Error('early panel');
    },
    get readonly(): never {
      throw Error('early readonly');
    },
    get disabled(): never {
      throw Error('early disabled');
    },
    get allowSearch(): never {
      throw Error('early search');
    },
  };
  createTreeSelectInteraction(state, s.adapter).handleInputValueChange('same');
  assert.deepEqual(s.calls, []);
});

test('tree-select input opens before writing and sends all visibility aliases before input/search', () => {
  const s = setup();
  s.foundation.handleInputValueChange('new');
  assert.deepEqual(s.calls, [
    ['panel', true],
    ['popupChange', true],
    ['updatePopup', true],
    ['showChange', true],
    ['updateShow', true],
    ['input', 'new'],
    ['updateInput', 'new'],
    ['inputChange', 'new'],
    ['search', 'new'],
  ]);
  s.calls.length = 0;
  s.foundation.handleInputValueChange('new');
  assert.deepEqual(s.calls, []);
});

test('tree-select repeated rejected controlled requests retain alias order and authoritative comparisons', () => {
  const s = setup();
  s.adapter.setPanelVisible = (value) => {
    s.calls.push(['panel', value]);
  };
  s.adapter.setInputValue = (value) => {
    s.calls.push(['input', value]);
  };
  s.foundation.handleInputValueChange('requested');
  const first = s.calls.slice();
  s.calls.length = 0;
  s.foundation.handleInputValueChange('requested');
  assert.deepEqual(s.calls, first);
  assert.equal(s.state.inputValue, '');
  assert.equal(s.state.panelVisible, false);
});

test('tree-select readonly opening shows the tip but still updates the requested search input', () => {
  const s = setup();
  s.state.readonly = 'Locked';
  s.foundation.handleInputValueChange('query');
  assert.deepEqual(s.calls, [
    ['tip'],
    ['input', 'query'],
    ['updateInput', 'query'],
    ['inputChange', 'query'],
    ['search', 'query'],
  ]);
  assert.equal(s.state.panelVisible, false);
  s.calls.length = 0;
  s.state.disabled = true;
  s.foundation.setPanelVisible(true);
  assert.deepEqual(s.calls, [
    ['panel', true],
    ['popupChange', true],
    ['updatePopup', true],
    ['showChange', true],
    ['updateShow', true],
  ]);
});

test('tree-select unchanged close still blurs and changed close sends aliases before blur', () => {
  const s = setup();
  s.state.readonly = true;
  s.foundation.setPanelVisible(false);
  assert.deepEqual(s.calls, [['blur']]);
  s.state.panelVisible = true;
  s.calls.length = 0;
  s.foundation.setPanelVisible(false);
  assert.deepEqual(s.calls, [
    ['panel', false],
    ['popupChange', false],
    ['updatePopup', false],
    ['showChange', false],
    ['updateShow', false],
    ['blur'],
  ]);
});

test('tree-select search policy is read after input notifications and direct updates never deduplicate', () => {
  const s = setup();
  s.adapter.events.inputValueChange = (value) => {
    s.calls.push(['inputChange', value]);
    s.state.allowSearch = false;
  };
  s.foundation.handleInputValueChange('query');
  assert.equal(
    s.calls.some((call) => call[0] === 'search'),
    false,
  );
  s.calls.length = 0;
  s.foundation.updateInputValue('query');
  assert.deepEqual(s.calls, [
    ['input', 'query'],
    ['updateInput', 'query'],
    ['inputChange', 'query'],
  ]);
});

test('tree-select input notification failures propagate before later notifications', () => {
  const s = setup(),
    failure = Error('notification failed');
  s.adapter.events.updateInputValue = () => {
    throw failure;
  };
  assert.throws(
    () => s.foundation.handleInputValueChange('query'),
    (error) => error === failure,
  );
  assert.equal(s.state.inputValue, 'query');
  assert.equal(
    s.calls.some((call) => call[0] === 'inputChange' || call[0] === 'search'),
    false,
  );
});

test('tree-select selectable handles leaf/boolean/undefined and preserves callback cell receiver', () => {
  const node = {},
    info = { isLeaf: true, level: 2 };
  for (const [value, result] of [
    ['leaf', true],
    [false, false],
    [true, true],
    [undefined, false],
  ] as const)
    assert.equal(isTreeSelectSelectable({ value }, node, info), result);
  assert.equal(isTreeSelectSelectable({ value: 'leaf' }, node, { ...info, isLeaf: false }), false);
  const cell = {
    value(actual: object, context: typeof info) {
      assert.equal(this, cell);
      assert.equal(actual, node);
      assert.equal(context, info);
      return false;
    },
  };
  assert.equal(isTreeSelectSelectable(cell, node, info), false);
});

test('tree-select undefined selection projections are lazy and do not manufacture closable metadata', () => {
  assert.deepEqual(
    getTreeSelectViewValues({
      selectedValues: undefined,
      get multiple(): never {
        throw Error('unused multiple');
      },
      get disabled(): never {
        throw Error('unused disabled');
      },
      get nodes(): never {
        throw Error('unused nodes');
      },
      isNodeClosable() {
        throw Error('unused closable');
      },
    }),
    [],
  );
  const node = { treeNodeData: { title: 'Node' } },
    nodes = new Map([[0, node]]),
    item = { value: 0, label: 7 };
  for (const [multiple, disabled] of [
    [false, false],
    [true, true],
  ]) {
    const result = getTreeSelectViewValues({
      selectedValues: [item],
      multiple: multiple!,
      disabled: disabled!,
      nodes,
      isNodeClosable() {
        throw Error('unexpected closable');
      },
    });
    assert.deepEqual(result, [{ ...item, option: node.treeNodeData }]);
    assert.equal(Object.hasOwn(result[0]!, 'closable'), false);
    assert.equal(result[0]!.option?.title, 'Node');
  }
});

test('tree-select multiple projections retain option identity, original metadata and fallback close policy', () => {
  const node = { treeNodeData: { title: 'Node' } },
    nodes = new Map([[0, node]]),
    item = { value: 0, label: 'First', extra: 'retained' };
  const result = getTreeSelectViewValues({
    selectedValues: [item, { value: 'missing', label: 'Missing' }],
    multiple: true,
    disabled: false,
    nodes,
    isNodeClosable(value) {
      assert.equal(value, node);
      return false;
    },
  });
  assert.deepEqual(result, [
    { ...item, option: node.treeNodeData, closable: false },
    { value: 'missing', label: 'Missing', option: undefined, closable: true },
  ]);
  assert.equal(result[0]!.option, node.treeNodeData);
  assert.notEqual(result[0], item);
});

test('tree-select trigger projections preserve single/multiple arrays, inactive branches and empty values', () => {
  const keys = [0, ''],
    values = [{ value: 0, label: 'Zero' }];
  assert.equal(
    getTreeSelectTriggerValue({
      labelInValue: false,
      get selectedValues(): never {
        throw Error('inactive labels');
      },
      selectedKeys: keys,
      multiple: true,
    }),
    keys,
  );
  assert.equal(
    getTreeSelectTriggerValue({
      labelInValue: true,
      selectedValues: values,
      get selectedKeys(): never {
        throw Error('inactive keys');
      },
      multiple: false,
    }),
    values[0],
  );
  assert.equal(
    getTreeSelectTriggerValue({
      labelInValue: false,
      selectedValues: undefined,
      selectedKeys: undefined,
      multiple: false,
    }),
    undefined,
  );
  assert.equal(
    getTreeSelectTriggerValue({
      labelInValue: false,
      selectedValues: undefined,
      selectedKeys: keys,
      multiple: false,
    }),
    0,
  );
});

test('tree-select display reads multiplicity after string coercion and keeps truthy selected options', () => {
  let multiple = false;
  assert.deepEqual(
    getTreeSelectDisplayValue({
      values: [
        {
          label: {
            toString() {
              multiple = true;
              return 'changed';
            },
          },
        },
      ],
      get multiple() {
        return multiple;
      },
    }),
    ['changed'],
  );
  assert.equal(getTreeSelectDisplayValue({ values: [], multiple: false }), '');
  const first = { id: 1 },
    second = { id: 2 };
  assert.deepEqual(
    getTreeSelectSelectedOptions([
      { option: first },
      {},
      { option: undefined },
      { option: second },
      { option: first },
    ]),
    [first, second, first],
  );
});
