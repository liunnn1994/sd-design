import { getCustomNodeComponents, renderNode } from 'markstream-react';
import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { MarkdownContainerNode } from '../dist/markdown-render/nodes/container.js';
import {
  getMarkdownHtmlStyle,
  normalizeMarkdownHtmlAttrs,
} from '../dist/markdown-render/nodes/html-attrs.js';
import { MarkdownHtmlNode } from '../dist/markdown-render/nodes/html.js';
import { MarkdownImageNode } from '../dist/markdown-render/nodes/image.js';
import { markdownComponents } from '../dist/markdown-render/nodes/index.js';

test('Markdown image SSR rejects unsafe sources and renders the initial error slot', () => {
  const html = renderToStaticMarkup(
    h(MarkdownImageNode, {
      node: {
        type: 'image',
        src: 'javascript:alert(1)',
        alt: 'Picture',
        title: '<caption>',
        raw: '',
      },
      renderPlaceholder: () => 'Loading image',
      renderError: (state) => (state.hasError ? 'No safe image' : 'Unexpected state'),
    }),
  );
  assert.doesNotMatch(html, /<img|javascript:|Loading image/);
  assert.match(html, /No safe image/);
  assert.match(html, /&lt;caption&gt;/);
});

test('Markdown image SSR preserves a safe fallback and streaming placeholder state', () => {
  const html = renderToStaticMarkup(
    h(MarkdownImageNode, {
      node: {
        type: 'image',
        src: 'javascript:alert(1)',
        alt: '',
        title: null,
        raw: '',
        loading: true,
      },
      fallbackSrc: '/fallback.png',
      lazy: true,
      renderPlaceholder: (state) =>
        `${state.displaySrc}:${state.imageLoaded}:${state.hasError}:${state.lazy}`,
    }),
  );
  assert.doesNotMatch(html, /<img|javascript:/);
  assert.match(html, /\/fallback.png:false:false:true/);
});

test('Markdown HTML SSR uses SD typography and links while preserving entities and whitespace', () => {
  const html = renderToStaticMarkup(
    h(MarkdownHtmlNode, {
      node: {
        type: 'html_block',
        content: '<h2 class="own-heading">Title</h2><p>A &amp; B <a href="/page">link</a> end</p>',
      },
    }),
  );
  assert.match(html, /<h2[^>]*sd-typography[^>]*own-heading/);
  assert.match(html, /<div[^>]*sd-typography/);
  assert.match(html, /A &amp; B /);
  assert.match(html, /<a(?=[^>]*sd-link)(?=[^>]*href="\/page")[^>]*>/);
  assert.match(html, / end/);
  const dangerous = renderToStaticMarkup(
    h(MarkdownHtmlNode, { node: { content: '<p>Safe</p><script>throw Error(1)</script>' } }),
  );
  assert.doesNotMatch(dangerous, /<script|throw Error/);
});

test('fully filtered HTML has a stable empty host without mounting an upstream placeholder', () => {
  const html = renderToStaticMarkup(
    h(MarkdownHtmlNode, {
      node: { type: 'html_block', content: '<button>Filtered by safe policy</button>' },
    }),
  );
  assert.equal(html, '<div></div>');
});

test('Markdown HTML SSR keeps the trusted button and style contract without passing string styles to React', () => {
  const content =
    '<p style="font-family: \'a;b\'; color:red!important; color:blue; --token:\'x;y\'">Text <button type="submit" disabled="false">Submit</button></p>';
  const html = renderToStaticMarkup(
    h(MarkdownHtmlNode, { node: { type: 'html_block', content }, htmlPolicy: 'trusted' }),
  );
  assert.match(html, /font-family:&#x27;a;b&#x27;/);
  assert.match(html, /color:red !important/);
  assert.match(html, /--token:&#x27;x;y&#x27;/);
  assert.match(html, /<button[^>]*sd-btn-secondary[^>]*type="submit"/);
  assert.doesNotMatch(html, /disabled=""/);
  const escaped = renderToStaticMarkup(
    h(MarkdownHtmlNode, { node: { type: 'html_block', content }, htmlPolicy: 'escape' }),
  );
  assert.match(escaped, /&lt;p/);
  assert.doesNotMatch(escaped, /<button|sd-typography/);
});

test('Markdown HTML attributes preserve DOM names, booleans, quoted values and important priorities', () => {
  const attrs = normalizeMarkdownHtmlAttrs({
    'class': 'custom',
    'for': 'input',
    'tabindex': '0',
    'aria-hidden': 'false',
    'disabled': '',
    'onclick': 'bad()',
    'ref': 'bad',
    'key': 'bad',
  });
  assert.equal(attrs.className, 'custom');
  assert.equal(attrs.htmlFor, 'input');
  assert.equal(attrs.tabIndex, '0');
  assert.equal(attrs['aria-hidden'], 'false');
  assert.equal(attrs.disabled, true);
  assert.equal(attrs.onclick, undefined);
  assert.equal(attrs.ref, undefined);
  assert.equal(attrs.key, undefined);
  const unusual = normalizeMarkdownHtmlAttrs({ constructor: 'own-attribute', hidden: false });
  assert.equal(unusual.constructor, 'own-attribute');
  assert.equal(unusual.hidden, false);
  assert.equal(normalizeMarkdownHtmlAttrs({ hidden: 'until-found' }).hidden, 'until-found');
  const parsed = getMarkdownHtmlStyle(
    '/*comment*/ --Case: "a;b"; -webkit-line-clamp:2; color:red!important; color:blue; color:green!important; padding-left:7px',
  );
  assert.equal(parsed.style.WebkitLineClamp, '2');
  assert.equal(parsed.style.color, 'green !important');
  const applied: unknown[] = [];
  parsed.apply({
    style: {
      setProperty(...args: unknown[]) {
        applied.push(args);
      },
    },
  } as unknown as HTMLElement);
  assert.deepEqual(applied, [
    ['--Case', ' "a;b"', ''],
    ['-webkit-line-clamp', '2', ''],
    ['color', 'green', 'important'],
    ['padding-left', '7px', ''],
  ]);
  assert.doesNotThrow(() => getMarkdownHtmlStyle('padding-left:7px; broken; color:blue'));
  assert.equal(getMarkdownHtmlStyle('padding-left:7px; broken; color:blue').style.color, 'blue');
});

test('Markdown heading SSR normalizes string style and class attributes from the parser', () => {
  const html = renderToStaticMarkup(
    h(MarkdownContainerNode, {
      node: {
        type: 'heading',
        level: 3,
        attrs: { class: 'own-heading', style: 'color:red;letter-spacing:2px' },
        children: [{ type: 'text', content: 'Heading', raw: 'Heading' }],
      },
    }),
  );
  assert.match(html, /<h3[^>]*own-heading/);
  assert.match(html, /style="color:red;letter-spacing:2px"/);
});

test('Markdown local node mappings compose with upstream children and caller overrides without global writes', () => {
  const before = getCustomNodeComponents();
  const ctx = { htmlPolicy: 'safe' as const, events: {}, customComponents: markdownComponents };
  const html = renderToStaticMarkup(
    h('div', null, [
      renderNode(
        {
          type: 'heading',
          level: 2,
          children: [
            {
              type: 'link',
              href: '/target',
              title: null,
              text: 'Linked',
              raw: '',
              children: [{ type: 'text', content: 'Linked', raw: 'Linked' }],
            },
          ],
          raw: '',
        },
        'heading',
        ctx,
      ),
      renderNode({ type: 'thematic_break', raw: '---' }, 'divider', ctx),
      renderNode({ type: 'checkbox_input', checked: true, raw: '[x]' }, 'task', ctx),
    ]),
  );
  assert.match(html, /<h2[^>]*sd-typography/);
  assert.match(html, /sd-link/);
  assert.match(html, /sd-divider/);
  assert.match(html, /<input[^>]*disabled=""[^>]*checked=""/);
  assert.doesNotMatch(html, /ctx="|node="|indexKey="/);
  const overridden = renderToStaticMarkup(
    renderNode({ type: 'heading', level: 2, children: [], raw: '' }, 'override', {
      ...ctx,
      customComponents: { ...markdownComponents, heading: () => h('h2', null, 'Caller heading') },
    }),
  );
  assert.equal(overridden, '<h2>Caller heading</h2>');
  assert.deepEqual(getCustomNodeComponents(), before);
});
