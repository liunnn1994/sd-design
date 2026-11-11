import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import AnchorDefault from '../dist/anchor/index.js';
import { Anchor, AnchorLink } from '../dist/index.js';

test('Anchor exports compound links and renders accessible nested navigation on the server', () => {
  assert.equal(Anchor, AnchorDefault);
  assert.equal(Anchor.Link, AnchorLink);
  const html = renderToStaticMarkup(
    h(
      Anchor,
      { direction: 'horizontal', lineLess: true, className: 'outer' },
      h(
        AnchorLink,
        {
          href: '#first',
          title: 'First',
          sublist: h(AnchorLink, { href: '#nested', title: 'Nested' }),
        },
        'Custom',
      ),
    ),
  );
  assert.match(html, /^<div class="outer"><div role="navigation"/);
  assert.match(html, /sd-anchor-line-less sd-anchor-horizontal/);
  assert.match(html, /href="#first">Custom/);
  assert.match(html, /sd-anchor-sublist/);
  assert.match(html, /href="#nested">Nested/);
  assert.doesNotMatch(html, /aria-current|line-slider|scrollContainer/);
});

test('Anchor affix wrapper receives native styles and keeps the line slider', () => {
  const html = renderToStaticMarkup(
    h(
      Anchor,
      {
        'affix': true,
        'affixStyle': { width: 200 },
        'style': { width: 240 },
        'aria-label': 'Outline',
      },
      h(AnchorLink, { title: 'No target' }),
    ),
  );
  assert.match(html, /^<div style="width:240px" aria-label="Outline">/);
  assert.match(html, /sd-anchor-line-slider/);
  assert.match(html, /No target/);
});
