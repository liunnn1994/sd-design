import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { InputTag, ConfigProvider } from '../dist/index.js';
import DefaultInputTag from '../dist/input-tag/index.js';

test('InputTag SSR preserves defaults, mapped tags, overflow and input attributes', () => {
  assert.equal(InputTag, DefaultInputTag);
  const html = renderToStaticMarkup(
    h(InputTag, {
      defaultValue: ['one', 'two', 'three'],
      maxTagCount: 1,
      defaultInputValue: 'draft',
      name: 'labels',
    }),
  );
  assert.match(html, /one/);
  assert.match(html, /\+2/);
  assert.match(html, /value="draft"/);
  assert.match(html, /name="labels"/);
  assert.ok(!html.includes('>two<'));
  const mapped = renderToStaticMarkup(
    h(InputTag, {
      value: [{ id: 7, title: 'Mapped', remove: false }],
      fieldNames: { value: 'id', label: 'title', closable: 'remove' },
    }),
  );
  assert.match(mapped, /Mapped/);
  assert.ok(!mapped.includes('sd-tag-close-btn'));
});

test('InputTag SSR respects provider clear defaults, explicit opt-out and readonly', () => {
  const render = (props = {}) =>
    renderToStaticMarkup(
      h(
        ConfigProvider,
        { size: 'small', allowClear: true },
        h(InputTag, { defaultValue: ['one'], ...props }),
      ),
    );
  assert.match(render(), /sd-input-tag-size-small/);
  assert.match(render(), /sd-input-tag-clear-btn/);
  assert.ok(!render({ allowClear: false }).includes('sd-input-tag-clear-btn'));
  assert.ok(!render({ readonly: true }).includes('sd-input-tag-clear-btn'));
  assert.ok(!render({ readonly: true }).includes('sd-tag-close-btn'));
});
