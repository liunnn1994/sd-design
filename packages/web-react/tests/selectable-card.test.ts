import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { SelectableCard, ConfigProvider } from '../dist/index.js';
test('SelectableCard SSR preserves controlled accessibility, zero values and sizing units', () => {
  const html = render(
    h(
      SelectableCard,
      {
        label: 'Plan',
        isSelected: true,
        isDisabled: true,
        value: 0,
        padding: 3,
        width: 240,
        maxWidth: '100%',
        variant: 'soft',
      },
      'Details',
    ),
  );
  assert.match(html, /aria-label="Plan"/);
  assert.match(html, /checked=""/);
  assert.match(html, /disabled=""/);
  assert.match(html, /data-selected="true"/);
  assert.match(html, /padding:12px;width:240px;max-width:100%/);
  assert.match(html, /sd-selectable-card-value">0</);
  assert.match(html, /sd-selectable-card-default">Details</);
});
test('SelectableCard SSR inherits prefixes, projects custom content and omits empty text sections', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(SelectableCard, {
        label: 'Custom',
        isSelected: false,
        title: h('strong', null, 'Title'),
        figure: h('span', null, 'Icon'),
        actions: h('button', null, 'Action'),
        description: '',
      }),
    ),
  );
  assert.match(html, /custom-selectable-card-title"><strong>Title/);
  assert.match(html, /custom-selectable-card-figure/);
  assert.match(html, /custom-selectable-card-actions/);
  assert.doesNotMatch(html, /custom-selectable-card-description/);
  assert.doesNotMatch(html, /checked=""/);
});
