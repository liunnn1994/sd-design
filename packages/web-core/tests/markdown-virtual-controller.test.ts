import assert from 'node:assert/strict';
import test from 'node:test';

import { createMarkdownVirtualController } from '../dist/markdown/virtual-controller.js';

test('Markdown lifecycle reports ignore foreign and out-of-range node indices before DOM connection', () => {
  const controller = createMarkdownVirtualController({
    config: () => ({
      nodes: [{ type: 'paragraph' }],
      sessionKey: 'test',
      indexPrefix: 'md',
      final: true,
    }),
    afterRender: () => Promise.resolve(),
    notify() {},
  });
  for (const key of [-1, 1, 0.5, NaN, 'foreign-0', 'md-4', 'md--1'])
    controller.reportHeight(key, 40);
  assert.equal(controller.getVirtualMetrics().measuredCount, 0);
  controller.reportHeight('md-0-child', 40);
  assert.equal(controller.getVirtualMetrics().measuredCount, 1);
  assert.equal(controller.getVirtualMetrics().stable, false);
  controller.dispose();
});

test('coordinated offsets use typed fallbacks, measured heights and custom paragraph invalidation', () => {
  const options = {
    nodes: [
      { type: 'heading', level: 2 },
      { type: 'paragraph', raw: 'Short' },
      { type: 'image' },
      { type: 'thematic_break' },
    ],
    sessionKey: 'height',
    indexPrefix: 'md',
    coordinated: true,
    customParagraph: false,
  };
  const controller = createMarkdownVirtualController({
    config: () => options,
    afterRender: () => Promise.resolve(),
    notify() {},
  });
  controller.update();
  assert.equal(controller.getVirtualMetrics().totalHeight, 312);
  assert.equal(controller.getVirtualMetrics().measuredCount, 0);
  controller.reportHeight('md-0', 100);
  assert.equal(controller.getPlaceholderHeight(0), 100);
  assert.equal(controller.getVirtualMetrics().totalHeight, 448);
  options.customParagraph = true;
  controller.update();
  assert.equal(controller.getVirtualMetrics().totalHeight, 520);
  options.nodes = [{ type: 'thematic_break' }, { type: 'heading', level: 6 }];
  controller.update();
  assert.equal(controller.getVirtualMetrics().totalHeight, 52);
  controller.dispose();
});
