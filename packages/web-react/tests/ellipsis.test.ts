import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  Ellipsis,
  PerformantEllipsis,
  RichLineClamp,
  LineClamp,
  InlineClamp,
} from '../dist/index.js';

test('inline clamp renders split prefix, body and suffix without hiding SSR content', () => {
  const html = renderToStaticMarkup(
    createElement(InlineClamp, {
      text: '/docs/Report.pdf',
      split: () => ({ start: '/docs/', body: 'Report', end: '.pdf' }),
    }),
  );
  assert.match(html, /data-part="start">\/docs\//);
  assert.match(html, /data-part="body">Report/);
  assert.match(html, /data-part="end">\.pdf/);
  assert.doesNotMatch(html, /aria-hidden/);
});

test('rich clamp retains trusted markup and omits empty render affixes in SSR', () => {
  const html = renderToStaticMarkup(
    createElement(RichLineClamp, {
      html: '<strong>Rich content</strong>',
      maxLines: 2,
      before: () => null,
      after: () => false,
    }),
  );
  assert.match(html, /<strong>Rich content<\/strong>/);
  assert.doesNotMatch(html, /data-part="(?:before|after)"/);
});

test('lazy ellipsis omits measurement until activation while retaining keyboard entry', () => {
  const html = renderToStaticMarkup(
    createElement(
      PerformantEllipsis,
      {
        lineClamp: 2,
        expandTrigger: 'click',
        tooltipContent: 'Custom tooltip',
      },
      'Visible content',
    ),
  );
  assert.match(html, /role="button"/);
  assert.match(html, /tabindex="0"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /Visible content/);
  assert.doesNotMatch(html, /data-ellipsis-measure|tooltipContent|Custom tooltip/);
});

test('ellipsis measurement is hidden from assistive technology in SSR', () => {
  const html = renderToStaticMarkup(createElement(Ellipsis, null, 'Content'));
  assert.match(html, /data-ellipsis-measure="true" aria-hidden="true" inert=""/);
  assert.match(html, /sd-ellipsis-content/);
});

test('line clamp escapes plain text, retains the full source in SSR and renders affix state', () => {
  const html = renderToStaticMarkup(
    createElement(LineClamp, {
      as: 'section',
      text: '<b>plain</b>',
      maxLines: 2,
      location: 'middle',
      before: ({ expanded }) => (expanded ? 'Expanded' : 'Collapsed'),
      after: () => null,
    }),
  );
  assert.match(html, /^<section/);
  assert.match(html, /&lt;b&gt;plain&lt;\/b&gt;/);
  assert.match(html, /data-part="before"/);
  assert.match(html, /Collapsed/);
  assert.doesNotMatch(html, /data-part="after"/);
});
