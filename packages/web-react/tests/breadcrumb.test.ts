import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Breadcrumb, BreadcrumbItem } from '../dist/index.js';

test('Breadcrumb SSR uses accumulated links, plain final content and labeled list semantics', () => {
  const html = renderToStaticMarkup(
    h(Breadcrumb, {
      routes: [
        { path: '/home', label: 'Home' },
        { path: 'last', label: 'Last' },
      ],
    }),
  );
  assert.match(html, /role="list" aria-label="面包屑"/);
  assert.match(html, /href="#\/home"/);
  assert.match(html, /<span>Last<\/span>/);
  assert.equal((html.match(/role="listitem"/g) ?? []).length, 2);
});
test('Breadcrumb counts fragment children and collapses only above maxCount plus one', () => {
  const items = ['A', 'B', 'C', 'D'].map((value) => h(BreadcrumbItem, { key: value }, value));
  const collapsed = renderToStaticMarkup(h(Breadcrumb, { maxCount: 2 }, h(Fragment, {}, items)));
  assert.equal((collapsed.match(/role="listitem"/g) ?? []).length, 3);
  assert.match(collapsed, /aria-label="更多面包屑项"/);
  const boundary = renderToStaticMarkup(h(Breadcrumb, { maxCount: 3 }, items));
  assert.equal((boundary.match(/role="listitem"/g) ?? []).length, 4);
  assert.doesNotMatch(boundary, /更多面包屑项/);
});
