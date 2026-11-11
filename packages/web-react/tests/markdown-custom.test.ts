import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMarkdownNestedProps,
  withMarkdownRecursiveChildren,
} from '../dist/markdown-render/custom-children.js';

test('recursive custom children inherit rendering options without root state or callbacks', () => {
  const parseOptions = { final: true };
  const result = getMarkdownNestedProps({
    content: 'Root source',
    nodes: [],
    indexKey: 'root',
    final: true,
    className: 'root-class',
    mode: 'chat',
    htmlPolicy: 'escape',
    parseOptions,
    customId: 'scoped',
    virtualScroll: { enabled: true, sessionKey: 'root' },
    smoothStreaming: true,
    batchRendering: true,
    onCopy: () => undefined,
  });
  assert.equal(result.mode, 'chat');
  assert.equal(result.customId, 'scoped');
  assert.equal(result.htmlPolicy, 'escape');
  assert.equal(result.parseOptions, parseOptions);
  for (const key of [
    'content',
    'nodes',
    'indexKey',
    'final',
    'className',
    'virtualScroll',
    'smoothStreaming',
    'batchRendering',
    'onCopy',
  ])
    assert.equal(Object.hasOwn(result, key), false);
});

test('custom wrappers keep component identity and display metadata while leaving built-ins intact', () => {
  const Card = Object.assign(() => null, { markstreamDisplay: 'inline' as const });
  const first = withMarkdownRecursiveChildren({ 'fixture-card': Card, 'heading': Card });
  const next = withMarkdownRecursiveChildren({
    'fixture-card': Card,
    'other': Card,
    'heading': Card,
  });
  assert.notEqual(first['fixture-card'], Card);
  assert.equal(next['fixture-card'], first['fixture-card']);
  assert.equal(next.other, first['fixture-card']);
  assert.equal(first['fixture-card'].markstreamDisplay, 'inline');
  assert.equal(first.heading, Card);
  assert.equal(withMarkdownRecursiveChildren(first)['fixture-card'], first['fixture-card']);
});
