import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ConfigProvider, Button, Divider, Space } from '../dist/index.js';

test('nested configuration inherits prefix and overrides size', () => {
  const html = renderToStaticMarkup(
    createElement(
      ConfigProvider,
      { prefixCls: 'custom', size: 'large', rtl: true },
      createElement(
        ConfigProvider,
        { size: 'small' },
        createElement(Button, null, '保存'),
        createElement(Divider, { orientation: 'left' }, '标题'),
        createElement(Space, null, '内容'),
      ),
    ),
  );
  assert.match(html, /custom-btn-size-small/);
  assert.match(html, /custom-divider-text-left/);
  assert.match(html, /custom-space-rtl/);
  assert.doesNotMatch(html, /sd-btn|sd-divider|sd-space/);
});

test('configuration forwards native attributes only to its own local theme container', () => {
  const html = renderToStaticMarkup(
    createElement(
      ConfigProvider,
      {
        'themeMode': 'dark',
        'prefixCls': 'custom',
        'size': 'small',
        'className': 'provider-root',
        'id': 'provider-root',
        'style': { padding: 3 },
        'data-provider': 'outer',
        'aria-label': 'Local theme',
      },
      createElement(
        ConfigProvider,
        {
          themeMode: 'light',
          id: 'inner-provider',
        },
        createElement(Button, null, 'Save'),
      ),
    ),
  );
  assert.match(html, /class="custom-theme-provider provider-root"/);
  assert.match(html, /id="provider-root"/);
  assert.match(html, /style="padding:3px"/);
  assert.match(html, /data-provider="outer"/);
  assert.match(html, /aria-label="Local theme"/);
  assert.match(html, /id="inner-provider" class="custom-theme-provider"/);
  assert.match(html, /custom-btn-size-small/);
  assert.doesNotMatch(html, /prefixCls=|size="small"/);
});
