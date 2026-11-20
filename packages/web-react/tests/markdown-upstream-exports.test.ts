import * as parser from '@sdata/web-core/markdown/parser';
import * as sdk from 'markstream-react';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { MarkdownRenderer } from '../dist/markdown-render/renderer.js';
import * as api from '../dist/markdown-render/upstream.js';

const vue = await import(
  new URL('../../web-vue/node_modules/markstream-vue/dist/index.js', import.meta.url).href
);
test('the explicit facade preserves matching upstream component and utility bindings', () => {
  let checked = 0;
  for (const name of Object.keys(vue)) {
    if (!(name in sdk)) continue;
    const exposed = name === 'Tooltip' ? 'MarkstreamTooltip' : name;
    assert.equal(api[exposed as keyof typeof api], sdk[name as keyof typeof sdk], exposed);
    checked++;
  }
  assert.ok(checked > 60);
  assert.equal(api.UpstreamMarkdownRender, sdk.NodeRenderer);
  assert.equal(api.default, sdk.default);
});
test('the facade forwards the renderer parser singleton, including policy and sanitizer helpers', () => {
  for (const [name, value] of Object.entries(parser))
    assert.equal(api[name as keyof typeof api], value, name);
  assert.equal(api.isUnsafeHtmlUrl('javascript:alert(1)'), true);
  assert.equal(api.isUnsafeHtmlUrl('https://example.test'), false);
  const safe = api.sanitizeHtmlContent(
    '<img src="javascript:alert(1)" onerror="alert(1)"><script>alert(1)</script>',
  );
  assert.doesNotMatch(safe, /onerror=|javascript:|<script/i);
});
test('facade plugins affect SD and upstream renders and can be cleared', () => {
  api.clearRegisteredMarkdownPlugins();
  try {
    api.registerMarkdownPlugin((md) => {
      md.core.ruler.push('sd-renderer-plugin', (state) => {
        for (const token of state.tokens)
          for (const child of token.children ?? [])
            if (child.type === 'text') child.content = child.content.replaceAll('BRIDGE', 'PLUGIN');
      });
    });
    for (const Renderer of [MarkdownRenderer, api.UpstreamMarkdownRender]) {
      const props = {
        content: 'BRIDGE',
        final: true,
        batchRendering: false,
        deferNodesUntilVisible: false,
      };
      const html = renderToStaticMarkup(createElement(Renderer, props));
      assert.match(html, /PLUGIN/);
      assert.doesNotMatch(html, /BRIDGE/);
    }
    api.clearRegisteredMarkdownPlugins();
    const cleared = renderToStaticMarkup(
      createElement(MarkdownRenderer, {
        content: 'BRIDGE',
        final: true,
        batchRendering: false,
        deferNodesUntilVisible: false,
        customId: 'cleared',
      }),
    );
    assert.match(cleared, /BRIDGE/);
    assert.doesNotMatch(cleared, /PLUGIN/);
  } finally {
    api.clearRegisteredMarkdownPlugins();
  }
});
