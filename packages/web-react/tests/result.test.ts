import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Result } from '../dist/index.js';

test('result renders all status icons and content regions during SSR', () => {
  for (const status of ['info', 'success', 'warning', 'error', '403', '404', '500'] as const) {
    const html = renderToStaticMarkup(
      createElement(
        Result,
        {
          status,
          title: 'Title',
          subtitle: 'Subtitle',
          extra: createElement('button', null, 'Retry'),
        },
        'Details',
      ),
    );
    assert.match(html, new RegExp(`sd-result-icon-${status}`));
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /<svg/);
    for (const text of ['Title', 'Subtitle', 'Retry', 'Details']) assert.ok(html.includes(text));
  }
});

test('result supports a custom status without a default icon', () => {
  const html = renderToStaticMarkup(createElement(Result, { status: null, icon: 'Custom' }));
  assert.match(html, /sd-result-icon-custom/);
  assert.match(html, /Custom/);
  assert.doesNotMatch(
    html,
    /<svg|sd-result-title|sd-result-subtitle|sd-result-extra|sd-result-content/,
  );
});
