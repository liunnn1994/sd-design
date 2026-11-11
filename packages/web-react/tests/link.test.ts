import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Link, Button, Tag } from '../dist/index.js';

test('link preserves status, icon-only presentation and disabled href semantics', () => {
  const html = renderToStaticMarkup(
    createElement(Link, {
      'icon': true,
      'disabled': true,
      'href': '/target',
      'status': 'danger',
      'aria-label': 'Open',
    }),
  );
  assert.match(html, /sd-link-status-danger/);
  assert.match(html, /sd-link-hoverless/);
  assert.match(html, /sd-link-icon-only/);
  assert.doesNotMatch(html, /href=/);
  assert.match(html, /aria-label="Open"/);
});

test('button and link default to lazy ellipsis without SSR measurement probes', () => {
  for (const Component of [Button, Link]) {
    const html = renderToStaticMarkup(createElement(Component, null, 'Content'));
    assert.match(html, /sd-ellipsis/);
    assert.doesNotMatch(html, /data-ellipsis-measure/);
    const plain = renderToStaticMarkup(createElement(Component, { ellipsis: false }, 'Content'));
    assert.doesNotMatch(plain, /sd-ellipsis/);
  }
});

test('tag retains nowrap fallback and explicit ellipsis precedence', () => {
  const plain = renderToStaticMarkup(createElement(Tag, { nowrap: false }, 'Content'));
  assert.match(plain, /sd-tag-no-ellipsis/);
  assert.doesNotMatch(plain, /sd-ellipsis/);
  const multiline = renderToStaticMarkup(
    createElement(Tag, { nowrap: false, ellipsis: true, ellipsisLineClamp: 2 }, 'Content'),
  );
  assert.match(multiline, /sd-tag-ellipsis-line-clamp/);
  assert.match(multiline, /sd-ellipsis--line-clamp/);
});
