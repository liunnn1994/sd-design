import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { LiquidGlassLogo, ConfigProvider } from '../dist/index.js';
import Logo from '../dist/liquid-glass-logo/index.js';
test('LiquidGlassLogo root and subpath expose the same shared presets as Vue', async () => {
  const root = await import('@sdata/web-react');
  const entry = await import('@sdata/web-react/liquid-glass-logo');
  const core = await import('@sdata/web-core/liquid-glass-logo/foundation');
  for (const name of [
    'liquidGlassLogoDefaults',
    'liquidGlassLogoDuration',
    'liquidGlassLogoThemes',
    'liquidGlassLogoNoteLogo',
    'liquidGlassLogoReferenceMark',
  ] as const) {
    assert.equal(root[name], core[name]);
    assert.equal(entry[name], core[name]);
  }
});
test('LiquidGlassLogo SSR exposes an accessible canvas and leaves GPU initialization to the client', () => {
  assert.equal(Logo, LiquidGlassLogo);
  const html = render(h(LiquidGlassLogo));
  assert.match(html, /role="img" aria-label="Logo"/);
  assert.match(html, /data-liquid-glass-theme="light"/);
  assert.match(html, /<canvas aria-hidden="true"><\/canvas>/);
  assert.doesNotMatch(html, /data-liquid-glass-ready|data-liquid-glass-fallback/);
});
test('LiquidGlassLogo SSR keeps native overrides, explicit dimensions, theme and background clamps', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(LiquidGlassLogo, {
        'ending': 'wordmark',
        'text': 'SD',
        'theme': 'dark',
        'height': 20,
        'backgroundImage': '/brand.png',
        'backgroundX': 300,
        'backgroundScale': 9,
        'backgroundTintOpacity': -1,
        'className': 'brand',
        'aria-label': 'Brand',
        'style': { width: 180 },
      }),
    ),
  );
  assert.match(html, /aria-label="Brand"/);
  assert.match(html, /custom-liquid-glass-logo brand/);
  assert.match(html, /height:20px/);
  assert.match(html, /width:180px/);
  assert.match(html, /translate\(100%, 0%\) scale\(3\)/);
  assert.match(html, /opacity:0/);
  assert.doesNotMatch(html, /backgroundImage=|maxDpr=|autoWidth=/);
});
