import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { QrCode, ConfigProvider } from '../dist/index.js';
test('QrCode SSR omits empty values and retains accessible canvas content without DOM encoding', () => {
  assert.equal(render(h(QrCode, { value: [] })), '');
  const html = render(
    h(QrCode, {
      value: ['A', 'B'],
      size: 200,
      bordered: false,
      icon: '/icon.svg',
      iconSize: { width: 20, height: 30 },
    }),
  );
  assert.match(html, /sd-qr-code-borderless/);
  assert.match(html, /width:200px;height:200px/);
  assert.match(html, /<canvas[^>]*role="img"/);
  assert.match(html, /二维码:A\nB/);
  assert.match(html, /width:20px;height:30px/);
});
test('QrCode SSR applies loading configuration, custom status priority and prefix inheritance', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom', qrCodeSpinProps: { tip: 'Global', dot: true } },
      h(QrCode, { value: 'code', status: 'loading', spinProps: { tip: 'Local' } }),
    ),
  );
  assert.match(html, /custom-qr-code-has-status/);
  assert.match(html, /custom-dot-loading/);
  assert.match(html, /Local/);
  assert.doesNotMatch(html, /Global/);
  const custom = render(
    h(QrCode, {
      value: 'code',
      status: 'expired',
      statusRender: () => h('strong', null, 'Render'),
      renderStatus: () => 'Slot',
    }),
  );
  assert.match(custom, /<strong>Render<\/strong>/);
  assert.doesNotMatch(custom, /Slot/);
});
