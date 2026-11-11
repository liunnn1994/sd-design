import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PageHeader } from '../dist/index.js';

test('page header renders accessible back control and all content regions without invoking events', () => {
  let calls = 0;
  const html = renderToStaticMarkup(
    createElement(
      PageHeader,
      {
        title: 'Title',
        subtitle: 'Subtitle',
        breadcrumb: 'Breadcrumb',
        extra: 'Extra',
        onBack: () => calls++,
      },
      'Content',
    ),
  );
  for (const text of [
    'Title',
    'Subtitle',
    'Breadcrumb',
    'Extra',
    'Content',
    'sd-page-header-with-breadcrumb',
    'sd-page-header-with-content',
    'role="button"',
    'tabindex="0"',
  ])
    assert.ok(html.includes(text));
  assert.match(html, /sd-page-header-divider" aria-hidden="true"/);
  assert.equal(calls, 0);
});

test('page header omits optional regions and back control when disabled', () => {
  const html = renderToStaticMarkup(createElement(PageHeader, { showBack: false, title: 'Title' }));
  for (const name of ['back-btn', 'subtitle', 'divider', 'breadcrumb', 'extra', 'content'])
    assert.ok(!html.includes(`sd-page-header-${name}`));
  assert.match(html, /sd-page-header-title/);
});
