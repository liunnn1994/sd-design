import type {
  DiffPreviewCollapseOptions,
  MarkdownPreDiffRow,
} from '@sdata/web-core/markdown/pre-diff';
import type { PreCodeNodeProps } from 'markstream-react';
import type { CSSProperties } from 'react';

import { getMarkdownPreLanguage } from '@sdata/web-core/markdown/pre-code';
import {
  buildDiffPreviewPanes,
  createDiffMatchCache,
  getMarkdownPreDiffMetadata,
  observeMarkdownPreDiffRows,
} from '@sdata/web-core/markdown/pre-diff';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

export function MarkdownPreDiff({
  node,
  style,
  inline,
  wrap,
  theme,
  hideUnchangedRegions,
}: {
  node: PreCodeNodeProps['node'];
  style: CSSProperties;
  inline: boolean;
  wrap: boolean;
  theme: string;
  hideUnchangedRegions?: boolean | DiffPreviewCollapseOptions | undefined;
}) {
  const [cache] = useState(createDiffMatchCache);
  const collapse = typeof hideUnchangedRegions === 'object' ? hideUnchangedRegions : undefined;
  const panes = useMemo(
    () =>
      buildDiffPreviewPanes({
        ...node,
        inline,
        matchCache: cache,
        ...(hideUnchangedRegions === undefined ? {} : { hideUnchangedRegions }),
      }),
    [
      node.code,
      node.originalCode,
      node.updatedCode,
      node.raw,
      node.language,
      node.loading,
      inline,
      cache,
      hideUnchangedRegions,
      collapse?.enabled,
      collapse?.contextLineCount,
      collapse?.minimumLineCount,
    ],
  );
  const metadata = getMarkdownPreDiffMetadata(node, panes),
    language = getMarkdownPreLanguage(node.language);
  const root = useRef<HTMLPreElement>(null);
  const [rows, setRows] = useState<readonly MarkdownPreDiffRow[]>([]);
  useLayoutEffect(() => {
    if (!root.current || inline || !wrap) {
      setRows((previous) => (previous.length ? [] : previous));
      return;
    }
    return observeMarkdownPreDiffRows(root.current, setRows);
  }, [
    panes,
    inline,
    wrap,
    style.fontSize,
    style.fontFamily,
    style.lineHeight,
    style.paddingLeft,
    style.paddingRight,
    style.tabSize,
  ]);
  const styles = {
    ...style,
    '--markstream-pre-line-number-width': metadata.numberWidth,
    '--markstream-pre-diff-line-number-width': metadata.numberWidth,
    '--markstream-code-padding-left':
      'calc(var(--markstream-pre-line-number-padding-left, 2ch) + var(--markstream-pre-line-number-width, 2ch) + var(--markstream-pre-line-number-padding-right, 1ch) + var(--markstream-pre-line-number-separator-width, 2px) + var(--markstream-pre-line-number-gap-to-code, 1ch))',
  };
  return (
    <pre
      ref={root}
      className={`language-${language} code-pre-fallback markstream-pre--line-numbers markstream-pre--diff-preview${wrap ? ' is-wrap' : ''}${inline ? ' markstream-pre--diff-inline' : ''}${metadata.collapsed ? ' markstream-pre--diff-collapsed' : ''}`}
      style={styles}
      aria-busy={Boolean(node.loading)}
      aria-label={`Code block: ${language}`}
      data-language={language}
      data-markstream-code-theme={theme}
      data-markstream-line-numbers="1"
      data-markstream-pre="1"
      tabIndex={0}
    >
      <code translate="no" className="markstream-pre__diff-code">
        {panes.map((pane) => (
          <span key={pane.key} className={`markstream-pre__diff-pane ${pane.className}`}>
            <span className="markstream-pre__diff-pane-content">
              {pane.lines.map((line, index) => {
                const row = rows[index];
                const synced: (CSSProperties & Record<`--${string}`, string>) | undefined =
                  wrap && !inline && row
                    ? {
                        '--markstream-pre-diff-synced-row-height': `${Math.ceil(row.rowHeight)}px`,
                        '--markstream-pre-diff-content-height': `${Math.ceil(pane.key === 'original' ? row.originalHeight : row.modifiedHeight)}px`,
                      }
                    : undefined;
                return (
                  <span
                    key={line.key}
                    className={[
                      'markstream-pre__diff-line',
                      `markstream-pre__diff-line--${line.kind}`,
                      line.metadataKind &&
                        `markstream-pre__diff-line--metadata-${line.metadataKind}`,
                      line.empty && 'markstream-pre__diff-line--empty',
                      line.collapsedFirst && 'markstream-pre__diff-line--collapsed-first',
                      line.collapsedLast && 'markstream-pre__diff-line--collapsed-last',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={synced}
                  >
                    <span className="markstream-pre__diff-rail" aria-hidden="true" />
                    {line.kind === 'collapsed' && (
                      <span className="markstream-pre__diff-collapsed-icon" aria-hidden="true">
                        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                          <path d="M3.47 5.47a.75.75 0 0 1 1.06 0L8 8.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4a.75.75 0 0 1-1.06 0l-4-4a.75.75 0 0 1 0-1.06" />
                        </svg>
                      </span>
                    )}
                    <span className="markstream-pre__diff-number" aria-hidden="true">
                      {line.number}
                    </span>
                    <span className="markstream-pre__diff-content">
                      <span className="markstream-pre__diff-content-inner">{line.code}</span>
                    </span>
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}
