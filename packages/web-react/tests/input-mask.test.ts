import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  InputMask,
  inputMaskPresets,
  formatInputMask,
  defaultInputMaskFormatChars,
} from '../dist/index.js';
import DefaultInputMask from '../dist/input-mask/index.js';

test('InputMask SSR formats initial values and preserves native attributes and affixes', () => {
  assert.equal(InputMask, DefaultInputMask);
  const html = renderToStaticMarkup(
    h(InputMask, {
      preset: 'date',
      defaultValue: '20261107',
      inputAttrs: { inputMode: 'tel' },
      prepend: 'Date',
      suffix: 0,
    }),
  );
  assert.match(html, /value="2026-11-07"/);
  assert.match(html, /inputMode="tel"/);
  assert.match(html, /data-mask-preset="date"/);
  assert.match(html, /Date/);
  assert.match(html, />0<\/span>/);
  assert.ok(inputMaskPresets.email);
  assert.ok(defaultInputMaskFormatChars['9']);
  assert.equal(
    formatInputMask('1234', null, '99-99', { maskChar: '_', showMask: true }).value,
    '12-34',
  );
});
test('InputMask SSR displays full grapheme placeholders and omits managed word limits', () => {
  const html = renderToStaticMarkup(
    h(InputMask, {
      mask: '99',
      maskChar: '😀',
      alwaysShowMask: true,
      maxLength: 1,
      showWordLimit: true,
    }),
  );
  assert.match(html, /value="😀😀"/);
  assert.doesNotMatch(html, /sd-input-word-limit/);
});
