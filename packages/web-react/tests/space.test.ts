import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Space } from '../dist/index.js';

test('space flattens fragments, ignores empty children and inserts only internal separators', () => {
  const html = renderToStaticMarkup(
    createElement(
      Space,
      { split: '|', size: [0, 'large'], wrap: true },
      null,
      false,
      createElement(
        Fragment,
        null,
        createElement('span', null, 'A'),
        createElement('span', null, 'B'),
      ),
    ),
  );
  assert.equal((html.match(/class="sd-space-item"/g) ?? []).length, 2);
  assert.equal((html.match(/class="sd-space-item-split"/g) ?? []).length, 1);
  assert.match(html, /column-gap:0px/);
  assert.match(html, /row-gap:24px/);
  assert.match(html, /sd-space-wrap/);
});

test('vertical space does not force horizontal default alignment', () => {
  const html = renderToStaticMarkup(
    createElement(Space, { direction: 'vertical', fill: true }, 'A'),
  );
  assert.match(html, /sd-space-vertical/);
  assert.match(html, /sd-space-fill/);
  assert.doesNotMatch(html, /sd-space-align-center/);
});
