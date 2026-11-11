import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Divider } from '../dist/index.js';

test('horizontal divider renders accessible custom text and zero styles', () => {
  const html = renderToStaticMarkup(
    createElement(Divider, { size: 0, margin: 0, orientation: 'left' }, '标题'),
  );
  assert.match(html, /role="separator"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /border-bottom-width:0px/);
  assert.match(html, /sd-divider-text-left/);
  assert.match(html, /标题/);
});

test('vertical divider omits text and forwards native attributes', () => {
  const html = renderToStaticMarkup(
    createElement(Divider, { direction: 'vertical', id: 'divider', type: 'dotted' }, '隐藏'),
  );
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /border-left-style:dotted/);
  assert.match(html, /id="divider"/);
  assert.doesNotMatch(html, /隐藏/);
});
