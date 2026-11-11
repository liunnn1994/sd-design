import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  Input,
  InputPassword,
  InputSearch,
  InputGroup,
  ConfigProvider,
  Form,
  FormItem,
} from '../dist/index.js';

test('Input SSR preserves compound exports, native attributes and form inheritance', () => {
  assert.equal(Input.Password, InputPassword);
  assert.equal(Input.Search, InputSearch);
  assert.equal(Input.Group, InputGroup);
  const html = renderToStaticMarkup(
    h(
      Form,
      { model: {}, disabled: true, size: 'small' },
      h(
        FormItem,
        { label: 'Name', validateStatus: 'error' },
        h(Input, {
          defaultValue: 'initial',
          inputAttrs: { 'name': 'name', 'aria-label': 'Native' },
        }),
      ),
    ),
  );
  assert.match(html, /value="initial"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /sd-input-size-small/);
  assert.match(html, /disabled=""/);
  assert.match(html, /name="name"/);
});

test('Input SSR resolves clear precedence, password masking and length errors', () => {
  const html = renderToStaticMarkup(
    h(
      ConfigProvider,
      { allowClear: true },
      h(Input, {
        defaultValue: 'abc',
        maxLength: { length: 2, errorOnly: true },
        showWordLimit: true,
      }),
      h(Input, { defaultValue: 'abc', allowClear: false }),
      h(InputPassword, { defaultValue: 'secret' }),
    ),
  );
  assert.equal((html.match(/sd-input-clear-btn/g) ?? []).length, 2);
  assert.match(html, /sd-input-word-limit">3\/2/);
  assert.match(html, /type="password"/);
  assert.match(html, /sd-input-error/);
});

test('InputPassword omits its suffix region when both the toggle and custom suffix are absent', () => {
  assert.doesNotMatch(
    renderToStaticMarkup(h(InputPassword, { invisibleButton: false })),
    /sd-input-suffix/,
  );
});

test('Input preserves numeric zero in every affix and Password custom suffix', () => {
  const html = renderToStaticMarkup(h(Input, { prepend: 0, append: 0, prefix: 0, suffix: 0 }));
  for (const name of ['prepend', 'append', 'prefix', 'suffix'])
    assert.match(html, new RegExp(`sd-input-${name}">0<`));
  assert.match(
    renderToStaticMarkup(h(InputPassword, { invisibleButton: false, suffix: 0 })),
    /sd-input-suffix">0</,
  );
});
