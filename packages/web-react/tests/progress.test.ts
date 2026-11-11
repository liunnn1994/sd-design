import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Progress, ConfigProvider } from '../dist/index.js';
import ProgressDefault from '../dist/progress/index.js';

test('Progress does not invoke custom text when its text region is hidden', () => {
  const text = () => {
    throw new Error('hidden text must not render');
  };
  for (const props of [
    { showText: false },
    { size: 'mini' as const },
    { type: 'circle' as const, size: 'mini' as const },
  ]) {
    assert.doesNotThrow(() => renderToStaticMarkup(h(Progress, { ...props, text })));
  }
});

test('Progress preserves raw percentages, automatic status and explicit line widths', () => {
  assert.equal(Progress, ProgressDefault);
  const html = renderToStaticMarkup(h(Progress, { percent: 1.2, width: 160, strokeWidth: 0 }));
  assert.match(html, /sd-progress-status-success/);
  assert.match(html, /aria-valuenow="120"/);
  assert.match(html, /width:160px;height:0px/);
  assert.match(html, /120%/);
});
test('Progress uses circle view for inherited mini lines but reserves the check-only view for circles', () => {
  const line = renderToStaticMarkup(
    h(ConfigProvider, { size: 'mini' }, h(Progress, { percent: 1 })),
  );
  assert.match(line, /sd-progress-type-line/);
  assert.match(line, /sd-progress-circle-svg/);
  assert.doesNotMatch(line, /sd-progress-circle-text/);
  const circle = renderToStaticMarkup(h(Progress, { type: 'circle', size: 'mini', percent: 1 }));
  assert.match(circle, /sd-icon-check/);
  assert.doesNotMatch(circle, /sd-progress-circle-svg/);
});
test('Progress steps override type and custom text receives the unscaled percentage', () => {
  const html = renderToStaticMarkup(
    h(Progress, {
      type: 'circle',
      steps: 4,
      percent: 0.26,
      status: 'danger',
      text: ({ percent }) => `raw ${percent}`,
    }),
  );
  assert.match(html, /sd-progress-type-steps/);
  assert.equal((html.match(/sd-progress-steps-item-active/g) ?? []).length, 2);
  assert.match(html, /raw 0.26/);
  assert.doesNotMatch(html, /sd-icon-exclamation/);
});
