import type { HtmlToken, HtmlPolicy } from 'stream-markdown-parser';

import {
  tokenizeHtml,
  sanitizeHtmlContent,
  sanitizeHtmlAttrs,
  STANDARD_HTML_TAGS,
  NON_STRUCTURING_HTML_TAGS,
} from 'stream-markdown-parser';

import { decodeHtmlEntities } from './html-entities.js';

export interface MarkdownHtmlState {
  readonly node: { readonly type?: string; readonly content: string; readonly loading?: boolean };
  readonly htmlPolicy: HtmlPolicy | undefined;
  readonly contextPolicy: HtmlPolicy | undefined;
  readonly policy: HtmlPolicy;
  readonly rawTokens: HtmlToken[];
  readonly safeTokens: HtmlToken[];
}
export interface MarkdownHtmlElement {
  tag: string;
  attrs: Record<string, string>;
  children: Array<MarkdownHtmlElement | string>;
}
export function createMarkdownHtmlFoundation(state: MarkdownHtmlState) {
  const getPolicy = () => state.htmlPolicy ?? state.contextPolicy ?? 'safe';
  const getRawTokens = () => tokenizeHtml(state.node.content);
  const getSafeTokens = () => {
    const content = sanitizeHtmlContent(state.node.content, state.policy);
    // 上游分词器丢弃纯空白文本；清洗后的标签间空白转成实体，供 buildTree 还原。
    return tokenizeHtml(
      content.replace(
        /(^|>)(\s+)(?=<|$)/g,
        (_, prefix: string, whitespace: string) =>
          prefix + Array.from(whitespace, (character) => `&#${character.charCodeAt(0)};`).join(''),
      ),
    );
  };
  const getCanAdapt = () =>
    state.policy !== 'escape' &&
    !state.node.loading &&
    state.safeTokens.some(
      (token) =>
        token.tagName &&
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'img', 'p'].includes(token.tagName),
    ) &&
    !state.rawTokens.some(
      (token) =>
        token.tagName &&
        (!STANDARD_HTML_TAGS.has(token.tagName) ||
          NON_STRUCTURING_HTML_TAGS.has(token.tagName) ||
          token.tagName === 'svg'),
    );
  const getHostTag = () => {
    const block =
      state.node.type === 'html_block' ||
      state.safeTokens.some((token) => token.tagName && BLOCK_TAGS.has(token.tagName));
    return block ? 'div' : 'span';
  };
  const BLOCK_TAGS = new Set([
    'address',
    'article',
    'aside',
    'blockquote',
    'caption',
    'dd',
    'details',
    'dialog',
    'div',
    'dl',
    'dt',
    'fieldset',
    'figcaption',
    'figure',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'hr',
    'legend',
    'li',
    'main',
    'menu',
    'nav',
    'ol',
    'p',
    'pre',
    'search',
    'section',
    'summary',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'ul',
  ]);
  function buildTree(source: HtmlToken[]): Array<MarkdownHtmlElement | string> {
    const roots: Array<MarkdownHtmlElement | string> = [];
    const stack: MarkdownHtmlElement[] = [];
    for (const token of source) {
      const children = stack.at(-1)?.children ?? roots;
      if (token.type === 'text') {
        children.push(decodeHtmlEntities(token.content ?? ''));
        continue;
      }
      if (token.type === 'tag_close') {
        const index = stack.findLastIndex((element) => element.tag === token.tagName);
        if (index >= 0) stack.length = index;
        continue;
      }
      const element: MarkdownHtmlElement = {
        tag: token.tagName ?? 'span',
        attrs: sanitizeHtmlAttrs(
          Object.fromEntries(
            Object.entries(token.attrs ?? {}).map(([name, value]) => [
              name,
              decodeHtmlEntities(value),
            ]),
          ),
          state.policy,
          token.tagName,
        ),
        children: [],
      };
      children.push(element);
      if (token.type === 'tag_open') stack.push(element);
    }
    return roots;
  }
  return { getPolicy, getRawTokens, getSafeTokens, getCanAdapt, getHostTag, buildTree };
}
