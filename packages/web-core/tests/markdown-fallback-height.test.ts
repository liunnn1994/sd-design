import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMarkdownFallbackHeight,
  getMarkdownStaticHeight,
} from '../dist/markdown/fallback-height.js';

test('static placeholders distinguish headings, text wrapping, code and heavy nodes', () => {
  assert.equal(getMarkdownStaticHeight(null), 32);
  assert.deepEqual(
    [1, 2, 3, 4, 6].map((level) => getMarkdownStaticHeight({ type: 'heading', level })),
    [44, 32, 30, 20, 20],
  );
  assert.equal(getMarkdownStaticHeight({ type: 'paragraph', raw: 'x'.repeat(400) }, 600), 144);
  assert.equal(getMarkdownStaticHeight({ type: 'paragraph', raw: 'x'.repeat(400) }, 320), 232);
  assert.equal(getMarkdownStaticHeight({ type: 'paragraph', raw: 'x'.repeat(400) }, NaN), 122);
  assert.equal(
    getMarkdownStaticHeight({ type: 'code_block', code: Array(10).fill('x').join('\n') }),
    212,
  );
  assert.equal(getMarkdownStaticHeight({ type: 'image' }), 220);
  assert.equal(getMarkdownStaticHeight({ type: 'math_block' }), 72);
});
test('lists, tables, closed details and diagram fences use their distinct layout rules', () => {
  assert.equal(getMarkdownStaticHeight({ type: 'list', items: [] }), 48);
  assert.equal(
    getMarkdownStaticHeight({
      type: 'list',
      items: Array.from({ length: 30 }, () => ({ raw: 'Item' })),
    }),
    984,
  );
  assert.equal(getMarkdownStaticHeight({ type: 'table' }), 162);
  assert.equal(
    getMarkdownStaticHeight({
      type: 'html_block',
      raw: '<details><summary>Title</summary>' + 'x'.repeat(900) + '</details>',
    }),
    40,
  );
  assert.equal(
    getMarkdownStaticHeight({ type: 'code_block', language: 'mermaid', code: 'graph TD\nA-->B' }),
    360,
  );
  assert.equal(
    getMarkdownStaticHeight({ type: 'code_block', language: 'infographic', code: '- A\n- B\n- C' }),
    500,
  );
});
test('headings and simple short paragraphs avoid inflated averages, custom paragraphs do not', () => {
  const paragraph = {
    type: 'paragraph',
    raw: 'Short',
    children: [{ type: 'strong', children: [{ type: 'text', content: 'Short' }] }],
  };
  assert.equal(getMarkdownFallbackHeight(paragraph, 600, 300), 28);
  assert.equal(getMarkdownFallbackHeight(paragraph, 600, 300, true), 300);
  assert.equal(getMarkdownFallbackHeight({ type: 'heading', level: 2 }, 600, 300), 32);
  assert.equal(getMarkdownFallbackHeight({ type: 'image' }, 600, 300), 300);
});
