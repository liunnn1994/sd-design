import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import DefaultCheckbox from '../dist/checkbox/index.js';
import {
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  ConfigProvider,
  Form,
  FormItem,
} from '../dist/index.js';
import DefaultRadio from '../dist/radio/index.js';

test('Checkbox SSR stays valid inside a paragraph and retains the indicator class', () => {
  const html = renderToStaticMarkup(h('p', null, h(Checkbox, { modelValue: true })));
  assert.match(html, /<span class="sd-checkbox-icon">/);
  assert.doesNotMatch(html, /<div/);
});

test('choice exports and SSR preserve false and zero values and group limits', () => {
  assert.equal(Checkbox, DefaultCheckbox);
  assert.equal(Checkbox.Group, CheckboxGroup);
  assert.equal(Radio, DefaultRadio);
  assert.equal(Radio.Group, RadioGroup);
  const html = renderToStaticMarkup(h(CheckboxGroup, { value: [0], max: 1, options: [0, 'next'] }));
  assert.match(html, /value="0"/);
  assert.match(html, /checked=""/);
  assert.equal((html.match(/disabled=""/g) ?? []).length, 1);
  const radio = renderToStaticMarkup(
    h(
      RadioGroup,
      { value: false },
      h(Radio, { value: false }, 'False'),
      h(Radio, { value: true }, 'True'),
    ),
  );
  assert.equal((radio.match(/checked=""/g) ?? []).length, 1);
  assert.match(radio, /value="false"/);
});
test('choice SSR inherits form disabled and provider size and renders custom content', () => {
  const html = renderToStaticMarkup(
    h(
      ConfigProvider,
      { size: 'small' },
      h(
        Form,
        { model: {}, disabled: true },
        h(FormItem, {}, h(RadioGroup, { type: 'button', options: [0, 1] })),
        h(
          FormItem,
          {},
          h(CheckboxGroup, {
            value: [0],
            options: [{ value: 0, label: () => 'Zero' }],
            renderCheckbox: ({ checked, disabled }) => `${checked}:${disabled}`,
          }),
        ),
      ),
    ),
  );
  assert.match(html, /sd-radio-group-size-small/);
  assert.match(html, /sd-radio-button/);
  assert.match(html, /true:true/);
  assert.match(html, /Zero/);
});
test('independent choices ignore outer groups and keep standalone model values', () => {
  const html = renderToStaticMarkup(
    h(
      CheckboxGroup,
      { value: [], disabled: true },
      h(Checkbox, { defaultChecked: true, uninjectGroupContext: true }, 'Independent'),
    ),
  );
  assert.match(html, /checked=""/);
  assert.doesNotMatch(html, /disabled=""/);
  const customRadio = renderToStaticMarkup(
    h(
      Radio,
      { modelValue: 0, value: 0, renderRadio: ({ checked }) => h('b', null, String(checked)) },
      'Hidden default label',
    ),
  );
  assert.match(customRadio, /<b>true<\/b>/);
  assert.doesNotMatch(customRadio, /Hidden default label/);
});
