import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import Menu from '../dist/bloom-menu/index.js';
import { BloomMenu, ConfigProvider } from '../dist/index.js';
test('BloomMenu SSR exposes the public component and keeps popup browser work deferred', () => {
  assert.equal(Menu, BloomMenu);
  const html = render(h(BloomMenu, { items: [{ value: 0, label: 'Zero' }] }));
  assert.match(html, /data-bloom-menu-trigger=""/);
  assert.match(html, /Create/);
  assert.match(html, /aria-expanded="false"/);
  assert.doesNotMatch(html, /data-bloom-menu-panel/);
});
test('BloomMenu SSR preserves controlled state, native root attributes and custom trigger', () => {
  const html = render(
    h(BloomMenu, {
      items: [],
      modelValue: false,
      defaultOpen: true,
      id: 'menu',
      className: 'custom',
      renderTrigger: () => h('strong', {}, 'Actions'),
      buttonProps: { 'disabled': true, 'aria-label': 'Commands' },
    }),
  );
  assert.match(html, /id="menu"/);
  assert.match(html, /sd-bloom-menu custom/);
  assert.match(html, /<strong>Actions<\/strong>/);
  assert.match(html, /disabled=""/);
  assert.doesNotMatch(html, /sd-bloom-menu-open/);
});
test('BloomMenu SSR respects library prefix and default open state', () => {
  const html = render(
    h(ConfigProvider, { prefixCls: 'custom' }, h(BloomMenu, { items: [], defaultOpen: true })),
  );
  assert.match(html, /custom-bloom-menu-open/);
  assert.match(html, /aria-expanded="true"/);
});
