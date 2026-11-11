import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Textarea, Form, FormItem, ConfigProvider } from '../dist/index.js';
import TextareaDefault from '../dist/textarea/index.js';

test('Textarea SSR preserves multiline values, mirror content and native attributes', () => {
  assert.equal(TextareaDefault, Textarea);
  const html = renderToStaticMarkup(
    h(Textarea, {
      defaultValue: 'One\nTwo',
      autoSize: { minRows: 2 },
      suffix: 0,
      textareaAttrs: { rows: 3, name: 'notes' },
    }),
  );
  assert.match(html, /sd-textarea-mirror">One\nTwo\n<\/div>/);
  assert.match(html, /name="notes"/);
  assert.match(html, /rows="3"/);
  assert.match(html, /One\nTwo<\/textarea>0/);
});

test('Textarea SSR merges form errors and disabling and resolves global clear precedence', () => {
  const html = renderToStaticMarkup(
    h(
      Form,
      { model: {}, disabled: true },
      h(
        FormItem,
        { label: 'Notes', validateStatus: 'error' },
        h(Textarea, { defaultValue: 'abc', allowClear: true }),
      ),
    ),
  );
  assert.match(html, /disabled=""/);
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html, /sd-textarea-clear-btn/);
  const labelled = html.match(/for="([^"]+)"/)?.[1];
  assert.ok(labelled && html.includes(`id="${labelled}"`));
  const clear = renderToStaticMarkup(
    h(
      ConfigProvider,
      { allowClear: true },
      h(Textarea, { defaultValue: '😀a', maxLength: 2, showWordLimit: true }),
      h(Textarea, { defaultValue: 'locked', readonly: true }),
    ),
  );
  assert.equal((clear.match(/sd-textarea-clear-btn/g) ?? []).length, 1);
  assert.match(clear, /sd-textarea-word-limit">2\/2/);
});
