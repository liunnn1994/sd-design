import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Timeline, TimelineItem } from '../dist/index.js';

test('Timeline SSR preserves configured direction, custom dots and relative labels', () => {
  const html = renderToStaticMarkup(
    h(
      Timeline,
      { direction: 'horizontal', mode: 'alternate', reverse: true, labelPosition: 'relative' },
      h(TimelineItem, { position: 'bottom', dot: h('b', {}, '*'), label: 'date' }, 'body'),
    ),
  );
  assert.match(html, /sd-timeline-is-reverse/);
  assert.match(html, /sd-timeline-item-horizontal-bottom/);
  assert.match(html, /sd-timeline-item-dot-custom/);
  assert.match(html, /sd-timeline-item-label">date/);
});
test('Timeline custom pending content creates a pending node even with pending false', () => {
  const html = renderToStaticMarkup(
    h(Timeline, { pending: false, pendingContent: 'Pending', dot: 'custom' }),
  );
  assert.match(html, /role="listitem"/);
  assert.match(html, /border-left-style:dashed/);
  assert.match(html, /Pending/);
});
