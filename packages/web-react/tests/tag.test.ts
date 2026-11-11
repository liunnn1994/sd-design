import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Tag } from '../dist/index.js';

test('controlled tag visibility and checked state override defaults', () => {
  assert.equal(renderToStaticMarkup(createElement(Tag, { visible: false }, '隐藏')), '');
  const html = renderToStaticMarkup(
    createElement(Tag, { checkable: true, checked: false, defaultChecked: true }, '标签'),
  );
  assert.match(html, /role="button"/);
  assert.match(html, /aria-pressed="false"/);
});

test('tag shares custom color variables and explicit zero alpha', () => {
  const html = renderToStaticMarkup(
    createElement(
      Tag,
      { color: '#123456', bordered: false, backgroundAlpha: 0, textColor: '#fff' },
      '颜色',
    ),
  );
  assert.match(html, /--sd-tag-bg-color:rgb\(18 52 86 \/ 0\)/);
  assert.match(html, /--sd-tag-color:#fff/);
});
