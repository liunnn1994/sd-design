import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { InputLabel } from '../dist/_shared/input-label.js';
import { SelectView } from '../dist/_shared/select-view.js';
import { FormItemContext } from '../dist/form/context.js';
import { ConfigProvider } from '../dist/index.js';

const value = [{ value: 7, label: 'Seven', closable: true }];
test('SelectView inherits FormItem status once while the inner input remains uninjected', () => {
  const html = renderToStaticMarkup(
    h(
      FormItemContext.Provider,
      {
        value: {
          fieldId: 'selection',
          disabled: true,
          error: true,
          size: 'large',
          feedback: 'error',
          eventHandlers: {},
          updateValidateState() {},
        },
      },
      h(SelectView, { value, multiple: true, allowClear: true }),
    ),
  );
  assert.match(html, /sd-select-view-disabled/);
  assert.match(html, /sd-select-view-error/);
  assert.match(html, /sd-select-view-size-large/);
  assert.equal(html.match(/sd-feedback-icon-status-error/g)?.length, 1);
  assert.ok(!html.includes('sd-select-view-clear-btn'));
});
test('InputLabel SSR renders the selected label and search placeholder with native input attributes', () => {
  const html = renderToStaticMarkup(
    h(InputLabel, {
      value: value[0],
      enabledInput: true,
      formatLabel: (data) => `Selected ${data?.label}`,
      inputAttrs: { role: 'combobox', className: 'custom-input', style: { color: 'red' } },
    }),
  );
  assert.match(html, /sd-input-label-input-hidden custom-input/);
  assert.match(html, /placeholder="Selected Seven"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /color:red/);
  assert.match(html, /Selected Seven/);
});

test('SelectView SSR renders only its own clear control and resolves icon precedence', () => {
  const render = (props = {}) =>
    renderToStaticMarkup(
      h(
        ConfigProvider,
        { allowClear: true, size: 'small' },
        h(SelectView, { value, multiple: true, ...props }),
      ),
    );
  assert.ok(!render({ allowClear: false }).includes('sd-select-view-clear-btn'));
  assert.equal(render({ allowClear: true }).match(/class="sd-select-view-clear-btn"/g)?.length, 1);
  assert.match(render(), /sd-select-view-size-small/);
  assert.match(render({ opened: true }), /sd-icon-search/);
  assert.match(render({ opened: true, loading: true }), /sd-icon-loading/);
  assert.ok(!render({ opened: true, loading: true }).includes('sd-icon-search'));
  assert.ok(!render({ showArrow: false }).includes('sd-select-view-arrow-icon'));
  assert.match(render({ showArrow: false, arrowIcon: h('b', {}, 'Custom arrow') }), /Custom arrow/);
  assert.match(
    render({ renderLabel: (data) => h('b', {}, `Custom ${data.label}`) }),
    /Custom Seven/,
  );
});
