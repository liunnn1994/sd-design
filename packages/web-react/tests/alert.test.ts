import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert } from '../dist/index.js';

test('alert renders status, title, actions and accessible close without running callbacks in SSR', () => {
  let calls = 0;
  const html = renderToStaticMarkup(
    createElement(Alert, {
      title: 'Title',
      type: 'warning',
      banner: true,
      center: true,
      closable: true,
      action: createElement('button', null, 'Retry'),
      children: 'Content',
      onClose: () => calls++,
      onAfterClose: () => calls++,
    }),
  );
  assert.match(html, /role="alert"/);
  for (const modifier of ['warning', 'banner', 'center', 'with-title'])
    assert.match(html, new RegExp(`sd-alert-${modifier}`));
  assert.match(html, /role="button" aria-label=/);
  assert.match(html, /Retry/);
  assert.equal(calls, 0);
});

test('normal alert omits the default icon while supporting a custom icon', () => {
  const normal = renderToStaticMarkup(createElement(Alert, { type: 'normal', children: 'Normal' }));
  assert.doesNotMatch(normal, /sd-alert-icon/);
  const custom = renderToStaticMarkup(
    createElement(Alert, { type: 'normal', icon: '!', children: 'Normal' }),
  );
  assert.match(custom, /sd-alert-icon/);
});
