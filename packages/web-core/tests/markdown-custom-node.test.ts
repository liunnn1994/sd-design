import assert from 'node:assert/strict';
import test from 'node:test';

import { getMarkdownCustomNodeProps, isMarkdownBuiltinNode } from '../dist/markdown/custom-node.js';

test('custom node classification preserves standard replacements and normalizes built-in names', () => {
  for (const type of [' TEXT ', 'heading', 'html_inline', 'reference', 'd2', 'vmr_container'])
    assert.equal(isMarkdownBuiltinNode(type), true);
  assert.equal(isMarkdownBuiltinNode('fixture-card'), false);
});
test('custom attributes accept token tuples, named entries and records with typed values', () => {
  const expected = { label: 'hello', count: '4', enabled: '', disabled: false };
  const record = { label: 'hello', count: 4, enabled: true, disabled: false };
  for (const attrs of [
    record,
    Object.entries(record),
    Object.entries(record).map(([name, value]) => ({ name, value })),
  ]) {
    assert.deepEqual(getMarkdownCustomNodeProps({ type: 'fixture-card', attrs }), expected);
  }
});
test('custom attribute forwarding removes event handlers and unsafe URLs at the policy boundary', () => {
  const props = getMarkdownCustomNodeProps({
    tag: 'fixture-card',
    attrs: {
      'onclick': 'alert(1)',
      'href': 'javascript:alert(1)',
      'data-label': 'safe',
    },
  });
  assert.equal(props.onclick, undefined);
  assert.equal(props.href, undefined);
  assert.equal(props['data-label'], 'safe');
  assert.deepEqual(getMarkdownCustomNodeProps({ attrs: null }), {});
});
