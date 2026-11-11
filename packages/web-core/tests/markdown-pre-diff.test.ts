import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDiffPreviewPanes,
  createDiffMatchCache,
  getMarkdownPreDiffMetadata,
  observeMarkdownPreDiffRows,
  scheduleMarkdownPreDiffRefresh,
} from '../dist/markdown/pre-diff.js';
import { getMarkdownDiffNode } from './fixtures/markdown-pre-diff.ts';

test('diff metadata follows patch line numbers and shrinks after replacing a cached source', () => {
  const numbered = getMarkdownDiffNode('numbered');
  const panes = buildDiffPreviewPanes(numbered);
  assert.equal(getMarkdownPreDiffMetadata(numbered, panes).numberWidth, '3ch');
  const cache = createDiffMatchCache();
  const first = { code: '', originalCode: 'old', updatedCode: 'new', matchCache: cache };
  buildDiffPreviewPanes(first);
  const next = { ...first, originalCode: 'old\nappend', updatedCode: 'new\nappend' };
  assert.deepEqual(
    buildDiffPreviewPanes(next),
    buildDiffPreviewPanes({ ...next, matchCache: undefined }),
  );
  const shrunk = getMarkdownDiffNode('blank');
  assert.equal(
    getMarkdownPreDiffMetadata(shrunk, buildDiffPreviewPanes({ ...shrunk, matchCache: cache }))
      .numberWidth,
    '2ch',
  );
});
test('diff collapse options preserve leading and trailing ranges and can be disabled', () => {
  const node = getMarkdownDiffNode();
  const collapsed = buildDiffPreviewPanes({ ...node, hideUnchangedRegions: true });
  assert.equal(getMarkdownPreDiffMetadata(node, collapsed).collapsed, true);
  assert.ok(
    collapsed.every(
      (pane) =>
        pane.lines.some((line) => line.collapsedFirst) &&
        pane.lines.some((line) => line.collapsedLast),
    ),
  );
  const expanded = buildDiffPreviewPanes({ ...node, hideUnchangedRegions: false });
  assert.equal(getMarkdownPreDiffMetadata(node, expanded).collapsed, false);
  assert.ok(expanded[0].lines.length > collapsed[0].lines.length);
  assert.equal(buildDiffPreviewPanes({ ...node, inline: true }).length, 1);
});
test('diff observer teardown cancels queued work and ignores a late frame', () => {
  let run: FrameRequestCallback | undefined,
    cancelled = 0;
  const element = {
    ownerDocument: {
      defaultView: {
        requestAnimationFrame(callback: FrameRequestCallback) {
          run = callback;
          return 7;
        },
        cancelAnimationFrame(frame: number) {
          assert.equal(frame, 7);
          cancelled++;
        },
        getComputedStyle() {
          throw new Error('Late DOM measurement');
        },
      },
    },
  } as unknown as HTMLElement;
  let updates = 0;
  const cleanup = observeMarkdownPreDiffRows(element, () => updates++);
  cleanup();
  run!(0);
  assert.equal(cancelled, 1);
  assert.equal(updates, 0);
  const cancelRefresh = scheduleMarkdownPreDiffRefresh(element);
  cancelRefresh();
  run!(0);
  assert.equal(cancelled, 2);
});
