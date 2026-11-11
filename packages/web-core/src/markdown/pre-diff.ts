import type { DiffPreviewPane } from 'markstream-core';

export { buildDiffPreviewPanes, createDiffMatchCache } from 'markstream-core';
export type { DiffPreviewCollapseOptions, DiffPreviewLine, DiffPreviewPane } from 'markstream-core';

export interface MarkdownPreDiffRow {
  rowHeight: number;
  originalHeight: number;
  modifiedHeight: number;
}
export function getMarkdownPreDiffMetadata(
  node: { originalCode?: unknown; updatedCode?: unknown; loading?: boolean },
  panes: readonly DiffPreviewPane[],
) {
  const sourceCount = (value: unknown) => {
    const text = String(value ?? '');
    const displayed = node.loading ? text : text.replace(/\r\n$|\n$|\r$/, '');
    return displayed ? displayed.split(/\r\n|\n|\r/).length : 0;
  };
  let maximum = Math.max(1, sourceCount(node.originalCode), sourceCount(node.updatedCode));
  let collapsed = false;
  for (const pane of panes)
    for (const line of pane.lines) {
      if (line.kind === 'collapsed') collapsed = true;
      if (typeof line.number === 'number') maximum = Math.max(maximum, line.number);
    }
  return { collapsed, numberWidth: `${Math.max(2, String(maximum).length)}ch` };
}
export function measureMarkdownPreDiffRows(
  element: HTMLElement,
  previous: readonly MarkdownPreDiffRow[] = [],
) {
  const view = element.ownerDocument.defaultView;
  if (!view) return previous;
  const style = view.getComputedStyle(element);
  const number = (value: string) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };
  const baseline =
    number(style.getPropertyValue('--markstream-pre-diff-line-height')) ||
    number(style.lineHeight) ||
    18;
  const original = element.querySelectorAll<HTMLElement>(
    '.markstream-pre__diff-pane--original .markstream-pre__diff-line',
  );
  const modified = element.querySelectorAll<HTMLElement>(
    '.markstream-pre__diff-pane--modified .markstream-pre__diff-line',
  );
  function height(row: HTMLElement | undefined) {
    if (!row) return baseline;
    if (row.classList.contains('markstream-pre__diff-line--collapsed')) return 32;
    return Math.max(
      baseline,
      Math.ceil(
        row.querySelector('.markstream-pre__diff-content')?.getBoundingClientRect().height ?? 0,
      ),
    );
  }
  const next = Array.from({ length: Math.max(original.length, modified.length) }, (_, index) => {
    const originalHeight = height(original[index]),
      modifiedHeight = height(modified[index]);
    return {
      originalHeight,
      modifiedHeight,
      rowHeight: Math.max(baseline, originalHeight, modifiedHeight),
    };
  });
  return next.length === previous.length &&
    next.every((row, index) => {
      const last = previous[index];
      return (
        Math.abs(row.rowHeight - last.rowHeight) <= 0.5 &&
        Math.abs(row.originalHeight - last.originalHeight) <= 0.5 &&
        Math.abs(row.modifiedHeight - last.modifiedHeight) <= 0.5
      );
    })
    ? previous
    : next;
}
export function observeMarkdownPreDiffRows(
  element: HTMLElement,
  update: (rows: readonly MarkdownPreDiffRow[]) => void,
) {
  const view = element.ownerDocument.defaultView;
  if (!view) return () => {};
  let frame: number | undefined,
    active = true;
  let rows: readonly MarkdownPreDiffRow[] = [];
  function schedule() {
    if (!active || frame !== undefined) return;
    frame = view!.requestAnimationFrame(() => {
      frame = undefined;
      if (!active) return;
      const next = measureMarkdownPreDiffRows(element, rows);
      if (next !== rows) {
        rows = next;
        update(rows);
      }
    });
  }
  const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
  observer?.observe(element);
  schedule();
  return () => {
    active = false;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    observer?.disconnect();
  };
}
export function scheduleMarkdownPreDiffRefresh(root: HTMLElement) {
  const view = root.ownerDocument.defaultView;
  if (!view) return () => {};
  let active = true;
  const frame = view.requestAnimationFrame(() => {
    if (!active) return;
    for (const pre of root.querySelectorAll<HTMLElement>(
      'pre.code-pre-fallback.markstream-pre--diff-preview.is-wrap:not(.markstream-pre--diff-inline)',
    )) {
      const measured = measureMarkdownPreDiffRows(pre);
      for (const side of ['original', 'modified'] as const) {
        const rows = pre.querySelectorAll<HTMLElement>(
          `.markstream-pre__diff-pane--${side} .markstream-pre__diff-line`,
        );
        rows.forEach((row, index) => {
          const size = measured[index];
          if (!size) return;
          row.style.setProperty(
            '--markstream-pre-diff-synced-row-height',
            `${Math.ceil(size.rowHeight)}px`,
          );
          row.style.setProperty(
            '--markstream-pre-diff-content-height',
            `${Math.ceil(side === 'original' ? size.originalHeight : size.modifiedHeight)}px`,
          );
        });
      }
    }
  });
  return () => {
    active = false;
    view.cancelAnimationFrame(frame);
  };
}
