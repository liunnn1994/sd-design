import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Trigger } from '../dist/index.js';

test('trigger renders its reference without accessing the DOM on the server', () => {
  const html = renderToStaticMarkup(
    createElement(Trigger, {
      content: '客户端弹层',
      defaultPopupVisible: true,
      ariaHasPopup: 'dialog',
      openedClass: 'opened',
      children: createElement('button', { className: 'original' }, '打开'),
    }),
  );
  assert.match(html, /class="original opened"/);
  assert.match(html, /aria-expanded="true"/);
  assert.doesNotMatch(html, /客户端弹层/);
});

test('trigger preserves an existing accessible description when closed', () => {
  const html = renderToStaticMarkup(
    createElement(Trigger, {
      content: '说明',
      ariaDescribedbyPopup: true,
      children: createElement('button', { 'aria-describedby': 'existing' }, '打开'),
    }),
  );
  assert.match(html, /aria-describedby="existing"/);
});

test('a single-child fragment keeps its child as the accessible trigger', () => {
  const html = renderToStaticMarkup(
    createElement(Trigger, {
      ariaHasPopup: 'dialog',
      defaultPopupVisible: true,
      children: createElement(Fragment, null, createElement('button', null, '打开')),
    }),
  );
  assert.match(html, /<button[^>]*aria-expanded="true"/);
  assert.doesNotMatch(html, /<span/);
});
