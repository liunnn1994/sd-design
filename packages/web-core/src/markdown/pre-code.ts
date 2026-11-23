import type { Properties } from 'csstype';

import type { MarkdownCodeHeightOptions } from './code-height.js';

import { getMarkdownCodeVisualOptions } from './code-height.js';

export const markdownPreTooltipDelay = { show: 80, hide: 120 } as const;
export function getMarkdownPreLanguage(value: unknown) {
  return (
    String(value ?? '')
      .split(/\s+/)[0]
      .toLowerCase()
      .replace(/[^\w-]/g, '') || 'plaintext'
  );
}

export interface MarkdownPreThemeOptions {
  isDark?: boolean;
  theme?: string | { light?: string; dark?: string };
  themes?: readonly [string, string];
  darkTheme?: string;
  lightTheme?: string;
}
export function getMarkdownPreTheme(options: MarkdownPreThemeOptions) {
  const mode = options.isDark ? 'dark' : 'light';
  const name =
    options.theme !== undefined
      ? typeof options.theme === 'string'
        ? options.theme
        : (options.theme[mode] ?? '')
      : ((options.isDark
          ? (options.darkTheme ?? options.themes?.[0])
          : (options.lightTheme ?? options.themes?.[1])) ?? `vitesse-${mode}`);
  const builtin = name === 'vitesse-dark' || name === 'vitesse-light';
  const dark =
    name === 'vitesse-dark' ||
    (name !== 'vitesse-light' &&
      (name
        ? /dark|night|moon|black|dracula|mocha|frappe|macchiato|ocean|poimandres|monokai|laserwave|tokyo|rose-pine|material-theme/.test(
            name.toLowerCase(),
          ) && !/light|latte|dawn|lotus/.test(name.toLowerCase())
        : Boolean(options.isDark)));
  const background = builtin
    ? dark
      ? '#121212'
      : '#ffffff'
    : dark
      ? 'var(--markstream-code-theme-bg, #121212)'
      : 'var(--markstream-code-theme-bg, #ffffff)';
  const foreground = builtin
    ? dark
      ? '#dbd7caee'
      : '#393a34'
    : dark
      ? 'var(--markstream-code-theme-fg, #dbd7caee)'
      : 'var(--markstream-code-theme-fg, #393a34)';
  const lineNumber = builtin
    ? dark
      ? '#dedcd550'
      : '#393a3450'
    : dark
      ? 'var(--markstream-code-theme-line-number, #dedcd550)'
      : 'var(--markstream-code-theme-line-number, #393a3450)';
  return {
    name,
    builtin,
    dark,
    background,
    foreground,
    lineNumber,
    addedLine: dark ? 'rgb(77 147 117 / 20%)' : 'rgb(30 117 79 / 12%)',
    addedNumber: dark ? 'rgb(77 147 117 / 15%)' : 'rgb(30 117 79 / 9%)',
    removedLine: dark ? 'rgb(203 118 118 / 20%)' : 'rgb(171 89 89 / 12%)',
    removedNumber: dark ? 'rgb(203 118 118 / 15%)' : 'rgb(171 89 89 / 9%)',
  };
}
type CodeStyle = Properties<string | number> & Record<`--${string}`, string | number | undefined>;
export function getMarkdownPreCodeStyles(
  options: MarkdownPreThemeOptions & {
    codeBlockOptions?: MarkdownCodeHeightOptions['codeBlockOptions'];
    showLineNumbers?: boolean;
    diff?: boolean;
    reservedHeightPx?: number;
  },
) {
  const code = getMarkdownCodeVisualOptions(options.codeBlockOptions),
    theme = getMarkdownPreTheme(options);
  const horizontal = options.codeBlockOptions?.padding == null ? '1ch' : `${code.padding}px`;
  const reserved =
    options.diff && Number.isFinite(options.reservedHeightPx) && options.reservedHeightPx! > 0
      ? `${Math.ceil(options.reservedHeightPx!)}px`
      : undefined;
  const colors: CodeStyle = {
    '--markstream-code-fallback-bg': theme.background,
    '--markstream-code-fallback-fg': theme.foreground,
    ...(theme.builtin
      ? {
          '--markstream-code-theme-bg': theme.background,
          '--markstream-code-theme-fg': theme.foreground,
          '--markstream-code-theme-line-number': theme.lineNumber,
        }
      : {}),
    '--markstream-diff-added-line-fill': `var(--sd-markdown-pre-added-line, ${theme.addedLine})`,
    '--markstream-diff-added-number-fill': `var(--sd-markdown-pre-added-number, ${theme.addedNumber})`,
    '--markstream-diff-editor-bg': theme.background,
    '--markstream-diff-removed-line-fill': `var(--sd-markdown-pre-removed-line, ${theme.removedLine})`,
    '--markstream-diff-removed-number-fill': `var(--sd-markdown-pre-removed-number, ${theme.removedNumber})`,
    '--markstream-diff-shell-bg': theme.background,
    '--markstream-pre-resolved-theme-bg': theme.background,
    '--markstream-pre-resolved-theme-fg': theme.foreground,
    '--markstream-pre-resolved-theme-line-number': theme.lineNumber,
    'backgroundColor': theme.background,
    'color': theme.foreground,
  };
  const pre: CodeStyle = {
    ...colors,
    '--markstream-code-font-family': code.fontFamily,
    '--markstream-code-padding-x': horizontal,
    '--markstream-code-padding-y': `${code.padding}px`,
    '--markstream-code-padding-bottom': `${code.padding}px`,
    '--markstream-code-scrollbar-gutter': '6px',
    '--markstream-code-tab-size': String(code.tabSize),
    ...(options.diff
      ? {
          '--markstream-pre-diff-line-height': `${code.lineHeight}px`,
          '--sd-markdown-pre-added-tint': theme.dark ? '#4d9375' : '#1e754f',
          '--sd-markdown-pre-removed-tint': theme.dark ? '#cb7676' : '#ab5959',
          '--sd-markdown-pre-line-bg-weight': theme.dark ? '80%' : '88%',
          '--sd-markdown-pre-number-bg-weight': theme.dark ? '85%' : '91%',
        }
      : {}),
    '--markstream-pre-line-number-top': `${code.padding}px`,
    '--markstream-pre-line-number-left': '0px',
    '--markstream-pre-line-number-padding-left': '2ch',
    '--markstream-pre-line-number-padding-right': '1ch',
    '--markstream-pre-line-number-separator-width': '2px',
    '--markstream-pre-line-number-gap-to-code': horizontal,
    '--markstream-diff-metadata-bg': theme.background,
    '--markstream-diff-metadata-fg': theme.lineNumber,
    '--markstream-diff-fallback-handoff-height': reserved ?? 'auto',
    'backgroundColor':
      'var(--markstream-code-fallback-bg, var(--markstream-code-theme-bg, var(--markstream-pre-resolved-theme-bg)))',
    'color':
      'var(--markstream-code-fallback-fg, var(--markstream-code-theme-fg, var(--markstream-pre-resolved-theme-fg)))',
    'boxSizing': 'border-box',
    'fontFamily': code.fontFamily,
    'fontSize': `${code.fontSize}px`,
    'lineHeight': `${code.lineHeight}px`,
    'margin': 0,
    'maxHeight': `${code.maxHeight}px`,
    'overflow': 'auto',
    'overflowX': code.overflow === 'wrap' ? 'hidden' : 'auto',
    'overflowY': 'auto',
    'paddingBottom': `${code.padding}px`,
    'paddingLeft': options.showLineNumbers ? 'var(--markstream-code-padding-left)' : horizontal,
    'paddingRight': horizontal,
    'paddingTop': `${code.padding}px`,
    'scrollbarGutter': options.diff ? 'auto' : 'stable',
    'tabSize': code.tabSize,
    'whiteSpace': code.overflow === 'scroll' ? 'pre' : 'pre-wrap',
    'overflowWrap': code.overflow === 'wrap' ? 'anywhere' : 'normal',
    'wordBreak': 'normal',
    'width': '100%',
    ...(reserved ? { height: reserved, minHeight: reserved } : {}),
  };
  return { pre, container: colors, theme: theme.name, wrap: code.overflow === 'wrap' };
}
export function getMarkdownPreHeader(raw: string, language: string, diff = false) {
  const first = raw.split(/\r?\n/, 1)[0]?.trim() ?? '';
  const info = first.match(/^(`{3,}|~{3,})(.*)$/)?.[2].trim() ?? '';
  const words = info.split(/\s+/).filter(Boolean);
  const filename = (words[0] === 'diff' ? words.slice(1) : words)
    .map((word) => (word.includes(':') ? word.slice(word.indexOf(':') + 1) : word))
    .find((word) => word && /[./\\-]/.test(word));
  return {
    title: filename || language,
    caption: filename ? (diff ? `Diff / ${language}` : language) : '',
  };
}
export async function writeMarkdownCodeClipboard(
  text: string,
  writer?: (text: string) => void | Promise<void>,
) {
  if (writer) return void (await writer(text));
  if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function')
    return navigator.clipboard.writeText(text);
  if (typeof document === 'undefined' || !document.body)
    throw new Error('Clipboard API is unavailable');
  const element = document.createElement('textarea');
  element.value = text;
  element.setAttribute('readonly', '');
  element.style.position = 'fixed';
  element.style.opacity = '0';
  document.body.appendChild(element);
  element.select();
  try {
    if (!document.execCommand('copy')) throw new Error('Clipboard copy command failed');
  } finally {
    element.remove();
  }
}
