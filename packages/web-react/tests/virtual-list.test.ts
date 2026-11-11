import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VirtualList } from '../dist/_shared/virtual-list.js';

test('VirtualList SSR preserves affixes, empty content and native host attributes', () => {
  const html = renderToStaticMarkup(
    h(VirtualList, {
      'items': [],
      'height': 120,
      'before': h('b', {}, 'Before'),
      'after': h('b', {}, 'After'),
      'empty': h('i', {}, 'Empty'),
      'className': 'custom',
      'aria-label': 'Rows',
    }),
  );
  assert.match(html, /sd-virtual-list-scrollbar custom/);
  assert.match(html, /height:120px/);
  assert.match(html, /aria-label="Rows"/);
  assert.ok(html.indexOf('Before') < html.indexOf('After'));
  assert.ok(html.indexOf('After') < html.indexOf('Empty'));
  assert.ok(!html.includes('sd-virtual-list-content'));
});

test('VirtualList SSR prerenders items with container attributes and fixed item styles', () => {
  const html = renderToStaticMarkup(
    h(VirtualList<{ key: number }>, {
      items: [{ key: 1 }, { key: 2 }, { key: 3 }],
      prerender: 2,
      itemSize: 30,
      fixedSize: true,
      minItemSize: 20,
      direction: 'horizontal',
      listTag: 'ul',
      itemTag: 'li',
      listClass: 'rows',
      itemClass: 'row',
      listAttrs: { 'aria-label': 'Items', 'className': 'native-rows' },
      children: ({ item, active }) => h('span', {}, `${item.key}:${active}`),
    }),
  );
  assert.match(html, /<ul[^>]*aria-label="Items"/);
  assert.match(html, /native-rows sd-virtual-list-content rows/);
  assert.match(html, /<li[^>]*class="row"/);
  assert.match(html, /width:30px/);
  assert.match(html, /min-width:20px/);
  assert.match(html, /1:true/);
  assert.match(html, /2:true/);
  assert.ok(!html.includes('3:true'));
});
