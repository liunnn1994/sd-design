import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

import { Drawer } from '../dist/index.js';

test('Drawer defers portal and dialog rendering until mounted in the browser', () => {
  assert.equal(
    renderToString(createElement(Drawer, { defaultVisible: true, title: 'SSR' }, 'body')),
    '',
  );
});
