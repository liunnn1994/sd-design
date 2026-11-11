import type { HtmlPolicy } from 'stream-markdown-parser';

import {
  convertHtmlAttrsToProps,
  sanitizeHtmlTokenAttrs,
  tokenAttrsToRecord,
} from 'stream-markdown-parser';

const builtins = new Set([
  'text',
  'paragraph',
  'heading',
  'code_block',
  'list',
  'list_item',
  'blockquote',
  'table',
  'table_row',
  'table_cell',
  'definition_list',
  'definition_item',
  'footnote',
  'footnote_reference',
  'footnote_anchor',
  'admonition',
  'hardbreak',
  'link',
  'image',
  'thematic_break',
  'math_inline',
  'math_block',
  'strong',
  'emphasis',
  'strikethrough',
  'highlight',
  'insert',
  'subscript',
  'superscript',
  'emoji',
  'checkbox',
  'checkbox_input',
  'inline_code',
  'html_inline',
  'html_block',
  'reference',
  'mermaid',
  'infographic',
  'd2',
  'vmr_container',
]);
export function isMarkdownBuiltinNode(type: string) {
  return builtins.has(type.trim().toLowerCase());
}

export function getMarkdownCustomNodeProps(
  node: { type?: string; tag?: string; attrs?: unknown },
  policy: HtmlPolicy = 'safe',
) {
  const value = (entry: unknown) =>
    entry === true ? '' : entry === false ? 'false' : entry == null ? null : String(entry);
  const raw = node.attrs;
  let attrs: Array<[string, string | null]> | null = null;
  if (Array.isArray(raw)) {
    attrs = raw.every(Array.isArray)
      ? raw.map(([name, entry]) => [String(name), value(entry)])
      : raw
          .filter(
            (entry) =>
              entry && typeof entry === 'object' && !Array.isArray(entry) && 'name' in entry,
          )
          .map((entry) => [String(entry.name), value(entry.value)]);
  } else if (raw && typeof raw === 'object') {
    attrs = Object.entries(raw).map(([name, entry]) => [name, value(entry)]);
  }
  return convertHtmlAttrsToProps(
    tokenAttrsToRecord(
      sanitizeHtmlTokenAttrs(attrs, policy, String(node.tag || node.type || '').trim()),
    ),
  );
}
