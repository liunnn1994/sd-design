import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { KvList, ConfigProvider } from '../dist/index.js';
import List from '../dist/kv-list/index.js';
test('KvList SSR initializes one editable row and exposes the native root component', () => {
  assert.equal(List, KvList);
  const html = render(h(KvList));
  assert.equal((html.match(/data-testid="kv-list-row"/g) ?? []).length, 1);
  assert.equal((html.match(/<input /g) ?? []).length, 2);
  assert.match(html, /sd-kv-list-drag-handle/);
});
test('KvList SSR prefers JSON over bulk without invoking synchronization callbacks', () => {
  let changes = 0;
  const html = render(
    h(KvList, {
      json: [{ key: 'json', value: 'chosen' }],
      bulk: 'bulk: ignored',
      onJsonChange: () => changes++,
      onBulkChange: () => changes++,
    }),
  );
  assert.equal(changes, 0);
  assert.match(html, /value="json"/);
  assert.match(html, /value="chosen"/);
  assert.doesNotMatch(html, /value="ignored"/);
});
test('KvList SSR parses bulk at the first colon and preserves duplicate keys and custom renderers', () => {
  const html = render(
    h(KvList, {
      defaultBulk: 'x: one:two\nx: three',
      renderValue: ({ value, index }) => h('strong', {}, `${index}:${value}`),
      toolbarExtra: 'toolbar',
      renderRowActions: ({ item }) => h('span', {}, `action:${item.key}`),
    }),
  );
  assert.equal((html.match(/data-testid="kv-list-row"/g) ?? []).length, 2);
  assert.match(html, /0:one:two/);
  assert.match(html, /1:three/);
  assert.match(html, /toolbar/);
});
test('KvList SSR uses secret inputs, disabled native controls and the library prefix', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(KvList, {
        type: 'secret',
        disabled: true,
        defaultJson: [{ key: 'token', value: 'secret' }],
      }),
    ),
  );
  assert.match(html, /custom-kv-list/);
  assert.match(html, /type="password"/);
  assert.match(html, /disabled=""/);
  assert.doesNotMatch(html, /custom-icon-edit/);
});
