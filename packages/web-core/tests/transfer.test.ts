import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { TransferItem, TransferDirection } from '../src/transfer/types.ts';

import {
  createTransferFoundation,
  createTransferViewFoundation,
  createTransferItemFoundation,
  getTransferDataInfo,
} from '../dist/transfer/foundation.js';

const data = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta', disabled: true },
  { value: 'c', label: 'Gamma' },
];

test('Transfer partitions original entries in data order, retaining disabled selections and duplicate keys', () => {
  const duplicate = { value: 'a', label: 'Another Alpha', extra: 1 };
  const info = getTransferDataInfo(
    [...data, duplicate],
    ['c', 'a', 'missing'],
    ['a', 'b', 'unknown'],
  );
  assert.deepEqual(info.sourceInfo, {
    data: [data[1]],
    allValidValues: [],
    selected: ['b'],
    validSelected: [],
  });
  assert.deepEqual(info.targetInfo.allValidValues, ['a', 'c', 'a']);
  assert.deepEqual(info.targetInfo.validSelected, ['a', 'a']);
  assert.equal(info.targetInfo.data[2], duplicate);
});

function setup() {
  let target = ['c'];
  let selected = ['a', 'b', 'c'];
  const events: unknown[][] = [];
  const foundation = createTransferFoundation({
    getTarget: () => target,
    getDataInfo: () => getTransferDataInfo(data, target, selected),
    setTarget: (value) => {
      target = value;
      events.push(['local-target', value]);
    },
    setSelected: (value) => {
      selected = value;
      events.push(['local-selected', value]);
    },
    onUpdateTarget: (value) => events.push(['update:modelValue', value]),
    onChange: (value) => events.push(['change', value]),
    onFormChange: () => events.push(['form']),
    onUpdateSelected: (value) => events.push(['update:selected', value]),
    onSelect: (value) => events.push(['select', value]),
    onSearch: (value, type) => events.push(['search', value, type]),
  });
  return { foundation, events, getTarget: () => target, getSelected: () => selected };
}

test('Transfer moves valid selected entries and publishes selection before model/change/form events', () => {
  const { foundation, events, getTarget, getSelected } = setup();
  foundation.moveSelected('target');
  assert.deepEqual(getTarget(), ['c', 'a']);
  assert.deepEqual(getSelected(), ['c']);
  assert.deepEqual(
    events.map((event) => event[0]),
    [
      'local-selected',
      'update:selected',
      'select',
      'local-target',
      'update:modelValue',
      'change',
      'form',
    ],
  );
  assert.equal(events[3][1], events[4][1]);
  assert.equal(events[4][1], events[5][1]);
  foundation.moveSelected('source');
  assert.deepEqual(getTarget(), ['a']);
  assert.deepEqual(getSelected(), []);
});

test('Transfer direct moves preserve duplicate targets and unknown keys, while return moves remove all matches', () => {
  const { foundation, getTarget } = setup();
  foundation.moveTo(['c', 'missing'], 'target');
  assert.deepEqual(getTarget(), ['c', 'c', 'missing']);
  foundation.moveTo(['c'], 'source');
  assert.deepEqual(getTarget(), ['missing']);
});

test('Transfer computes the move snapshot before synchronous selection listeners change controlled state', () => {
  let target = ['c'];
  const foundation = createTransferFoundation({
    getTarget: () => target,
    getDataInfo: () => getTransferDataInfo(data, target, ['a']),
    setTarget: (value) => {
      target = value;
    },
    setSelected: () => {},
    onUpdateSelected: () => {
      target = ['listener'];
    },
    onSelect: () => {},
    onUpdateTarget: () => {},
    onChange: () => {},
    onFormChange: () => {},
    onSearch: () => {},
  });
  foundation.moveSelected('target');
  assert.deepEqual(target, ['c', 'a']);
});

test('Transfer view filters labels but selects all valid panel entries, preserving unrelated and disabled selections', () => {
  let selected = ['b', 'c', 'a'];
  let filter = 'Al';
  let disabled = false;
  const moves: unknown[][] = [];
  const view = createTransferViewFoundation({
    getDataInfo: () => getTransferDataInfo(data, ['c'], selected).sourceInfo,
    getSelected: () => selected,
    getFilter: () => filter,
    isDisabled: () => disabled,
    onSelect: (value) => {
      selected = value;
    },
    moveTo: (values, type) => moves.push([values, type]),
  });
  assert.deepEqual(view.getFilteredData(), [data[0]]);
  assert.equal(view.isChecked(), true);
  view.selectAll(true);
  assert.deepEqual(selected, ['b', 'c', 'a']);
  view.selectAll(false);
  assert.deepEqual(selected, ['b', 'c']);
  assert.equal(view.isChecked(), false);
  view.clear();
  assert.deepEqual(moves, [[['a'], 'source']]);
  disabled = true;
  view.selectAll(true);
  view.clear();
  assert.deepEqual(selected, ['b', 'c']);
  assert.equal(moves.length, 1);
  filter = 'alpha';
  assert.deepEqual(view.getFilteredData(), []);
});

test('Transfer view handles empty/partial headers and truthy array checkbox payloads', () => {
  let selected: string[] = ['a'];
  let entries: TransferItem[] = data;
  const view = createTransferViewFoundation({
    getDataInfo: () => getTransferDataInfo(entries, [], selected).sourceInfo,
    getSelected: () => selected,
    getFilter: () => '',
    isDisabled: () => false,
    onSelect: (value) => {
      selected = value;
    },
    moveTo: () => {},
  });
  assert.equal(view.isIndeterminate(), true);
  assert.equal(view.isChecked(), false);
  view.selectAll([]);
  assert.deepEqual(selected, ['a', 'c']);
  entries = [];
  assert.equal(view.isChecked(), false);
  assert.equal(view.isIndeterminate(), false);
});

test('Transfer item actions follow live simple/disabled/type state and preserve payload identity', () => {
  let simple = false;
  let disabled = false;
  let type: TransferDirection | undefined;
  const events: unknown[][] = [];
  const item = createTransferItemFoundation({
    isSimple: () => simple,
    isDisabled: () => disabled,
    getValue: () => 'a',
    getType: () => type,
    moveTo: (values, target) => events.push([values, target]),
    onSelect: (values) => events.push([values]),
  });
  item.click();
  assert.deepEqual(events, []);
  simple = true;
  item.click();
  type = 'target';
  item.click();
  disabled = true;
  item.click();
  assert.deepEqual(events, [
    [['a'], 'target'],
    [['a'], 'source'],
  ]);
  const payload = ['a', 'c'];
  item.change(payload);
  assert.equal(events[2][0], payload);
  item.remove();
  assert.deepEqual(events[3], [['a'], 'source']);
});
