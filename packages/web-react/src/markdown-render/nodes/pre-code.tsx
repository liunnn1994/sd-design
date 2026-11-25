import type { CustomComponentMap, PreCodeNodeProps } from 'markstream-react';
import type { ComponentType, CSSProperties } from 'react';

import {
  getMarkdownPreCodeStyles,
  getMarkdownPreHeader,
  writeMarkdownCodeClipboard,
  markdownPreTooltipDelay,
  getMarkdownPreLanguage,
} from '@sdata/web-core/markdown/pre-code';
import {
  getLanguageIcon,
  languageMap,
  normalizeLanguageIdentifier,
  subscribeLanguageIconsRevision,
  Tooltip,
  useSafeI18n,
} from 'markstream-react';
import {
  createElement,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { MarkdownComponentsContext } from '../context.js';
import { MarkdownNestedRendererContext } from '../custom-children.js';
import { MarkdownPreDiff } from './pre-diff.js';

type Node = PreCodeNodeProps['node'];
export function MarkdownPreCodeBlock(props: { node: Node }) {
  const nested = useContext(MarkdownNestedRendererContext);
  const original = useContext(MarkdownComponentsContext);
  const context = nested?.codeContext;
  const settings = nested?.props.codeBlockProps ?? {};
  const { node } = props;
  const nativeLanguage = getMarkdownPreLanguage(node.language);
  const [copied, setCopied] = useState(false),
    [anchor, setAnchor] = useState<{ element: HTMLButtonElement; label: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tooltipId = useId();
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      clearTimeout(timer.current);
      clearTimeout(tooltipTimer.current);
    };
  }, []);
  const { t } = useSafeI18n();
  const code = context?.codeBlockOptions;
  const numbers = settings.showLineNumbers ?? code?.disableLineNumbers !== true;
  const language = normalizeLanguageIdentifier(node.language);
  const icon = useSyncExternalStore(
    subscribeLanguageIconsRevision,
    () => getLanguageIcon(language),
    () => getLanguageIcon(language),
  );
  const name = language
    ? languageMap[language] || language[0].toUpperCase() + language.slice(1)
    : languageMap[''] || 'Plain Text';
  const raw = String(node.raw ?? '');
  const diff =
    node.diff === true ||
    node.language?.trim().split(/\s+/, 1)[0] === 'diff' ||
    /^\s*(?:`{3,}|~{3,})diff(?:\s|$)/.test(raw);
  const theme = settings.theme;
  const resolvedTheme =
    typeof theme === 'string' || (theme && typeof theme === 'object' && !Array.isArray(theme))
      ? theme
      : undefined;
  const styles = getMarkdownPreCodeStyles({
    codeBlockOptions: code,
    showLineNumbers: numbers,
    diff,
    reservedHeightPx: Number(settings.reservedHeightPx),
    isDark: context?.isDark,
    theme: resolvedTheme,
    darkTheme: settings.darkTheme ?? context?.codeBlockThemes?.darkTheme,
    lightTheme: settings.lightTheme ?? context?.codeBlockThemes?.lightTheme,
    themes: settings.themes ?? context?.codeBlockThemes?.themes,
  });
  const header = getMarkdownPreHeader(raw, name, diff);
  const label = copied ? t('common.copied') || 'Copied' : t('common.copy') || 'Copy';
  const tooltip = settings.showTooltips ?? context?.showTooltips;
  useEffect(() => {
    if (!anchor || tooltip === false) return;
    anchor.element.setAttribute('aria-describedby', tooltipId);
    return () => {
      if (anchor.element.getAttribute('aria-describedby') === tooltipId)
        anchor.element.removeAttribute('aria-describedby');
    };
  }, [anchor, tooltip, tooltipId]);
  function showTooltip(element: HTMLButtonElement) {
    if (tooltip === false) return;
    clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(
      () => setAnchor({ element, label }),
      markdownPreTooltipDelay.show,
    );
  }
  function hideTooltip() {
    clearTimeout(tooltipTimer.current);
    tooltipTimer.current = setTimeout(() => setAnchor(null), markdownPreTooltipDelay.hide);
  }
  async function copy() {
    try {
      const text = String(node.code ?? '');
      await writeMarkdownCodeClipboard(text, settings.clipboardWriter);
      if (!active.current) return;
      setCopied(true);
      context?.events.onCopy?.(text);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1000);
    } catch (error) {
      if (active.current) setCopied(false);
      console.error('[markstream-react] Failed to copy preformatted code.', error);
    }
  }
  const Override = original?.code_block;
  if (Override)
    return createElement(Override as ComponentType<Record<string, unknown>>, {
      ...props,
      ...settings,
      codeBlockOptions: code,
      isDark: context?.isDark,
      onCopy: context?.events.onCopy,
    });
  const text = node.loading
    ? String(node.code ?? '')
    : String(node.code ?? '').replace(/\r\n$|\n$|\r$/, '');
  const rows = text.split(/(?<=\n)|(?<=\r)(?!\n)/);
  if (/[\r\n]$/.test(text)) rows.push('');
  const lineCount = text.split(/\r\n|\n|\r/).length;
  const numbered: CSSProperties & Record<`--${string}`, string> = numbers
    ? {
        '--markstream-pre-line-number-width': `${Math.max(2, String(lineCount).length)}ch`,
        '--markstream-code-padding-left':
          'calc(var(--markstream-pre-line-number-padding-left, 2ch) + var(--markstream-pre-line-number-width, 2ch) + var(--markstream-pre-line-number-padding-right, 1ch) + var(--markstream-pre-line-number-separator-width, 2px) + var(--markstream-pre-line-number-gap-to-code, 1ch))',
      }
    : {};
  return (
    <div
      style={styles.container}
      className="code-block-container sd-markdown-pre-block rounded-lg border"
    >
      {settings.showHeader !== false && (
        <div className="code-block-header">
          <div className="code-header-main">
            <span
              className="icon-slot"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
            <div className="code-header-copy">
              <div className="code-header-title">{header.title}</div>
              {header.caption && <div className="code-header-caption">{header.caption}</div>}
            </div>
          </div>
          {settings.showCopyButton !== false && (
            <button
              type="button"
              className="copy-button code-action-btn"
              aria-label={label}
              onClick={() => {
                void copy();
              }}
              onMouseEnter={(event) => showTooltip(event.currentTarget)}
              onMouseLeave={hideTooltip}
              onFocus={(event) => showTooltip(event.currentTarget)}
              onBlur={hideTooltip}
            >
              <svg
                className="action-icon"
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="1em"
                height="1em"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {copied ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </>
                  )}
                </g>
              </svg>
            </button>
          )}
        </div>
      )}
      <div className="code-block-shell-content">
        {node.diff && numbers ? (
          <MarkdownPreDiff
            node={node}
            style={styles.pre}
            wrap={styles.wrap}
            inline={settings.diffInline === true || (diff && code?.diffStyle === 'unified')}
            theme={styles.theme}
            hideUnchangedRegions={settings.diffHideUnchangedRegions}
          />
        ) : (
          <pre
            className={`language-${nativeLanguage} code-pre-fallback${styles.wrap ? ' is-wrap' : ''}${numbers ? ' markstream-pre--line-numbers' : ''}`}
            style={{ ...styles.pre, ...numbered }}
            aria-busy={Boolean(node.loading)}
            aria-label={`Code block: ${nativeLanguage}`}
            data-language={nativeLanguage}
            data-markstream-code-theme={styles.theme}
            data-markstream-line-numbers={numbers ? '1' : undefined}
            tabIndex={0}
          >
            {numbers && styles.wrap ? (
              <code translate="no" className="markstream-pre__code markstream-pre__code--wrapped">
                {rows.map((row, index) => (
                  <span
                    key={index}
                    className="markstream-pre__logical-line"
                    data-line-number={index + 1}
                  >
                    {row}
                  </span>
                ))}
              </code>
            ) : (
              <>
                {numbers && (
                  <span className="markstream-pre__line-numbers" aria-hidden="true">
                    <span className="markstream-pre__line-numbers-text">
                      {Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')}
                    </span>
                  </span>
                )}
                <code translate="no" className="markstream-pre__code">
                  {text}
                </code>
              </>
            )}
          </pre>
        )}
      </div>
      <span className="sr-only" aria-live="polite" role="status">
        {copied ? t('common.copied') || 'Copied' : ''}
      </span>
      {tooltip !== false && anchor && (
        <Tooltip
          visible
          id={tooltipId}
          anchorEl={anchor.element}
          content={anchor.label}
          placement="top"
          {...(context?.isDark === undefined ? {} : { isDark: context.isDark })}
        />
      )}
    </div>
  );
}
export function getMarkdownPreComponents(
  components: CustomComponentMap,
  enabled: boolean,
): CustomComponentMap {
  if (!enabled) return components;
  return {
    ...components,
    code_block: components.code_block ?? MarkdownPreCodeBlock,
    mermaid: components.mermaid ?? MarkdownPreCodeBlock,
    infographic: components.infographic ?? MarkdownPreCodeBlock,
    d2: components.d2 ?? MarkdownPreCodeBlock,
    d2lang: components.d2lang ?? components.d2 ?? MarkdownPreCodeBlock,
  };
}
