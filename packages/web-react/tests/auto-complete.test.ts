import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { AutoComplete, ConfigProvider, Form, FormItem } from '../dist/index.js';
test('AutoComplete SSR projects input contracts and controlled alias precedence', () => {
  const html = render(
    h(AutoComplete, {
      value: 'fallback',
      modelValue: 'chosen',
      data: ['chosen'],
      inputAttrs: { 'aria-label': 'Suggestion' },
    }),
  );
  assert.match(html, /value="chosen"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-label="Suggestion"/);
  assert.match(render(h(AutoComplete, { defaultValue: 'initial' })), /value="initial"/);
});
test('AutoComplete SSR inherits form size and disabled state and provider clearing', () => {
  const html = render(
    h(
      ConfigProvider,
      { allowClear: true },
      h(
        Form,
        { model: {}, disabled: true, size: 'small' },
        h(FormItem, { field: 'name' }, h(AutoComplete, { defaultValue: 'text' })),
      ),
    ),
  );
  assert.match(html, /sd-input-size-small/);
  assert.match(html, /disabled=""/);
  assert.match(
    render(h(ConfigProvider, { allowClear: true }, h(AutoComplete, { defaultValue: 'text' }))),
    /sd-input-clear-btn/,
  );
  assert.doesNotMatch(
    render(
      h(
        ConfigProvider,
        { allowClear: true },
        h(AutoComplete, { defaultValue: 'text', allowClear: false }),
      ),
    ),
    /sd-input-clear-btn/,
  );
});
