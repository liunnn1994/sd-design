import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Button, ButtonGroup } from '../dist/index.js';

test('button group supplies defaults and enforces group disabled state', () => {
  assert.equal(Button.Group, ButtonGroup);
  const html = renderToStaticMarkup(
    createElement(
      ButtonGroup,
      { type: 'primary', disabled: true },
      createElement(Button, { disabled: false }, '保存'),
    ),
  );
  assert.match(html, /sd-btn-primary/);
  assert.match(html, /disabled=""/);
  assert.match(html, /type="button"/);
});

test('loading links cannot navigate and retain accessible icon-only text', () => {
  const html = renderToStaticMarkup(
    createElement(Button, { href: '/target', loading: true, srOnly: '保存' }),
  );
  assert.doesNotMatch(html, /href=/);
  assert.match(html, /sd-btn-sr-only/);
  assert.match(html, /保存/);
});
