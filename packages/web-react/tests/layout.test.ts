import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Layout } from '../dist/index.js';

test('Layout scans direct siders for SSR without leaking nested layout direction', () => {
  const direct = renderToStaticMarkup(h(Layout, {}, h(Layout.Sider, { scrollbar: false }, 'side')));
  assert.match(direct, /^<div class="sd-layout sd-layout-has-sider"/);
  const nested = renderToStaticMarkup(
    h(Layout, {}, h(Layout, {}, h(Layout.Sider, { scrollbar: false }))),
  );
  assert.match(nested, /^<div class="sd-layout"><div class="sd-layout sd-layout-has-sider"/);
  assert.match(
    renderToStaticMarkup(h(Layout, { hasSider: false }, h(Layout.Sider, { scrollbar: false }))),
    /^<div class="sd-layout"/,
  );
});

test('Sider renders reserved rail width and semantic layout regions', () => {
  const html = renderToStaticMarkup(
    h(
      Layout.Sider,
      { rail: true, railWidth: 64, width: 240, scrollbar: false },
      h(Layout.Content, {}, 'body'),
    ),
  );
  assert.match(html, /width:64px/);
  assert.match(html, /position:absolute/);
  assert.match(html, /<main class="sd-layout-content">body/);
});
