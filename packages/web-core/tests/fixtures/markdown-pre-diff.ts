import { measureMarkdownPreDiffRows } from '../../dist/markdown/pre-diff.js';

const start = Array.from({ length: 8 }, (_, index) => `start ${index + 1}`).join('\n');
const end = Array.from({ length: 9 }, (_, index) => `end ${index + 1}`).join('\n');
const source = {
  originalCode: `${start}\nold ${'wide text '.repeat(22)}\n${end}`,
  updatedCode: `${start}\nnew\nextra\n${end}`,
};
export const markdownDiffCases = {
  source: { ...source, code: '' },
  patch: {
    code: 'diff --git a/file.ts b/file.ts\nindex 123..456 100644\n--- a/file.ts\n+++ b/file.ts\n@@ -5,3 +5,4 @@\n context\n-old\n+new\n+extra\n tail\n',
  },
  blank: { code: '', originalCode: 'first\r\n\r\nold\r\n', updatedCode: 'first\r\n\r\nnew\r\n' },
  loading: {
    ...source,
    code: '',
    originalCode: source.originalCode + '\n',
    updatedCode: source.updatedCode + '\n',
    loading: true,
  },
  numbered: { code: '@@ -101,2 +101,2 @@\n-old\n+new\n same\n' },
};
export function getMarkdownDiffNode(name: keyof typeof markdownDiffCases = 'source') {
  return {
    type: 'code_block',
    language: 'typescript',
    raw: '```diff typescript /src/file.ts\ncode\n```',
    diff: true,
    loading: false,
    ...markdownDiffCases[name],
  };
}
export const markdownDiffScenarios = {
  dark: { options: { overflow: 'wrap' as const }, props: {} },
  split: { options: { overflow: 'wrap' as const }, props: {} },
  collapsed: {
    options: { overflow: 'wrap' as const },
    props: { diffHideUnchangedRegions: { contextLineCount: 1, minimumLineCount: 3 } },
  },
  inline: {
    options: { overflow: 'wrap' as const, diffStyle: 'unified' as const },
    props: { diffHideUnchangedRegions: true },
  },
  scroll: { options: { overflow: 'scroll' as const }, props: {} },
  reserved: {
    options: { overflow: 'wrap' as const },
    props: { reservedHeightPx: 160, diffHideUnchangedRegions: true },
  },
  plain: { options: { overflow: 'wrap' as const }, props: { showLineNumbers: false } },
};
export function captureMarkdownDiff(element: HTMLElement) {
  const pre = element.matches('pre')
    ? element
    : element.querySelector<HTMLElement>('pre.code-pre-fallback')!;
  const computed = (node: Element, pseudo?: string) =>
    node.ownerDocument.defaultView!.getComputedStyle(node, pseudo);
  const round = (value: number) => Math.round(value * 100) / 100;
  const rect = (node: Element) => ({
    width: round(node.getBoundingClientRect().width),
    height: round(node.getBoundingClientRect().height),
  });
  const rootStyle = computed(pre);
  return {
    ...rect(pre),
    busy: pre.getAttribute('aria-busy'),
    classes: [...pre.classList].filter((value) => value.startsWith('markstream-pre--')).sort(),
    styles: Object.fromEntries(
      [
        'font-size',
        'line-height',
        'padding-left',
        'padding-right',
        'padding-top',
        'padding-bottom',
        'overflow-x',
        'white-space',
        'max-height',
        '--markstream-pre-diff-line-number-width',
      ].map((name) => [name, rootStyle.getPropertyValue(name)]),
    ),
    panes: [...pre.querySelectorAll<HTMLElement>('.markstream-pre__diff-pane')].map((pane) => ({
      classes: pane.className,
      ...rect(pane),
      rows: [...pane.querySelectorAll<HTMLElement>('.markstream-pre__diff-line')].map((row) => {
        const content = row.querySelector<HTMLElement>('.markstream-pre__diff-content')!,
          number = row.querySelector<HTMLElement>('.markstream-pre__diff-number')!;
        return {
          classes: [...row.classList]
            .filter((value) => value !== 'markstream-pre__diff-line')
            .map((value) => value.replace('markstream-pre__diff-line--', ''))
            .join(' '),
          code: row.querySelector('.markstream-pre__diff-content-inner')?.textContent,
          number: number.textContent,
          ...rect(row),
          contentHeight: rect(content).height,
          numberHeight: rect(number).height,
          synced: row.style.getPropertyValue('--markstream-pre-diff-synced-row-height'),
          color: computed(number).color,
          fill: computed(row, '::before').backgroundColor,
        };
      }),
    })),
  };
}
export function isMarkdownDiffSynchronized(pre: HTMLElement) {
  const measured = measureMarkdownPreDiffRows(pre);
  return ['original', 'modified'].every((side) =>
    [
      ...pre.querySelectorAll<HTMLElement>(
        `.markstream-pre__diff-pane--${side} .markstream-pre__diff-line`,
      ),
    ].every((row, index) => {
      const expected = measured[index];
      return (
        expected &&
        Math.abs(
          Number.parseFloat(row.style.getPropertyValue('--markstream-pre-diff-synced-row-height')) -
            expected.rowHeight,
        ) <= 0.5 &&
        Math.abs(
          Number.parseFloat(row.style.getPropertyValue('--markstream-pre-diff-content-height')) -
            (side === 'original' ? expected.originalHeight : expected.modifiedHeight),
        ) <= 0.5
      );
    }),
  );
}
export function compactMarkdownDiffCapture(value: ReturnType<typeof captureMarkdownDiff>) {
  return {
    ...value,
    panes: value.panes.map(({ rows, ...pane }) => {
      const layouts: Omit<(typeof rows)[number], 'classes' | 'code' | 'number'>[] = [];
      const keys = new Map<string, number>();
      const compactRows = rows.map(({ classes, code, number, ...geometry }) => {
        const key = JSON.stringify(geometry);
        let layout = keys.get(key);
        if (layout === undefined) {
          layout = layouts.length;
          keys.set(key, layout);
          layouts.push(geometry);
        }
        return { classes, code, number, layout };
      });
      return { ...pane, layouts, rows: compactRows };
    }),
  };
}
