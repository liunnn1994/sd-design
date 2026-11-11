import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMarkdownTypewriterMode,
  isMarkdownCursorTailEligible,
} from '../dist/markdown/cursor.js';

test('Markdown typewriter uses precise for true and retains the explicit simple mode', () => {
  for (const value of [true, 'true', 'precise'])
    assert.equal(getMarkdownTypewriterMode(value), 'precise');
  assert.equal(getMarkdownTypewriterMode('simple'), 'simple');
  for (const value of [false, undefined, null, 'false', '', 'unknown'])
    assert.equal(getMarkdownTypewriterMode(value), 'off');
});
test('Markdown cursors exclude heavy tail nodes but allow ordinary rich text', () => {
  for (const type of [
    'code_block',
    'admonition',
    'table',
    'math_block',
    'html_block',
    'image',
    'thematic_break',
  ])
    assert.equal(isMarkdownCursorTailEligible(type), false);
  for (const type of ['paragraph', 'heading', 'blockquote', 'list', undefined])
    assert.equal(isMarkdownCursorTailEligible(type), true);
});
