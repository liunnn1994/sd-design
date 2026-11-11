import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getMarkdownDiffNode } from '../../web-core/tests/fixtures/markdown-pre-diff.ts';
import { markdownPreNode } from '../../web-core/tests/fixtures/markdown-pre-node.ts';

test('diff SSR renders collapsed native panes and safely escapes source text', () => {
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      nodes: [getMarkdownDiffNode()],
      renderCodeBlocksAsPre: true,
      final: true,
      renderAsFragment: true,
      codeBlockProps: { diffHideUnchangedRegions: true },
    }),
  );
  assert.match(html, /markstream-pre--diff-collapsed/);
  assert.match(html, /unmodified lines/);
  assert.equal([...html.matchAll(/class="markstream-pre__diff-pane /g)].length, 2);
  const node = {
    ...getMarkdownDiffNode(),
    originalCode: '<script>alert(1)</script>',
    updatedCode: 'text',
  };
  const escaped = renderToStaticMarkup(
    h(MarkdownRenderer, { nodes: [node], renderCodeBlocksAsPre: true, final: true }),
  );
  assert.match(escaped, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(escaped, /<script>/);
});
test('inline diff SSR preserves reserved height for both loading and final source', () => {
  for (const loading of [true, false]) {
    const node = { ...getMarkdownDiffNode(), loading };
    const html = renderToStaticMarkup(
      h(MarkdownRenderer, {
        nodes: [node],
        renderCodeBlocksAsPre: true,
        final: !loading,
        codeBlockProps: { diffInline: true, showHeader: false, reservedHeightPx: 160 },
      }),
    );
    assert.match(html, /markstream-pre--diff-inline/);
    assert.match(html, /height:160px/);
    assert.match(html, new RegExp(`aria-busy="${loading}"`));
    assert.equal([...html.matchAll(/class="markstream-pre__diff-pane /g)].length, 1);
    assert.doesNotMatch(html, /code-block-header/);
  }
});
import { MarkdownRenderer } from '../dist/markdown-render/renderer.js';

test('pre SSR preserves the configured shell, raw text and diagram-language dispatch', () => {
  for (const language of ['typescript', 'mermaid', 'infographic', 'd2', 'd2lang']) {
    const node = { ...markdownPreNode, language };
    const html = renderToStaticMarkup(
      h(MarkdownRenderer, {
        nodes: [node],
        renderCodeBlocksAsPre: true,
        final: true,
        renderAsFragment: true,
        codeBlockOptions: { fontSize: 16, padding: 12 },
      }),
    );
    assert.match(html, /sd-markdown-pre-block/);
    assert.match(html, /code-header-title/);
    assert.match(html, /font-size:16px/);
    assert.match(html, /data-markstream-code-theme="vitesse-light"/);
    assert.match(html, new RegExp(`data-language="${language}"`));
    assert.doesNotMatch(html, /height-estimation-probes|mermaid-block|d2-block|infographic-block/);
  }
});
test('pre SSR applies disabled header and line numbers through nested native nodes', () => {
  const node = { type: 'blockquote', raw: '', children: [markdownPreNode] };
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      nodes: [node],
      renderCodeBlocksAsPre: true,
      final: true,
      codeBlockProps: { showHeader: false, showLineNumbers: false },
    }),
  );
  assert.match(html, /code-pre-fallback/);
  assert.doesNotMatch(
    html,
    /code-block-header|markstream-pre__logical-line|markstream-pre__line-numbers/,
  );
});

test('coordinated Markdown SSR keeps native text probes browser-only', () => {
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      content: 'Paragraph',
      final: true,
      virtualScroll: { enabled: true, sessionKey: 'ssr' },
    }),
  );
  assert.match(html, /virtual-scroll-coordinated/);
  assert.match(html, /Paragraph/);
  assert.doesNotMatch(html, /height-estimation-probes|Probe paragraph text|Probe heading/);
});

test('Markdown root SSR parses real SD headings, links and task markers without browser APIs', () => {
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      content: '## Heading\n\n[Link](/target)\n\n- [x] Done',
      final: true,
      batchRendering: false,
    }),
  );
  assert.match(html, /markstream-react markdown-renderer sd-markdown-render/);
  assert.match(html, /<h2[^>]*sd-typography/);
  assert.match(html, /href="\/target"/);
  assert.match(html, /sd-checkbox/);
  assert.doesNotMatch(html, /<div class="sd-checkbox-icon"/);
});
test('Markdown root SSR preserves deferred slots without rendering offscreen content', () => {
  const nodes = Array.from({ length: 60 }, (_, index) => ({
    type: 'heading',
    level: 2,
    children: [{ type: 'text', content: `Node ${index}`, raw: '' }],
    raw: '',
  }));
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      nodes,
      final: true,
      nodeVirtual: false,
      initialRenderBatchSize: 1,
    }),
  );
  assert.equal([...html.matchAll(/class="node-slot"/g)].length, 60);
  assert.equal([...html.matchAll(/class="node-placeholder"/g)].length, 59);
  assert.match(html, /Node 0/);
  assert.doesNotMatch(html, /Node 59/);
});
test('Markdown root SSR honors nonempty supplied nodes when batching and deferral are disabled', () => {
  const nodes = Array.from({ length: 60 }, (_, index) => ({
    type: 'heading',
    level: 2,
    children: [{ type: 'text', content: `Node ${index}`, raw: '' }],
    raw: '',
  }));
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      nodes,
      content: '# Ignored content',
      final: true,
      nodeVirtual: false,
      batchRendering: false,
      deferNodesUntilVisible: false,
    }),
  );
  assert.equal([...html.matchAll(/class="node-slot"/g)].length, 60);
  assert.match(html, /Node 59/);
  assert.doesNotMatch(html, /Ignored content/);
});
test('Markdown fragment SSR omits root and slot hosts while retaining local SD content', () => {
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, { content: '## Fragment', final: true, renderAsFragment: true }),
  );
  assert.match(html, /sd-typography/);
  assert.doesNotMatch(html, /markdown-renderer|node-slot/);
});
test('Markdown minimal DOM requests retain slots with the SD node mapping installed', () => {
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      content: '## Minimal',
      final: true,
      domMode: 'minimal',
      mode: 'minimal',
      fade: false,
      batchRendering: false,
      deferNodesUntilVisible: false,
      viewportPriority: false,
      maxLiveNodes: 0,
      nodeVirtual: false,
    }),
  );
  assert.match(html, /class="node-slot"/);
  assert.match(html, /class="node-content"/);
  assert.match(html, /<h2[^>]*sd-typography/);
});

test('Markdown fragment SSR renders every supplied node despite virtual and batch settings', () => {
  const nodes = Array.from({ length: 60 }, (_, index) => ({
    type: 'heading',
    level: 2,
    children: [{ type: 'text', content: `Node ${index}`, raw: '' }],
    raw: '',
  }));
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      nodes,
      final: true,
      renderAsFragment: true,
      nodeVirtual: true,
      maxLiveNodes: 2,
      liveNodeBuffer: 0,
      batchRendering: true,
      initialRenderBatchSize: 1,
      renderBatchDelay: 10000,
    }),
  );
  assert.equal([...html.matchAll(/<h2/g)].length, 60);
  assert.match(html, /Node 59/);
  assert.doesNotMatch(html, /markdown-renderer|node-slot|node-spacer/);
});

test('Markdown SSR preserves all completed non-deferred nodes in docs and chat modes', () => {
  const nodes = Array.from({ length: 60 }, (_, index) => ({
    type: 'heading',
    level: 2,
    children: [{ type: 'text', content: `Node ${index}`, raw: '' }],
    raw: '',
  }));
  for (const mode of ['docs', 'chat'] as const) {
    const html = renderToStaticMarkup(
      h(MarkdownRenderer, {
        nodes,
        mode,
        final: true,
        nodeVirtual: false,
        maxLiveNodes: 0,
        batchRendering: true,
        initialRenderBatchSize: 1,
        renderBatchSize: 1,
        renderBatchDelay: 10000,
        deferNodesUntilVisible: false,
        viewportPriority: false,
      }),
    );
    assert.equal([...html.matchAll(/class="node-slot"/g)].length, 60);
    assert.match(html, /Node 59/);
  }
});

test('Markdown root SSR forwards host attributes and excludes parser and coordination props', () => {
  const html = renderToStaticMarkup(
    h(MarkdownRenderer, {
      'content': 'Text',
      'final': true,
      'title': 'Host title',
      'role': 'region',
      'tabIndex': 0,
      'aria-label': 'Content',
      'data-owner': 'caller',
      'mode': 'docs',
      'parseCoalesceMs': 10,
      'virtualScroll': { enabled: true, sessionKey: 'ssr' },
    }),
  );
  assert.match(html, /title="Host title"/);
  assert.match(html, /aria-label="Content"/);
  assert.match(html, /data-owner="caller"/);
  assert.match(html, /tabindex="0"/);
  assert.doesNotMatch(html, /parseCoalesceMs=|virtualScroll=|content="|final=|mode="/);
});
