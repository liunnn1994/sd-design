import assert from 'node:assert/strict';
import test from 'node:test';

import type { MarkdownTextProbeProfile } from '../dist/markdown/text-height.js';

import {
  estimateMarkdownTextHeight,
  loadMarkdownTextLayout,
} from '../dist/markdown/text-height.js';

const font = {
  font: 'normal 400 14px Arial',
  lineHeight: 22,
  wrapperOverhead: 8,
  widthAdjustment: 20,
};
const profile: MarkdownTextProbeProfile = {
  paragraph: font,
  listItem: { ...font, widthAdjustment: 40 },
  listWrapperOverhead: 12,
  headings: { 2: { ...font, lineHeight: 32 } },
};
test('text estimates accept only plain text, emoji and hardbreak leaves', () => {
  const seen: unknown[] = [];
  const estimate = estimateMarkdownTextHeight(
    {
      type: 'paragraph',
      children: [
        { type: 'text', content: 'First' },
        { type: 'hardbreak' },
        { type: 'emoji', name: '🙂' },
      ],
    },
    480,
    profile,
    (text, width, measuredFont) => {
      seen.push(text, width, measuredFont);
      return { kind: 'simple-text', height: 52, contentHeight: 44 };
    },
  );
  assert.deepEqual(seen, ['First\n🙂', 480, font]);
  assert.equal(estimate?.height, 52);
  for (const value of [
    { type: 'paragraph', children: [] },
    { type: 'paragraph', children: [{ type: 'strong', children: [] }] },
    { type: 'heading', level: 6, children: [{ type: 'text', content: 'Text' }] },
    { type: 'image' },
  ])
    assert.equal(estimateMarkdownTextHeight(value, 480, profile), null);
});
test('list estimates require one simple paragraph per item and add wrapper overhead once', () => {
  const item = {
    type: 'list_item',
    children: [{ type: 'paragraph', children: [{ type: 'text', content: 'Text' }] }],
  };
  const measure = (_text: string, _width: number, measuredFont: typeof font) => {
    assert.equal(measuredFont, profile.listItem);
    return { kind: 'simple-text' as const, height: 30, contentHeight: 22 };
  };
  assert.equal(
    estimateMarkdownTextHeight({ type: 'list', items: [item, item] }, 480, profile, measure)
      ?.height,
    72,
  );
  assert.equal(
    estimateMarkdownTextHeight(
      { type: 'list', items: [item, { ...item, children: [] }] },
      480,
      profile,
      measure,
    ),
    null,
  );
  assert.equal(estimateMarkdownTextHeight(item, 0, profile, measure), null);
});
test('SSR loading and estimates do not require canvas or browser globals', async () => {
  await loadMarkdownTextLayout();
  assert.equal(
    estimateMarkdownTextHeight(
      { type: 'paragraph', children: [{ type: 'text', content: 'Text' }] },
      480,
      profile,
    ),
    null,
  );
});
