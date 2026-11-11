import assert from 'node:assert/strict';
import test from 'node:test';

import { estimateMarkdownCodeHeight } from '../dist/markdown/code-height.js';

const node = (code: string, extra = {}) => ({ type: 'code_block', code, ...extra });
test('code heights distinguish pre and streaming geometry, loading tails and limits', () => {
  assert.equal(
    estimateMarkdownCodeHeight(node('one\r\ntwo\r\n'), 600, { rendererKind: 'pre' })?.height,
    89,
  );
  assert.equal(
    estimateMarkdownCodeHeight(node('one\ntwo\n', { loading: true }), 600, { rendererKind: 'pre' })
      ?.height,
    107,
  );
  assert.equal(
    estimateMarkdownCodeHeight(node('one\ntwo'), 600, { rendererKind: 'stream-diffs' })?.height,
    92,
  );
  assert.equal(
    estimateMarkdownCodeHeight(node('one\ntwo'), 600, {
      rendererKind: 'pre',
      codeBlockProps: { showHeader: false },
      codeBlockOptions: { lineHeight: 30, padding: 0, maxHeight: 40 },
    })?.height,
    40,
  );
  assert.equal(
    estimateMarkdownCodeHeight(node('line\n'.repeat(100)), 600, { rendererKind: 'stream-diffs' })
      ?.height,
    540,
  );
  assert.equal(
    estimateMarkdownCodeHeight({ type: 'paragraph' }, 600, { rendererKind: 'pre' }),
    null,
  );
});
test('pre wrapping accounts for line numbers, tab stops, wide characters and explicit overflow', () => {
  const options = { rendererKind: 'pre' as const, codeBlockProps: { showHeader: false } };
  assert.equal(estimateMarkdownCodeHeight(node('a'.repeat(18)), 150, options)?.height, 52);
  assert.equal(
    estimateMarkdownCodeHeight(node('a'.repeat(18)), 150, {
      ...options,
      codeBlockProps: { showHeader: false, showLineNumbers: false },
    })?.height,
    34,
  );
  assert.equal(estimateMarkdownCodeHeight(node('\t中文abcdef'), 100, options)?.height, 70);
  assert.equal(
    estimateMarkdownCodeHeight(node('a'.repeat(200)), 150, {
      ...options,
      codeBlockOptions: { overflow: 'scroll' },
    })?.height,
    34,
  );
});
test('diff heights preserve split/unified counting and side-by-side wrapped rows', () => {
  const diff = node('', {
    diff: true,
    originalCode: 'old\nline',
    updatedCode: 'new\nline\nextra',
    raw: '--- a\n+++ b\n@@ -1 +1 @@\n-old\n+new\n line\n+extra',
  });
  assert.equal(estimateMarkdownCodeHeight(diff, 600, { rendererKind: 'stream-diffs' })?.height, 94);
  assert.equal(
    estimateMarkdownCodeHeight(diff, 600, {
      rendererKind: 'stream-diffs',
      codeBlockOptions: { diffStyle: 'unified' },
    })?.height,
    112,
  );
  assert.equal(
    estimateMarkdownCodeHeight(
      node('', { diff: true, originalCode: 'a'.repeat(20), updatedCode: 'b'.repeat(30) }),
      200,
      { rendererKind: 'pre', codeBlockProps: { showHeader: false, showLineNumbers: false } },
    )?.height,
    70,
  );
});
