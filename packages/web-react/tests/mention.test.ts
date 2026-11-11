import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { Mention, ConfigProvider } from '../dist/index.js';
test('Mention SSR preserves text, input semantics and slot content without a popup', () => {
  const html = render(
    h(Mention, { defaultValue: '@Alice', data: ['Alice'], prefixContent: 'To', suffix: 'End' }),
  );
  assert.match(html, /value="@Alice"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /To/);
  assert.match(html, /End/);
  assert.doesNotMatch(html, /role="option"/);
});
test('Mention SSR textarea inherits prefixes and readonly state without browser measurement', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(Mention, { type: 'textarea', defaultValue: 'Draft', readonly: 'Locked', fitWidth: true }),
    ),
  );
  assert.match(html, /custom-mention-fit-width/);
  assert.match(html, /<textarea[^>]*readOnly=""[^>]*>Draft<\/textarea>/);
  assert.doesNotMatch(html, /custom-mention-measure/);
});
