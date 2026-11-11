import type { PreparedText } from '@chenglou/pretext';

export interface MarkdownTextFontProfile {
  font: string;
  lineHeight: number;
  wrapperOverhead: number;
  widthAdjustment: number;
  whiteSpace?: 'pre-wrap';
}
export interface MarkdownTextProbeProfile {
  paragraph: MarkdownTextFontProfile | null;
  listItem: MarkdownTextFontProfile | null;
  listWrapperOverhead: number;
  headings: Partial<Record<number, MarkdownTextFontProfile | null>>;
}
export interface MarkdownTextHeightEstimate {
  kind: 'simple-text';
  height: number;
  contentHeight: number;
}
type TextLayout = typeof import('@chenglou/pretext');
let layoutEngine: TextLayout | undefined;
let loading: Promise<void> | undefined;
let canvasSupported: boolean | undefined;
const prepared = new Map<string, PreparedText>();
const estimates = new Map<string, MarkdownTextHeightEstimate>();

export function loadMarkdownTextLayout(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  return (loading ??= import('@chenglou/pretext')
    .then((engine) => {
      layoutEngine = engine;
    })
    .catch(() => undefined));
}
function remember<Value>(cache: Map<string, Value>, key: string, value: Value, limit: number) {
  cache.delete(key);
  cache.set(key, value);
  while (cache.size > limit) cache.delete(cache.keys().next().value!);
  return value;
}
export function clearMarkdownTextHeightCache() {
  layoutEngine?.clearCache();
  prepared.clear();
  estimates.clear();
}
function measureText(
  text: string,
  width: number,
  profile: MarkdownTextFontProfile,
): MarkdownTextHeightEstimate | null {
  if (!layoutEngine || typeof document === 'undefined') return null;
  try {
    canvasSupported ??= Boolean(document.createElement('canvas').getContext('2d'));
    if (!canvasSupported) return null;
    const roundedWidth = Math.round(width * 100) / 100;
    const whiteSpace = profile.whiteSpace ?? 'pre-wrap';
    const key = [
      whiteSpace,
      profile.font,
      profile.lineHeight,
      profile.wrapperOverhead,
      profile.widthAdjustment,
      roundedWidth,
      text,
    ].join('\0');
    const cached = estimates.get(key);
    if (cached) return remember(estimates, key, cached, 4000);
    const prepareKey = [whiteSpace, profile.font, text].join('\0');
    const input = remember(
      prepared,
      prepareKey,
      prepared.get(prepareKey) ?? layoutEngine.prepare(text, profile.font, { whiteSpace }),
      240,
    );
    const result = layoutEngine.layout(
      input,
      Math.max(24, roundedWidth - profile.widthAdjustment),
      profile.lineHeight,
    );
    const contentHeight = Math.max(profile.lineHeight, result.height);
    return remember(
      estimates,
      key,
      {
        kind: 'simple-text',
        height: Math.max(profile.lineHeight, Math.round(contentHeight + profile.wrapperOverhead)),
        contentHeight: Math.round(contentHeight),
      },
      4000,
    );
  } catch {
    return null;
  }
}
function inlineText(children: unknown): string | null {
  if (!Array.isArray(children) || !children.length) return null;
  let text = '';
  for (const child of children) {
    if (!child || typeof child !== 'object') return null;
    if (child.type === 'text') text += String(child.content ?? '');
    else if (child.type === 'emoji') text += String(child.name ?? child.raw ?? '');
    else if (child.type === 'hardbreak') text += '\n';
    else return null;
  }
  return text || null;
}
export function estimateMarkdownTextHeight(
  value: unknown,
  width: number,
  profile: MarkdownTextProbeProfile | undefined,
  measure: (
    text: string,
    width: number,
    font: MarkdownTextFontProfile,
  ) => MarkdownTextHeightEstimate | null = measureText,
): MarkdownTextHeightEstimate | null {
  if (!profile || !value || typeof value !== 'object' || !Number.isFinite(width) || width <= 0)
    return null;
  const node = value as Record<string, unknown>;
  if (node.type === 'paragraph' || node.type === 'heading') {
    const text = inlineText(node.children);
    const font =
      node.type === 'paragraph' ? profile.paragraph : profile.headings[Number(node.level ?? 0)];
    return text && font ? measure(text, width, font) : null;
  }
  if (node.type === 'list_item') {
    const children = node.children;
    if (
      !Array.isArray(children) ||
      children.length !== 1 ||
      children[0]?.type !== 'paragraph' ||
      !profile.listItem
    )
      return null;
    const text = inlineText(children[0].children);
    return text ? measure(text, width, profile.listItem) : null;
  }
  if (node.type === 'list') {
    if (!Array.isArray(node.items) || !node.items.length) return null;
    let height = Math.max(0, profile.listWrapperOverhead);
    for (const item of node.items) {
      const estimate = estimateMarkdownTextHeight(item, width, profile, measure);
      if (!estimate) return null;
      height += estimate.height;
    }
    return {
      kind: 'simple-text',
      height: Math.max(1, Math.round(height)),
      contentHeight: Math.max(1, Math.round(height)),
    };
  }
  return null;
}
export function readMarkdownTextFontProfile(
  wrapper: HTMLElement | null,
  content: HTMLElement | null,
): MarkdownTextFontProfile | null {
  const view = content?.ownerDocument.defaultView;
  if (!wrapper || !content || !view) return null;
  const style = view.getComputedStyle(content);
  const fontSize = Number.parseFloat(style.fontSize) || 16;
  const lineHeight = Number.parseFloat(style.lineHeight) || fontSize * 1.5;
  return {
    font: `${style.fontStyle || 'normal'} ${style.fontWeight || '400'} ${style.fontSize || '16px'} ${style.fontFamily || 'sans-serif'}`,
    lineHeight,
    wrapperOverhead: Math.max(0, wrapper.offsetHeight - lineHeight),
    widthAdjustment: Math.max(
      0,
      wrapper.getBoundingClientRect().width - content.getBoundingClientRect().width,
    ),
    whiteSpace: 'pre-wrap',
  };
}
