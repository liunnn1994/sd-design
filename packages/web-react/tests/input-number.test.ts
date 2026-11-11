import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { InputNumber, ConfigProvider, Form, FormItem } from '../dist/index.js';
import DefaultInputNumber from '../dist/input-number/index.js';

test('InputNumber SSR retains exact decimal strings, native attributes and zero affixes', () => {
  assert.equal(InputNumber, DefaultInputNumber);
  const html = renderToStaticMarkup(
    h(InputNumber, {
      defaultValue: '9007199254740993.125',
      stringMode: true,
      suffix: 0,
      inputAttrs: { name: 'amount' },
    }),
  );
  assert.match(html, /value="9007199254740993.125"/);
  assert.match(html, /aria-valuenow="9007199254740993.125"/);
  assert.match(html, /sd-input-number-suffix">0/);
  assert.match(html, /name="amount"/);
});
test('InputNumber SSR inherits provider and form states and renders both modes', () => {
  const html = renderToStaticMarkup(
    h(
      ConfigProvider,
      { size: 'small', allowClear: true },
      h(InputNumber, { defaultValue: 2, mode: 'button' }),
      h(
        Form,
        { model: {}, disabled: true },
        h(FormItem, { validateStatus: 'error' }, h(InputNumber, { defaultValue: 4 })),
      ),
    ),
  );
  assert.match(html, /sd-input-number-size-small/);
  assert.match(html, /sd-input-number-mode-button/);
  assert.match(html, /sd-input-clear-btn/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /disabled=""/);
});
