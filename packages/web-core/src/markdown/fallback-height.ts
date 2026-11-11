type HeightNode = Record<string, unknown>;
const branches = ['children', 'items', 'cells', 'rows'];
const leaves = new Set(['text', 'inline_code', 'emoji', 'footnote_reference']);
const inline = new Set([
  'strong',
  'emphasis',
  'strikethrough',
  'highlight',
  'insert',
  'subscript',
  'superscript',
  'link',
]);
function asNode(value: unknown): HeightNode | undefined {
  return value && typeof value === 'object' ? (value as HeightNode) : undefined;
}
function children(node: HeightNode, key: string): unknown[] {
  return Array.isArray(node[key]) ? node[key] : [];
}
function simpleInline(value: unknown): boolean {
  const node = asNode(value);
  return Boolean(
    node &&
    (leaves.has(String(node.type)) ||
      (inline.has(String(node.type)) && children(node, 'children').every(simpleInline))),
  );
}
function text(value: unknown): string {
  const node = asNode(value);
  if (!node) return '';
  if (node.type === 'text') return String(node.content ?? node.raw ?? '');
  if (node.type === 'inline_code') return String(node.code ?? node.content ?? node.raw ?? '');
  if (node.type === 'emoji') return String(node.name ?? node.raw ?? '');
  if (typeof node.text === 'string') return node.text;
  return branches
    .map((key) => children(node, key).map(text).filter(Boolean).join(' '))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function containsCode(value: unknown): boolean {
  const node = asNode(value);
  return Boolean(
    node &&
    (node.type === 'inline_code' || branches.some((key) => children(node, key).some(containsCode))),
  );
}
function lines(value: string, width: number) {
  return Math.max(
    1,
    value.split(/\r?\n/).length,
    Math.ceil(value.length / Math.max(18, Math.floor(Math.max(320, width) / 8))),
  );
}
function textHeight(value: string, width: number, minimum: number, lineHeight = 22) {
  return value ? Math.max(minimum, Math.ceil(lines(value, width) * lineHeight + 12)) : minimum;
}
function diagramHeight(code: string, language: string) {
  if (language === 'infographic') {
    const items = code.split(/\r?\n/).filter((line) => /^\s*-\s+/.test(line)).length;
    return Math.min(500, Math.max(360, items >= 3 ? 500 : items > 0 ? 280 + 60 * items : 360));
  }
  const rows = code
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('%%'));
  const type = rows[0]?.match(/^([A-Z][\w-]*)\b/i)?.[1].toLowerCase() ?? '';
  const count = Math.max(1, rows.length);
  const height =
    type === 'gantt'
      ? 220 + 28 * count
      : type === 'sequencediagram'
        ? 180 + 26 * count
        : ['classdiagram', 'statediagram', 'erdiagram'].includes(type)
          ? 180 + 24 * count
          : ['flowchart', 'graph'].includes(type)
            ? 170 + 28 * count
            : 200 + 22 * count;
  return Math.min(500, Math.max(360, height));
}
export function getMarkdownStaticHeight(value: unknown, requestedWidth = 640): number {
  const node = asNode(value);
  if (!node) return 32;
  const width = Number.isFinite(requestedWidth) && requestedWidth > 0 ? requestedWidth : 640;
  const raw = String(node.raw ?? node.content ?? '');
  switch (node.type) {
    case 'heading': {
      const level = Number(node.level ?? node.depth);
      return level >= 4 ? 20 : level === 3 ? 30 : level === 2 ? 32 : 44;
    }
    case 'paragraph':
      return !raw || lines(raw, width) <= 1 ? 28 : textHeight(raw, width, 34);
    case 'list': {
      const items = children(node, 'items');
      if (!items.length) return 48;
      const minimum = Math.max(48, 30 * items.length + 12);
      const height =
        12 +
        items.reduce<number>((sum, item) => {
          const content = text(item) || String(asNode(item)?.raw ?? '');
          return sum + 30 + 26 * Math.max(0, lines(content, width) - 1);
        }, 0);
      const extra = Math.max(0, height - minimum);
      if (items.length > 20)
        return Math.round(
          minimum + Math.max(Math.round(2.4 * items.length), Math.min(extra, 3 * items.length)),
        );
      return Math.round(minimum + Math.min(extra, items.length > 8 ? 8 * items.length : extra));
    }
    case 'list_item':
      return textHeight(raw, width, 34);
    case 'blockquote':
      return textHeight(raw, width, 56);
    case 'table': {
      const rows = [...(node.header ? [node.header] : []), ...children(node, 'rows')];
      if (!rows.length)
        return Math.max(120, 38 * (Array.isArray(node.children) ? node.children.length : 3) + 48);
      return Math.max(
        120,
        Math.round(
          4 +
            rows.reduce<number>((sum, row) => {
              const cells = children(asNode(row) ?? {}, 'cells');
              const columns = Math.max(1, cells.length);
              const chars = Math.max(10, Math.floor(Math.max(80, (width - 32) / columns) / 8));
              const wrapped = Math.max(
                1,
                ...cells.map(
                  (cell) =>
                    Math.ceil((text(cell) || String(asNode(cell)?.raw ?? '')).length / chars) || 1,
                ),
              );
              return (
                sum +
                54 +
                34 * Math.max(0, wrapped - 1) +
                (columns <= 3 && cells.some(containsCode) ? 14 : 0)
              );
            }, 0),
        ),
      );
    }
    case 'code_block': {
      const code = String(node.code ?? node.raw ?? '');
      const language = String(node.language ?? '')
        .trim()
        .toLowerCase();
      return language === 'mermaid' || language === 'infographic'
        ? diagramHeight(code, language)
        : textHeight(code, width, 96, 20);
    }
    case 'math_block':
      return 72;
    case 'image':
      return 220;
    case 'admonition':
    case 'vmr_container':
    case 'html_block': {
      const details = raw.match(/^\s*<details\b([^>]*)>/i);
      if (details && !/(?:^|\s)open(?:\s|=|$)/i.test(details[1] ?? '')) {
        const summary =
          raw
            .match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i)?.[1]
            .replace(/<[^>]*>/g, '')
            .trim() || 'Details';
        return textHeight(summary, width, 28, 28);
      }
      return textHeight(raw, width, 96);
    }
    case 'thematic_break':
      return 24;
    default:
      return textHeight(raw, width, 40);
  }
}

export function getMarkdownFallbackHeight(
  value: unknown,
  width: number,
  average: number,
  customParagraph = false,
) {
  const node = asNode(value);
  const height = getMarkdownStaticHeight(value, width);
  return node?.type === 'heading' ||
    (node?.type === 'paragraph' &&
      height <= 28 &&
      !customParagraph &&
      children(node, 'children').every(simpleInline))
    ? height
    : Math.max(average, height);
}
