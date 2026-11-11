import assert from 'node:assert/strict';
import test from 'node:test';

import type { MarkstreamVirtualState } from '../dist/markdown/virtual-types.js';

import {
  getCompatibleMarkdownHeightCache,
  getCompatibleMarkdownStandaloneHeightCache,
  getMarkdownContentHash,
  getMarkdownNodeSignature,
  getMarkdownWidthBucket,
  limitMarkdownHeightCache,
} from '../dist/markdown/virtual-state.js';

const nodes = [
  { type: 'paragraph', children: [{ type: 'text', content: 'First' }] },
  { type: 'heading', level: 2, children: [{ type: 'text', content: 'Second' }] },
];
const identity = {
  sessionKey: 'session',
  threadKey: 'thread',
  measurementKey: 'layout',
  width: 640,
  nodes,
};
test('standalone Markdown height caches require width and per-node signatures', () => {
  const entries = snapshot().heightCache!;
  assert.deepEqual(getCompatibleMarkdownStandaloneHeightCache(identity, entries, 640), entries);
  assert.deepEqual(getCompatibleMarkdownStandaloneHeightCache(identity, entries, 650), entries);
  for (const width of [undefined, 0, NaN, Infinity, 680])
    assert.deepEqual(getCompatibleMarkdownStandaloneHeightCache(identity, entries, width), []);
  const invalid = [
    { ...entries[0], signature: '' },
    { ...entries[0], signature: 'old' },
    { ...entries[0], nodeType: 'table' },
    { ...entries[0], height: 0 },
    { ...entries[0], height: Infinity },
    { ...entries[0], index: -1 },
    { ...entries[0], index: 0.5 },
    { ...entries[0], index: 4 },
  ];
  assert.deepEqual(
    getCompatibleMarkdownStandaloneHeightCache(identity, [...invalid, entries[1]], 640),
    [entries[1]],
  );
});
function snapshot(): MarkstreamVirtualState {
  return {
    sessionKey: 'session',
    threadKey: 'thread',
    measurementKey: 'layout',
    width: 640,
    contentHash: getMarkdownContentHash(nodes),
    metrics: {
      sessionKey: 'session',
      phase: 'settled',
      nodeCount: 2,
      liveRange: { start: 0, end: 2 },
      renderedCount: 2,
      measuredCount: 2,
      estimatedCount: 0,
      averageNodeHeight: 30,
      topSpacerHeight: 0,
      bottomSpacerHeight: 0,
      visibleDomHeight: 60,
      totalHeight: 60,
      width: 640,
      final: true,
      stable: true,
      confidence: 'measured',
      reason: 'manual',
    },
    heightCache: nodes.map((node, index) => ({
      index,
      height: 20 + index * 20,
      nodeType: node.type,
      signature: getMarkdownNodeSignature(node),
    })),
  };
}
test('Markdown virtual signatures ignore runtime identities but include mutations in large child arrays', () => {
  const node = {
    ...nodes[0],
    children: Array.from({ length: 180 }, (_, index) => ({ type: 'text', content: String(index) })),
    parent: {},
    el: {},
    component: () => undefined,
  };
  const before = getMarkdownNodeSignature(node);
  assert.equal(
    getMarkdownNodeSignature({
      ...node,
      parent: { changed: true },
      el: { nodeName: 'DIV' },
      component: () => 'changed',
    }),
    before,
  );
  node.children[90].content = 'Middle mutation';
  assert.notEqual(getMarkdownNodeSignature(node), before);
  const cyclic: { type: string; attrs?: unknown } = { type: 'paragraph' };
  cyclic.attrs = cyclic;
  assert.doesNotThrow(() => getMarkdownNodeSignature(cyclic));
  assert.equal(
    getMarkdownNodeSignature({ ...nodes[1], attrs: { a: '1', b: '2' } }),
    getMarkdownNodeSignature({ ...nodes[1], attrs: { b: '2', a: '1' } }),
  );
});
test('Markdown restored heights require matching session, thread, measurement and width bucket', () => {
  const state = snapshot();
  assert.deepEqual(getCompatibleMarkdownHeightCache(identity, state), state.heightCache);
  assert.equal(getCompatibleMarkdownHeightCache({ ...identity, width: 650 }, state).length, 2);
  for (const patch of [
    { sessionKey: 'other' },
    { threadKey: 'other' },
    { measurementKey: 'other' },
    { width: 680 },
    { width: 0 },
    { width: NaN },
  ])
    assert.deepEqual(getCompatibleMarkdownHeightCache({ ...identity, ...patch }, state), []);
  assert.equal(getMarkdownWidthBucket('640'), 20);
  assert.equal(getMarkdownWidthBucket(Infinity), -1);
});
test('Markdown changed documents restore only compatible node signatures and reject invalid heights', () => {
  const state = snapshot();
  const changed = [...nodes, { type: 'paragraph', children: [] }];
  changed[1] = { ...nodes[1], children: [{ type: 'text', content: 'Changed' }] };
  assert.deepEqual(getCompatibleMarkdownHeightCache({ ...identity, nodes: changed }, state), [
    state.heightCache![0],
  ]);
  const cache = state.heightCache!;
  state.heightCache = [
    cache[0],
    { ...cache[1], height: -1 },
    { ...cache[1], height: Infinity },
    { ...cache[1], index: 0.5 },
    { ...cache[1], index: 10 },
    { ...cache[1], nodeType: 'table' },
  ];
  assert.deepEqual(getCompatibleMarkdownHeightCache(identity, state), [cache[0]]);
});
test('Markdown cache metadata can use a matching document hash but unsigned foreign entries are ignored', () => {
  const state = snapshot();
  state.heightCache = state.heightCache!.map((entry) => ({ ...entry, signature: '' }));
  assert.equal(getCompatibleMarkdownHeightCache(identity, state).length, 2);
  const unsigned = {
    ...state,
    heightCache: state.heightCache!.map((entry) => ({ ...entry, nodeType: undefined })),
  };
  assert.deepEqual(getCompatibleMarkdownHeightCache(identity, unsigned), []);
  state.contentHash = undefined;
  assert.deepEqual(getCompatibleMarkdownHeightCache(identity, state), []);
  state.heightCache = snapshot().heightCache;
  assert.equal(getCompatibleMarkdownHeightCache(identity, state).length, 2);
});
test('Markdown cache limits retain nearby nodes first and sample remaining measurements without mutation', () => {
  const entries = Array.from({ length: 30 }, (_, index) => ({
    index,
    height: 20,
    signature: String(index),
  }));
  const limited = limitMarkdownHeightCache(entries, { start: 10, end: 12 }, 30, 1, 10);
  assert.equal(limited.length, 10);
  for (let index = 8; index < 14; index++)
    assert.ok(limited.some((entry) => entry.index === index));
  assert.deepEqual(
    limited.map((entry) => entry.index),
    limited.map((entry) => entry.index).sort((a, b) => a - b),
  );
  assert.equal(entries.length, 30);
  assert.equal(limitMarkdownHeightCache(entries, { start: 0, end: 0 }, 30, 0, 0), entries);
});
