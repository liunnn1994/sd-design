import { Transfer as RootTransfer } from '@sdata/web-react';
import { Transfer as EntryTransfer } from '@sdata/web-react/transfer';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { CheckboxGroup } from '../dist/checkbox/index.js';
import { ConfigProvider } from '../dist/config-provider/index.js';
import { Transfer } from '../dist/transfer/index.js';

const data = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta', disabled: true },
  { value: 'c', label: 'Gamma' },
];

test('Transfer partitions source and target in data order and counts disabled selections', () => {
  assert.equal(RootTransfer, Transfer);
  assert.equal(EntryTransfer, Transfer);
  const html = render(
    h(Transfer, { data, defaultValue: ['c'], defaultSelected: ['a', 'b'], id: 'transfer' }),
  );
  const source = html.slice(
    html.indexOf('sd-transfer-view-source'),
    html.indexOf('sd-transfer-operations'),
  );
  const target = html.slice(html.indexOf('sd-transfer-view-target'));
  assert.match(html, /id="transfer"/);
  assert.ok(source.indexOf('Alpha') < source.indexOf('Beta'));
  assert.doesNotMatch(source, /Gamma/);
  assert.match(source, /header-count">2 \/ 2/);
  assert.match(target, /Gamma/);
  assert.doesNotMatch(target, /Alpha|Beta/);
  assert.match(source, /sd-transfer-list-item-disabled/);
});

test('Transfer simple and one-way modes expose their distinct controls', () => {
  const simple = render(h(Transfer, { data, simple: true }));
  assert.match(simple, /sd-transfer-simple/);
  assert.doesNotMatch(simple, /sd-transfer-operations|type="checkbox"|header-count/);
  const oneWay = render(h(Transfer, { data, oneWay: true, defaultValue: ['b', 'c'] }));
  assert.equal((oneWay.match(/sd-transfer-list-item-remove-btn/g) ?? []).length, 1);
  assert.match(oneWay, /sd-transfer-view-header-clear-btn/);
  const disabled = render(h(Transfer, { data, oneWay: true, disabled: true, defaultValue: ['c'] }));
  assert.doesNotMatch(disabled, /sd-transfer-list-item-remove-btn/);
  assert.match(disabled, /sd-icon-hover-disabled/);
});

test('Transfer render props receive complete panel and title state', () => {
  const html = render(
    h(Transfer, {
      data,
      value: ['c'],
      selected: ['a'],
      renderSource: ({ data, selectedKeys, onSelect }) => {
        assert.deepEqual(
          data.map((item) => item.value),
          ['a', 'b'],
        );
        assert.deepEqual(selectedKeys, ['a']);
        assert.equal(typeof onSelect, 'function');
        return h('b', null, 'SOURCE');
      },
      renderTargetTitle: (state) => {
        assert.equal(state.countTotal, 1);
        assert.equal(state.countSelected, 0);
        assert.equal(state.searchValue, '');
        assert.equal(state.checked, false);
        assert.equal(state.indeterminate, false);
        assert.equal(typeof state.onClear, 'function');
        return h('b', null, 'TARGET TITLE');
      },
      renderItem: ({ label, value }) => `${value}:${label}`,
    }),
  );
  assert.match(html, /SOURCE/);
  assert.match(html, /TARGET TITLE/);
  assert.match(html, /c:Gamma/);
});

test('Transfer uses local checkbox values inside an unrelated CheckboxGroup', () => {
  const html = render(
    h(CheckboxGroup, { value: ['c'], disabled: true }, h(Transfer, { data, selected: ['a'] })),
  );
  const alpha = html.match(/<input[^>]*value="a"[^>]*>/)?.[0];
  const gamma = html.match(/<input[^>]*value="c"[^>]*>/)?.[0];
  assert.ok(alpha);
  assert.ok(gamma);
  assert.match(alpha, /checked/);
  assert.doesNotMatch(alpha, /disabled/);
  assert.doesNotMatch(gamma, /checked|disabled/);
});

test('Transfer preserves custom prefixes and input search attributes', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(Transfer, {
        data,
        showSearch: true,
        sourceInputSearchProps: {
          placeholder: 'Find source',
          inputAttrs: { 'aria-label': 'Source search' },
        },
        targetInputSearchProps: { placeholder: 'Find target' },
      }),
    ),
  );
  assert.match(html, /custom-transfer-view-source/);
  assert.match(html, /placeholder="Find source"/);
  assert.match(html, /aria-label="Source search"/);
  assert.match(html, /placeholder="Find target"/);
});
