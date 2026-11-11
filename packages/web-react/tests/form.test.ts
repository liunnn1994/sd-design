import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import FormDefault from '../dist/form/index.js';
import { Form, FormItem, Button, Switch } from '../dist/index.js';

test('Form SSR shares layout and disabled context and associates labels with controls', () => {
  assert.equal(FormDefault, Form);
  assert.equal(Form.Item, FormItem);
  const html = renderToStaticMarkup(
    h(
      Form,
      { model: { agree: false }, size: 'small', disabled: true, id: 'example' },
      h(
        FormItem,
        { field: 'agree', label: 'Agree', required: true, showColon: true, help: 'Help' },
        h(Switch, { disabled: false }),
        h(Button, { disabled: false }, 'Save'),
      ),
    ),
  );
  assert.match(html, /sd-form-layout-horizontal sd-form-size-small/);
  assert.match(html, /id="example-agree"/);
  assert.match(html, /sd-form-item-label-required-symbol/);
  assert.match(html, /sd-form-item-message-help/);
  assert.match(html, /sd-btn-size-small/);
  assert.equal((html.match(/disabled=""/g) ?? []).length, 2);
  const controlId = html.match(/for="([^"]+)"/)?.[1];
  assert.ok(controlId);
  assert.ok(html.includes(`id="${controlId}"`));
});

test('FormItem noStyle forwards context without a wrapper, with explicit item overrides', () => {
  const html = renderToStaticMarkup(
    h(
      Form,
      { model: {}, disabled: true, size: 'large' },
      h(FormItem, { noStyle: true, disabled: false }, h(Button, {}, 'Enabled')),
    ),
  );
  assert.doesNotMatch(html, /sd-form-item|disabled=""/);
  assert.match(html, /sd-btn-size-large/);
});
