import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ConfigProvider, Spin } from '../dist/index.js';

test('standalone spin ignores loading=false and respects custom elements', () => {
  const html = renderToStaticMarkup(
    createElement(Spin, { loading: false, element: createElement('span', null, '等待') }),
  );
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /等待/);
});

test('provider defaults can be overridden explicitly and content is preserved', () => {
  const html = renderToStaticMarkup(
    createElement(
      ConfigProvider,
      { spinProps: { loading: true, hideIcon: true, tip: '等待' } },
      createElement(Spin, { loading: false }, '内容'),
    ),
  );
  assert.doesNotMatch(html, /aria-busy|sd-spin-mask/);
  assert.match(html, /内容/);
});
