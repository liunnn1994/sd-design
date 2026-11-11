import { CodeBlockNode, PreCodeNode } from 'markstream-react';
import assert from 'node:assert/strict';
import test from 'node:test';

import { createMarkdownCodeEstimator } from '../dist/markdown-render/code-height.js';
import { withMarkdownRecursiveChildren } from '../dist/markdown-render/custom-children.js';

const node = { type: 'code_block', code: 'one\ntwo', language: 'txt' };
test('code estimates follow renderer defaults and retain fallback for public component overrides', () => {
  assert.equal(createMarkdownCodeEstimator({}, {})(node, 600)?.height, 92);
  assert.equal(
    createMarkdownCodeEstimator({ renderCodeBlocksAsPre: true }, {})(node, 600)?.height,
    89,
  );
  for (const Component of [CodeBlockNode, PreCodeNode]) {
    const estimate = createMarkdownCodeEstimator(
      {},
      withMarkdownRecursiveChildren({ txt: Component }),
    )(node, 600);
    assert.equal(estimate, null);
    assert.equal(
      createMarkdownCodeEstimator({ renderCodeBlocksAsPre: true }, { code_block: Component })(
        node,
        600,
      ),
      null,
    );
  }
});
test('custom code and diagram renderers retain fallback while pre mode estimates fenced diagrams', () => {
  assert.equal(createMarkdownCodeEstimator({}, { code_block: () => null })(node, 600), null);
  assert.equal(createMarkdownCodeEstimator({}, { txt: () => null })(node, 600), null);
  for (const language of ['mermaid', 'infographic', 'd2', 'd2lang']) {
    assert.equal(createMarkdownCodeEstimator({}, {})({ ...node, language }, 600), null);
    assert.equal(
      createMarkdownCodeEstimator({ renderCodeBlocksAsPre: true }, {})({ ...node, language }, 600)
        ?.height,
      89,
    );
  }
  assert.equal(createMarkdownCodeEstimator({}, {})(null, 600), null);
  assert.equal(createMarkdownCodeEstimator({}, {})({ type: 'paragraph' }, 600), null);
});
