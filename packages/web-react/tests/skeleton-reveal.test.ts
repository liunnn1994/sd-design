import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import { SkeletonReveal, ConfigProvider } from '../dist/index.js';
test('SkeletonReveal SSR preserves real content and emits the pending autoplay outline', () => {
  const html = render(
    h(SkeletonReveal, { 'aria-label': 'Preview' }, h('input', { defaultValue: 'draft' })),
  );
  assert.match(html, /data-state="idle" data-autoplay="true"/);
  assert.match(html, /value="draft"/);
  assert.match(html, /data-reveal-initial="true" aria-hidden="true" focusable="false"/);
  assert.match(html, /aria-label="Preview"/);
});
test('SkeletonReveal SSR respects non-autoplay, disabled, zero duration and prefix', () => {
  for (const props of [{ autoplay: false }, { disabled: true }, { duration: 0 }]) {
    const html = render(
      h(ConfigProvider, { prefixCls: 'custom' }, h(SkeletonReveal, props, 'Visible')),
    );
    assert.match(html, /custom-skeleton-reveal-content/);
    assert.match(html, /data-autoplay="false"/);
    assert.doesNotMatch(html, /data-reveal-initial/);
    assert.match(html, /Visible/);
  }
});
