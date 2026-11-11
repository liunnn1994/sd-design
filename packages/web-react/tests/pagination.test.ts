import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { Pagination, ConfigProvider } from '../dist/index.js';
test('Pagination SSR uses the shared page window and accessible states', () => {
  const html = render(h(Pagination, { total: 200, defaultCurrent: 8 }));
  assert.match(html, /role="navigation"/);
  assert.match(html, /aria-current="page">8/);
  assert.equal((html.match(/pagination-item-ellipsis/g) ?? []).length, 2);
  assert.equal(render(h(Pagination, { total: 0, hideOnSinglePage: true })), '');
  assert.match(render(h(Pagination, { total: 0 })), /aria-disabled="true"/);
});
test('Pagination SSR inherits provider options and permits explicit local opt-out', () => {
  const html = render(
    h(
      ConfigProvider,
      { size: 'small', pagination: { showTotal: true, defaultPageSize: 20 } },
      h(Pagination, { total: 100, renderTotal: ({ total }) => `Rows ${total}` }),
    ),
  );
  assert.match(html, /pagination-size-small/);
  assert.match(html, /Rows 100/);
  assert.equal((html.match(/class="sd-pagination-item"/g) ?? []).length, 4);
  const local = render(
    h(
      ConfigProvider,
      { pagination: { showTotal: true } },
      h(Pagination, { total: 10, showTotal: false }),
    ),
  );
  assert.doesNotMatch(local, /pagination-total/);
});
test('Pagination SSR projects custom slots and the zero-page simple jumper', () => {
  const html = render(
    h(Pagination, { total: 0, simple: true, renderPageItemStep: ({ type }) => type }),
  );
  assert.match(html, />previous</);
  assert.match(html, />next</);
  assert.match(html, /pagination-jumper-total-page">0/);
  assert.match(html, /value="1"/);
});
