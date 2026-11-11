import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { WrapClamp } from '../dist/index.js';

test('wrap SSR keeps all items in order and supplies typed affix state', () => {
  const html = renderToStaticMarkup(
    createElement(WrapClamp<string>, {
      items: ['First', 'Second'],
      maxLines: 1,
      as: 'section',
      renderItem: ({ item, index }) => createElement('b', null, `${index}: ${item}`),
      before: () => null,
      after: ({ hiddenItems, expanded }) => `${hiddenItems.length} hidden; expanded=${expanded}`,
    }),
  );
  assert.match(html, /^<section/);
  assert.ok(html.indexOf('0: First') < html.indexOf('1: Second'));
  assert.match(html, /0 hidden; expanded=false/);
  assert.doesNotMatch(html, /data-part="before"|aria-hidden/);
});

test('wrap SSR preserves controlled expansion and renders empty lists without item shells', () => {
  const html = renderToStaticMarkup(
    createElement(WrapClamp<number>, {
      items: [],
      expanded: true,
      maxHeight: 20,
      renderItem: ({ item }) => item,
      after: ({ expanded }) => (expanded ? 'Expanded' : 'Collapsed'),
    }),
  );
  assert.match(html, /Expanded/);
  assert.doesNotMatch(html, /max-height|data-part="item"/);
});
