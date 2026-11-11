import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { List, ListItem, ListItemMeta, ConfigProvider } from '../dist/index.js';

test('List SSR paginates flattened children ahead of data and retains short server pages', () => {
  const html = render(
    h(
      List,
      { data: ['ignored'], paginationProps: { defaultCurrent: 2, defaultPageSize: 2 } },
      h(
        Fragment,
        null,
        ['a', 'b', 'c', 'd'].map((value) => h(ListItem, { key: value }, value)),
      ),
    ),
  );
  assert.doesNotMatch(html, />a<|>b<|ignored/);
  assert.match(html, />c</);
  assert.match(html, />d</);
  const serverPage = render(
    h(List, {
      data: ['remote'],
      paginationProps: { current: 9, pageSize: 10, total: 100 },
      renderItem: ({ item }) => h(ListItem, null, String(item)),
    }),
  );
  assert.match(serverPage, />remote</);
});

test('List SSR shares grid row sizing and preserves continuous render indexes', () => {
  const html = render(
    h(List, {
      data: ['a', 'b', 'c', 'd', 'e'],
      gridProps: { span: 5 },
      virtualListProps: { height: 100 },
      renderItem: ({ item, index }) => h('output', null, `${index}:${item}`),
    }),
  );
  assert.equal((html.match(/sd-list-row/g) ?? []).length, 2);
  for (const item of ['0:a', '1:b', '2:c', '3:d', '4:e']) assert.ok(html.includes(item));
  assert.doesNotMatch(html, /sd-virtual-list-scroller/);
});

test('List SSR projects empty providers, item metadata, actions and static aliases', () => {
  assert.equal(List.Item, ListItem);
  assert.equal(ListItem.Meta, ListItemMeta);
  const empty = render(
    h(ConfigProvider, { renderEmpty: ({ component }) => h('output', null, component) }, h(List)),
  );
  assert.match(empty, /<output>list<\/output>/);
  assert.doesNotMatch(render(h(ConfigProvider, { renderEmpty: () => null }, h(List))), /sd-empty/);
  assert.doesNotMatch(render(h(ListItemMeta, { title: '', description: '' })), /meta-content/);
  const item = render(
    h(
      ListItem,
      {
        actionLayout: 'vertical',
        actions: [h('button', { key: 'a' }, 'Action')],
        meta: h(ListItemMeta, { title: 'Title', avatar: h('span', null, 'Avatar') }),
        extra: 'Extra',
      },
      'Content',
    ),
  );
  assert.match(item, /role="listitem"/);
  assert.match(item, /sd-list-item-action/);
  assert.match(item, /sd-list-item-meta-avatar/);
  assert.match(item, /Extra/);
});
