import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Badge, ConfigProvider } from '../dist/index.js';

test('badge retains simultaneous status and overflow count', () => {
  const html = renderToStaticMarkup(
    createElement(Badge, { status: 'success', count: 100, text: '成功' }),
  );
  assert.match(html, /sd-badge-status-success/);
  assert.match(html, /aria-label="99\+"/);
  assert.match(html, /sd-badge-status-text/);
});

test('badge content wins over status/count and shares RTL offset rules', () => {
  const html = renderToStaticMarkup(
    createElement(
      ConfigProvider,
      { rtl: true },
      createElement(Badge, { content: '自定义', status: 'danger', count: 10, offset: [4, 2] }),
    ),
  );
  assert.match(html, /margin-left:-4px;margin-top:2px/);
  assert.match(html, /sd-badge-custom-dot/);
  assert.doesNotMatch(html, /sd-badge-number/);
});

test('badge distinguishes a color status without count from an explicit zero count', () => {
  const status = renderToStaticMarkup(createElement(Badge, { color: '#123456' }));
  const zero = renderToStaticMarkup(createElement(Badge, { color: '#123456', count: 0 }));
  assert.match(status, /background-color:#123456/);
  assert.doesNotMatch(zero, /sd-badge-status-dot/);
  const dot = renderToStaticMarkup(createElement(Badge, { dot: true, count: 3 }));
  assert.match(dot, /role="status" aria-label="3"/);
});
