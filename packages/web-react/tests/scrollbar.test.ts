import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Scrollbar, Tooltip } from '../dist/index.js';

test('scrollbar keeps outer sizing separate from container attributes in SSR', () => {
  const html = renderToStaticMarkup(
    createElement(
      Scrollbar,
      {
        outerStyle: { maxHeight: 100 },
        outerClass: 'outer',
        className: 'inner',
        id: 'scroll-area',
        type: 'track',
      },
      '内容',
    ),
  );
  assert.match(html, /class="sd-scrollbar sd-scrollbar-type-track outer" style="max-height:100px"/);
  assert.match(html, /id="scroll-area" class="sd-scrollbar-container inner"/);
  assert.match(html, /<div>内容<\/div>/);
});

test('tooltip remains SSR safe and preserves the trigger element', () => {
  const html = renderToStaticMarkup(
    createElement(Tooltip, {
      content: '说明内容',
      children: createElement('button', null, '触发按钮'),
    }),
  );
  assert.match(html, /<button>触发按钮<\/button>/);
  assert.doesNotMatch(html, /说明内容/);
});
