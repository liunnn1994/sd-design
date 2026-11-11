import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import DefaultCopy from '../dist/copy/index.js';
import { Copy, Secret } from '../dist/index.js';
import DefaultSecret from '../dist/secret/index.js';

test('Copy and Secret export SSR-safe adapters and keep hidden text out of markup', () => {
  assert.equal(Copy, DefaultCopy);
  assert.equal(Secret, DefaultSecret);
  const hidden = renderToStaticMarkup(h(Secret, { text: 'sensitive-test-value' }));
  assert.ok(!hidden.includes('sensitive-test-value'));
  assert.match(hidden, /aria-pressed="false"/);
  assert.match(hidden, /sd-copy/);
  const visible = renderToStaticMarkup(
    h(Secret, { text: 'shown-value', visible: true, showCopy: false }),
  );
  assert.match(visible, /shown-value/);
  assert.ok(!visible.includes('sd-copy'));
  assert.match(
    renderToStaticMarkup(h(Copy, { content: 'value', component: 'button', type: 'primary' })),
    /sd-btn-primary/,
  );
});
