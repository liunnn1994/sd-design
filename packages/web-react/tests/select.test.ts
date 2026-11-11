import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Select, ConfigProvider, Form, FormItem } from '../dist/index.js';
import { SelectDropdown } from '../dist/select/dropdown.js';

test('Select SSR preserves typed values, fallback labels and combobox attributes', () => {
  const html = renderToStaticMarkup(
    h(Select, {
      value: 0,
      options: [{ value: 0, label: 'Zero' }],
      inputAttrs: { 'aria-label': 'Selection' },
    }),
  );
  assert.match(html, /Zero/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /aria-label="Selection"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(renderToStaticMarkup(h(Select, { value: 'missing' })), /missing/);
  assert.ok(
    !renderToStaticMarkup(h(Select, { value: 'missing', fallbackOption: false })).includes(
      'missing',
    ),
  );
});

test('Select SSR projects raw custom fields and inherits form status once', () => {
  const html = renderToStaticMarkup(
    h(
      ConfigProvider,
      { size: 'small' },
      h(
        Form,
        { disabled: true, model: {} },
        h(
          FormItem,
          { field: 'choice', validateStatus: 'error' },
          h(Select, {
            value: { id: 2 },
            valueKey: 'id',
            options: [{ code: { id: 2 }, name: 'Two' }],
            fieldNames: { value: 'code', label: 'name' },
            renderLabel: (data) => `Raw ${data.name}`,
          }),
        ),
      ),
    ),
  );
  assert.match(html, /Raw Two/);
  assert.match(html, /sd-select-view-disabled/);
  assert.match(html, /sd-select-view-size-small/);
  assert.ok(!html.includes('sd-select-view-clear-btn'));
});

test('Select dropdown SSR resolves empty slots, provider context and header/footer gates', () => {
  const render = (extra = {}) =>
    renderToStaticMarkup(
      h(
        ConfigProvider,
        { renderEmpty: ({ component }) => h('b', {}, `Empty ${component}`) },
        h(SelectDropdown, { empty: true, header: 'Header', footer: 'Footer', ...extra }),
      ),
    );
  assert.match(render(), /Empty select/);
  assert.ok(!render().includes('>Header<'));
  assert.match(render({ showHeaderOnEmpty: true, showFooterOnEmpty: true }), />Header</);
  assert.match(render({ emptyContent: 'Local empty' }), /Local empty/);
});

test('Select respects an explicitly empty custom label and preserves dropdown scrollbar attributes', () => {
  const html = renderToStaticMarkup(
    h(Select, {
      value: 1,
      options: [{ value: 1, label: 'Hidden label' }],
      renderLabel: () => null,
    }),
  );
  assert.ok(!html.includes('>Hidden label<'));
  const dropdown = renderToStaticMarkup(
    h(SelectDropdown, { scrollbar: { className: 'custom-scroll', style: { width: 240 } } }),
  );
  assert.match(dropdown, /custom-scroll/);
  assert.match(dropdown, /width:240px/);
});
