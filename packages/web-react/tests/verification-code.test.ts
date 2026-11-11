import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { VerificationCode, Form, FormItem } from '../dist/index.js';
import DefaultVerificationCode from '../dist/verification-code/index.js';

test('VerificationCode SSR preserves cells, mask, separators and accessible labels', () => {
  assert.equal(DefaultVerificationCode, VerificationCode);
  const html = renderToStaticMarkup(
    h(VerificationCode, {
      defaultValue: '123',
      length: 4,
      masked: true,
      size: 'small',
      error: true,
      separator: (index) => h('b', {}, String(index)),
    }),
  );
  assert.match(html, /role="group"/);
  assert.equal((html.match(/type="password"/g) ?? []).length, 4);
  assert.equal((html.match(/<b>/g) ?? []).length, 4);
  assert.equal((html.match(/aria-label=/g) ?? []).length, 5);
  assert.match(html, /value="3"/);
  assert.match(html, /sd-input-error/);
});

test('VerificationCode SSR composes FormItem disabled state and readonly inputs', () => {
  const html = renderToStaticMarkup(
    h(
      Form,
      { model: {}, disabled: true },
      h(FormItem, {}, h(VerificationCode, { readonly: true, length: 3 })),
    ),
  );
  assert.equal((html.match(/disabled=""/g) ?? []).length, 3);
  assert.equal((html.match(/readOnly=""/g) ?? []).length, 3);
});
