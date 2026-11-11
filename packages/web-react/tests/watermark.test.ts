import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Watermark } from '../dist/index.js';
import WatermarkDefault from '../dist/watermark/index.js';

test('Watermark SSR renders content and root styles without accessing browser canvas', () => {
  assert.equal(Watermark, WatermarkDefault);
  const html = renderToStaticMarkup(
    h(
      Watermark,
      { content: 'Private', className: 'custom', style: { height: 200 }, id: 'mark' },
      h('button', {}, 'Action'),
    ),
  );
  assert.match(html, /sd-watermark custom/);
  assert.match(html, /position:relative;overflow:hidden;height:200px/);
  assert.match(html, /<button>Action<\/button>/);
  assert.doesNotMatch(html, /data:image|Private/);
});
