import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Switch } from '../dist/index.js';

test('switch renders checked custom values and busy semantics', () => {
  const html = renderToStaticMarkup(
    createElement(Switch, {
      value: 'yes',
      checkedValue: 'yes',
      uncheckedValue: 'no',
      loading: true,
    }),
  );
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /aria-busy="true"/);
});

test('small and line switches omit text', () => {
  for (const props of [{ size: 'small' as const }, { type: 'line' as const }]) {
    const html = renderToStaticMarkup(
      createElement(Switch, { ...props, checkedText: '开启', defaultChecked: true }),
    );
    assert.doesNotMatch(html, /开启/);
    assert.match(html, /aria-checked="true"/);
  }
});

test('switch renders numeric zero content inside its text slots and omits empty strings', () => {
  for (const label of [0, 0n]) {
    for (const value of [false, true]) {
      const html = renderToStaticMarkup(
        createElement(Switch, { value, checkedText: label, uncheckedText: label }),
      );
      assert.match(html, /class="sd-switch-text-holder">0<\/span>/);
      assert.match(html, /class="sd-switch-text">0<\/span>/);
    }
  }
  const empty = renderToStaticMarkup(createElement(Switch, { checkedText: '', uncheckedText: '' }));
  assert.doesNotMatch(empty, /sd-switch-text/);
});
