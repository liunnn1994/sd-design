export interface MarkdownCodeHeightOptions {
  rendererKind: 'pre' | 'stream-diffs';
  codeBlockOptions?: {
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    maxHeight?: number;
    padding?: number;
    tabSize?: number;
    overflow?: string;
    disableLineNumbers?: boolean;
    diffStyle?: string;
  };
  codeBlockProps?: { showHeader?: boolean; showLineNumbers?: boolean };
}
type CodeNode = Record<string, unknown>;
const splitLines = (text: string) => text.split(/\r\n|\n|\r/);
const source = (value: unknown, loading = false) => {
  const text = String(value ?? '');
  return loading ? text : text.replace(/\r\n$|\n$|\r$/, '');
};
const positive = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
export function getMarkdownCodeVisualOptions(
  code: MarkdownCodeHeightOptions['codeBlockOptions'] = {},
) {
  const fontSize = positive(code.fontSize, 12);
  return {
    fontSize,
    fontFamily:
      code.fontFamily?.trim() ||
      '"SF Mono", Monaco, Consolas, "Ubuntu Mono", "Liberation Mono", "Courier New", monospace',
    lineHeight: positive(
      code.lineHeight,
      fontSize === 12 ? 18 : Math.max(12, Math.round(1.5 * fontSize)),
    ),
    padding:
      typeof code.padding === 'number' && Number.isFinite(code.padding) && code.padding >= 0
        ? code.padding
        : 8,
    maxHeight: positive(code.maxHeight, 500),
    tabSize: positive(code.tabSize, 4),
    overflow: code.overflow ?? 'wrap',
  };
}
const diffHeaders = ['diff ', 'index ', '--- ', '+++ ', '@@ '];
function logicalLines(node: CodeNode, unified: boolean) {
  if (!node.diff) return splitLines(source(node.code, node.loading === true)).length;
  if (unified) {
    const raw = source(node.raw);
    if (raw) {
      const lines = raw.split(/\r?\n/);
      return Math.max(
        1,
        node.originalCode != null || node.updatedCode != null
          ? lines.filter((line) => !diffHeaders.some((header) => line.startsWith(header))).length
          : lines.length,
      );
    }
    return (
      splitLines(source(node.originalCode)).length + splitLines(source(node.updatedCode)).length
    );
  }
  if (node.originalCode != null || node.updatedCode != null)
    return Math.max(
      splitLines(source(node.originalCode)).length,
      splitLines(source(node.updatedCode)).length,
    );
  let original = 0,
    updated = 0;
  for (const line of source(node.code).split(/\r?\n/)) {
    if (line.startsWith('+') && !line.startsWith('+++')) updated++;
    else if (line.startsWith('-') && !line.startsWith('---')) original++;
    else {
      original++;
      updated++;
    }
  }
  return Math.max(1, original, updated);
}
function wrappedLines(line: string, columns: number, tabSize: number) {
  let length = 0;
  for (const char of line)
    length += char === '\t' ? tabSize - (length % tabSize) : char >= '\u1100' ? 2 : 1;
  return Math.max(1, Math.ceil(length / columns));
}
// Geometry and diff counting follow the pinned markstream-vue 2.0.18 renderer.
export function estimateMarkdownCodeHeight(
  value: unknown,
  width: number,
  options: MarkdownCodeHeightOptions,
) {
  if (!value || typeof value !== 'object') return null;
  const node = value as CodeNode;
  if (node.type !== 'code_block') return null;
  const code = options.codeBlockOptions ?? {},
    props = options.codeBlockProps ?? {};
  const unified = code.diffStyle === 'unified';
  const pre = options.rendererKind === 'pre';
  let height: number;
  let maximum = 500;
  if (!pre) height = logicalLines(node, unified) * 18 + (node.diff ? 0 : 16);
  else {
    const visual = getMarkdownCodeVisualOptions(code);
    const { fontSize, lineHeight, padding } = visual;
    maximum = visual.maxHeight;
    let lines = logicalLines(node, unified);
    if ((code.overflow ?? 'wrap') === 'wrap' && Number.isFinite(width) && width > 0) {
      const charWidth = Math.max(1, 0.6 * fontSize),
        tabSize = positive(code.tabSize, 4);
      const split = Boolean(node.diff) && !unified;
      const original = splitLines(source(node.originalCode)),
        updated = splitLines(source(node.updatedCode));
      const text = node.diff
        ? source(node.raw) ||
          [source(node.originalCode), source(node.updatedCode)].filter(Boolean).join('\n')
        : source(node.code, node.loading === true);
      const rows = splitLines(text);
      const count = split ? Math.max(original.length, updated.length) : rows.length;
      const numbers = props.showLineNumbers ?? code.disableLineNumbers !== true;
      const gutter = numbers
        ? 3 * charWidth + Math.max(2, String(Math.max(1, count)).length) * charWidth + 2
        : 0;
      const horizontalPadding = code.padding == null ? charWidth : padding;
      const columns = Math.max(
        1,
        Math.floor((width / (split ? 2 : 1) - gutter - 2 * horizontalPadding) / charWidth),
      );
      if (!split) lines = rows.reduce((sum, row) => sum + wrappedLines(row, columns, tabSize), 0);
      else if (node.originalCode != null || node.updatedCode != null) {
        lines = 0;
        for (let index = 0; index < count; index++)
          lines += Math.max(
            wrappedLines(original[index] ?? '', columns, tabSize),
            wrappedLines(updated[index] ?? '', columns, tabSize),
          );
      }
    }
    height = Math.round(lines * lineHeight + 2 * padding);
  }
  const contentHeight = Math.max(1, Math.min(height, maximum));
  return {
    kind: 'code-block' as const,
    height: Math.round(contentHeight + (props.showHeader === false ? 0 : pre ? 37 : 40)),
    contentHeight,
    rendererKind: options.rendererKind,
    ...(node.diff && !pre ? { diffInline: unified } : {}),
  };
}
