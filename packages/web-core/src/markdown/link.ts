import { sanitizeHtmlAttrs, shouldOpenLinkInNewTab } from 'stream-markdown-parser';

export interface MarkdownLinkNode {
  href: string;
  attrs?: readonly (readonly [string, string | null])[] | null;
}
export interface MarkdownLinkData {
  attrs: Record<string, string>;
  href: string | undefined;
  target: string | undefined;
  rel: string | undefined;
}
export function getMarkdownLinkData(
  node: MarkdownLinkNode,
  hostAttrs: Record<string, string> = {},
): MarkdownLinkData {
  const attrs = sanitizeHtmlAttrs(
    {
      ...hostAttrs,
      ...Object.fromEntries((node.attrs ?? []).map(([name, value]) => [name, value ?? ''])),
    },
    'safe',
    'a',
  );
  const href = sanitizeHtmlAttrs({ href: node.href }, 'safe', 'a').href;
  const target = attrs.target || (href && shouldOpenLinkInNewTab(href) ? '_blank' : undefined);
  const tokens = new Set(
    (attrs.rel ?? '').split(/\s+/).filter((token) => token && token.toLowerCase() !== 'opener'),
  );
  if (target === '_blank') {
    tokens.add('noopener');
    tokens.add('noreferrer');
  }
  return { attrs, href, target, rel: [...tokens].join(' ') || undefined };
}

export interface MarkdownLinkStyleOptions {
  color?: string | undefined;
  underlineHeight?: number | undefined;
  underlineBottom?: number | string | undefined;
  animationDuration?: number | undefined;
  animationOpacity?: number | undefined;
  animationTiming?: string | undefined;
  animationIteration?: string | number | undefined;
}
export function getMarkdownLinkLoadingStyle({
  color,
  underlineHeight = 2,
  underlineBottom = -3,
  animationDuration = 1.6,
  animationOpacity = 0.35,
  animationTiming = 'ease-in-out',
  animationIteration = 'infinite',
}: MarkdownLinkStyleOptions) {
  return {
    color,
    '--sd-markdown-link-underline-height': `${underlineHeight}px`,
    '--sd-markdown-link-underline-bottom':
      typeof underlineBottom === 'number' ? `${underlineBottom}px` : underlineBottom,
    '--sd-markdown-link-opacity': String(animationOpacity),
    '--sd-markdown-link-rest-opacity': String(
      Math.max(0.12, Math.min(animationOpacity * 0.5, animationOpacity)),
    ),
    '--sd-markdown-link-duration': `${animationDuration}s`,
    '--sd-markdown-link-timing': animationTiming,
    '--sd-markdown-link-iteration': String(animationIteration),
  };
}
