import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Popover } from '../dist/index.js';

test('popover is SSR safe and supplies popup semantics on the original trigger', () => {
  const html = renderToStaticMarkup(
    createElement(Popover, {
      title: 'Title',
      content: 'Content',
      children: createElement('button', null, 'Open'),
    }),
  );
  assert.match(html, /aria-haspopup="true"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, />Open<\/button>/);
  assert.doesNotMatch(html, /Title|Content/);
});
