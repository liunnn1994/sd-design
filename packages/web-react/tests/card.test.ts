import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Card, CardMeta, CardGrid, ConfigProvider } from '../dist/index.js';

test('card SSR inherits size and renders header, cover, actions and content', () => {
  const html = renderToStaticMarkup(
    createElement(
      ConfigProvider,
      { size: 'mini' },
      createElement(Card, {
        title: 'Title',
        extra: 'Extra',
        cover: 'Cover',
        actions: ['First', 'Second'],
        children: 'Body',
        fullHeight: true,
        scrollbar: false,
      }),
    ),
  );
  for (const text of [
    'sd-card-size-small',
    'sd-card-bordered',
    'sd-card-body-native',
    'Title',
    'Extra',
    'Cover',
    'Body',
    'First',
    'Second',
  ])
    assert.ok(html.includes(text), text);
  assert.equal((html.match(/class="sd-card-actions-item"/g) ?? []).length, 2);
});

test('standalone meta and grid render without requiring a parent card', () => {
  assert.equal(Card.Meta, CardMeta);
  assert.equal(Card.Grid, CardGrid);
  assert.match(
    renderToStaticMarkup(
      createElement(CardMeta, { title: 'Title', description: 'Description', avatar: 'Avatar' }),
    ),
    /sd-card-meta-avatar/,
  );
  assert.match(
    renderToStaticMarkup(createElement(CardGrid, { hoverable: true }, 'Grid')),
    /sd-card-grid-hoverable/,
  );
});
