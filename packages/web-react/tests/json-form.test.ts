import { JsonForm as RootJsonForm } from '@sdata/web-react';
import JsonFormDefault, {
  JsonForm,
  defineJsonFormComponents,
  defineJsonFormSchemas,
} from '@sdata/web-react/json-form';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { getJsonFormSlotProp } from '../dist/json-form/slots.js';

test('JsonForm public entries and schema helpers preserve identity', () => {
  assert.equal(RootJsonForm, JsonForm);
  assert.equal(JsonFormDefault, JsonForm);
  const components = { custom: () => h('span', null, 'Custom') };
  assert.equal(defineJsonFormComponents(components), components);
  const schemas = [{ field: 'custom', type: 'custom' as const }];
  assert.equal(defineJsonFormSchemas<typeof components>()(schemas), schemas);
});

test('JsonForm SSR resolves nested built-in fields and row layout', () => {
  const html = render(
    h(JsonForm, {
      model: { user: { name: 'Ada' } },
      schemas: [
        {
          field: 'layout',
          type: 'row',
          children: [
            { field: 'user.name', type: 'input', label: 'Name', required: true, span: 12 },
          ],
        },
      ],
    }),
  );
  assert.match(html, /sd-json-form--default/);
  assert.match(html, /sd-json-form-row/);
  assert.match(html, /value="Ada"/);
  assert.match(html, /Name/);
});

test('JsonForm manual content overrides schema controls during SSR', () => {
  const html = render(
    h(JsonForm, { schemas: [{ field: 'name', label: 'Generated' }] }, h('p', null, 'Manual')),
  );
  assert.match(html, /Manual/);
  assert.doesNotMatch(html, /Generated|<input/);
});

test('JsonForm scoped slot aliases retain Vue scope objects and React renderer identity', () => {
  const identity = (value: unknown) => value as null;
  const invoke = (type: string, name: string, args: unknown[], expected: unknown, prop: string) => {
    let scope: unknown;
    const [key, callback] = getJsonFormSlotProp(type, name, (value: unknown) => {
      scope = value;
      return null;
    });
    assert.equal(key, prop);
    assert.equal(typeof callback, 'function');
    (callback as (...args: unknown[]) => unknown)(...args);
    assert.deepEqual(scope, expected);
  };
  const option = { label: 'Paris', value: 'paris' };
  invoke('select', 'option', [option], { data: option }, 'renderOption');
  invoke('radioGroup', 'label', [option], { data: option }, 'renderLabel');
  invoke('rate', 'character', [2], { index: 2 }, 'renderCharacter');
  const date = new Date(2026, 10, 8);
  invoke('rangePicker', 'cell', [date, 'end'], { date, type: 'end' }, 'renderCell');
  invoke('transfer', 'source-title', [option], option, 'renderSourceTitle');
  assert.deepEqual(getJsonFormSlotProp('select', 'renderOption', identity), [
    'renderOption',
    identity,
  ]);
  assert.deepEqual(
    getJsonFormSlotProp('input', 'prefix', () => 'Prefix'),
    ['prefix', 'Prefix'],
  );
  assert.deepEqual(getJsonFormSlotProp('inputSearch', 'button-icon', 'Icon'), [
    'buttonIcon',
    'Icon',
  ]);
  assert.deepEqual(getJsonFormSlotProp('constructor', 'prefix', 'Prefix'), ['prefix', 'Prefix']);
});
