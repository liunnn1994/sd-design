import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Popconfirm } from '../dist/index.js';

test('popconfirm renders dialog trigger semantics without starting confirmation during SSR', () => {
  let calls = 0;
  const html = renderToStaticMarkup(
    createElement(Popconfirm, {
      content: 'Confirm action',
      onBeforeOk: () => {
        calls++;
        return true;
      },
      children: createElement('button', null, 'Open'),
    }),
  );
  assert.match(html, /aria-haspopup="dialog"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, />Open<\/button>/);
  assert.doesNotMatch(html, /Confirm action/);
  assert.equal(calls, 0);
});
