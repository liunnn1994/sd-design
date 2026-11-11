import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import BackTopDefault from '../dist/back-top/index.js';
import { BackTop } from '../dist/index.js';

test('BackTop exports one implementation and stays hidden until browser measurement', () => {
  assert.equal(BackTopDefault, BackTop);
  assert.equal(renderToStaticMarkup(h(BackTop, { visibleHeight: 0 }, 'Top')), '');
});
