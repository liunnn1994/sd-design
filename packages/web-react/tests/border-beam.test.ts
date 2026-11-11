import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup as render } from 'react-dom/server';

import Beam from '../dist/border-beam/index.js';
import { BorderBeam, ConfigProvider } from '../dist/index.js';
test('BorderBeam SSR preserves native content and active state without DOM style injection', () => {
  assert.equal(Beam, BorderBeam);
  const html = render(h(BorderBeam, {}, h('button', {}, 'Action')));
  assert.match(html, /data-active=""/);
  assert.match(html, /data-beam="bb-react-/);
  assert.match(html, /data-beam-bloom=""/);
  assert.match(html, /<button>Action<\/button>/);
  assert.doesNotMatch(html, /<style|<svg/);
});
test('BorderBeam SSR supports inactive state, clamped variables, prefix and native overrides', () => {
  const html = render(
    h(
      ConfigProvider,
      { prefixCls: 'custom' },
      h(
        BorderBeam,
        {
          'active': false,
          'size': 'pulse-outside',
          'strength': 3,
          'density': 0,
          'className': 'brand',
          'style': { width: 200 },
          'aria-label': 'Brand',
        },
        'Content',
      ),
    ),
  );
  assert.match(html, /custom-border-beam brand/);
  assert.match(html, /aria-label="Brand"/);
  assert.match(html, /--beam-strength:1/);
  assert.match(html, /--beam-density:0.1/);
  assert.match(html, /--pulse-glow-sx:1/);
  assert.match(html, /width:200px/);
  assert.doesNotMatch(html, /data-active|colorVariant=/);
});
