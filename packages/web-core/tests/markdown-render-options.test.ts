import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMarkdownMeasurementKey,
  getMarkdownModeOptions,
} from '../dist/markdown/render-options.js';

test('Markdown modes preserve the pinned docs and chat/minimal defaults', () => {
  assert.deepEqual(getMarkdownModeOptions('unknown'), getMarkdownModeOptions('docs'));
  assert.equal(getMarkdownModeOptions().maxLiveNodes, 220);
  assert.equal(getMarkdownModeOptions().showTooltips, true);
  assert.equal(getMarkdownModeOptions('chat').maxLiveNodes, 0);
  assert.equal(getMarkdownModeOptions('chat').showTooltips, false);
  assert.deepEqual(getMarkdownModeOptions('minimal'), getMarkdownModeOptions('chat'));
});
test('Markdown measurement identities include code layout, theme and caller identity', () => {
  const before = getMarkdownMeasurementKey({ measurementKey: 'one' });
  assert.equal(
    before,
    getMarkdownMeasurementKey({ measurementKey: 'one', isDark: false, codeBlockStream: true }),
  );
  for (const patch of [
    { measurementKey: 'two' },
    { isDark: true },
    { renderCodeBlocksAsPre: true },
    { codeBlockStream: false },
    { codeBlockMinWidth: 80 },
    { codeBlockOptions: { fontSize: 18 } },
    { codeBlockOptions: { parseDiffOptions: { context: 4 } } },
    { codeBlockProps: { showHeader: false } },
  ])
    assert.notEqual(before, getMarkdownMeasurementKey({ measurementKey: 'one', ...patch }));
});
