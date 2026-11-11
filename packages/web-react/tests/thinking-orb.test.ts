import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { ThinkingOrb, ConfigProvider } from '../dist/index.js';
import Orb from '../dist/thinking-orb/index.js';
test('ThinkingOrb SSR exposes accessible state, defaults and its subpath export', () => {
  assert.equal(Orb, ThinkingOrb);
  const html = render(h(ThinkingOrb));
  assert.match(html, /<canvas[^>]*role="img"/);
  assert.match(html, /aria-label="正在工作"/);
  assert.match(html, /data-state="working"/);
  assert.match(html, /width:64px;height:64px/);
});
test('ThinkingOrb SSR preserves native overrides, prefix, theme and invalid-size normalization', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(ThinkingOrb, {
        'size': 32 as 64,
        'theme': 'dark',
        'state': 'solving',
        'paused': true,
        'className': 'extra',
        'aria-label': 'Reasoning',
        'style': { width: 90 },
      }),
    ),
  );
  assert.match(html, /custom-thinking-orb extra/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /data-state="solving"/);
  assert.match(html, /aria-label="Reasoning"/);
  assert.match(html, /width:90px;height:64px/);
  assert.doesNotMatch(html, /paused=/);
});
