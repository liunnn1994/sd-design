import { MarkdownRender as RootMarkdown } from '@sdata/web-react';
import DefaultMarkdown, {
  MarkdownRender,
  MarkdownComponentsContext,
} from '@sdata/web-react/markdown-render';

test('SD image nodes remain outside paragraph elements during SSR', () => {
  for (const content of [
    'Before\n\n![SD](/logo.png)\n\nAfter',
    'Before ![SD](/logo.png) after',
    '[![SD](/logo.png)](https://example.com)',
  ]) {
    const html = renderToStaticMarkup(h(MarkdownRender, { content, final: true }));
    assert.match(html, /sd-markdown-render-image/);
    for (const paragraph of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g))
      assert.doesNotMatch(paragraph[1], /<div\b/);
    assert.match(html, /paragraph-node/);
  }
});
import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('MarkdownRender root, named subpath and default entry share the SD component', () => {
  assert.equal(RootMarkdown, MarkdownRender);
  assert.equal(DefaultMarkdown, MarkdownRender);
  const html = renderToStaticMarkup(
    h(MarkdownRender, {
      content:
        '## Public SD\n\n[Link](https://example.com)\n\n- [x] Done\n\n<button>Action</button>',
      final: true,
      htmlPolicy: 'trusted',
    }),
  );
  assert.match(html, /sd-markdown-render/);
  assert.match(html, /sd-typography/);
  assert.match(html, /sd-link/);
  assert.match(html, /sd-checkbox/);
  assert.match(html, /sd-btn/);
});
test('public component mappings retain SD defaults outside the current subtree', () => {
  const note = (props: { children?: import('react').ReactNode }) =>
    h('aside', { 'data-custom-note': true }, props.children);
  const html = renderToStaticMarkup(
    h(
      MarkdownComponentsContext,
      {
        value: { 'sd-note': note },
      },
      h(MarkdownRender, {
        content: '<sd-note>\n\n**Custom content**\n\n</sd-note>',
        customHtmlTags: ['sd-note'],
        final: true,
      }),
    ),
  );
  assert.match(html, /data-custom-note/);
  const strong = html.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/)?.[1];
  assert.equal(strong?.replace(/<[^>]*>/g, ''), 'Custom content');
  const outside = renderToStaticMarkup(h(MarkdownRender, { content: '## Default', final: true }));
  assert.match(outside, /sd-typography/);
  assert.doesNotMatch(outside, /data-custom-note/);
});
