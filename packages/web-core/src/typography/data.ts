import type { BaseProps, EllipsisConfig } from './types.js';

import { isObject } from '../_utils/is.js';
import { omit } from '../_utils/omit.js';
export function normalizeTypographyEllipsis<Popup>(
  config: EllipsisConfig,
  components: { popover: Popup; tooltip: Popup },
) {
  const showTooltip = Boolean(config.showTooltip);
  const TooltipComponent =
    isObject(config.showTooltip) && config.showTooltip.type === 'popover'
      ? components.popover
      : components.tooltip;
  const tooltipProps = (isObject(config.showTooltip) && config.showTooltip.props) || {};
  return {
    rows: 1,
    suffix: '',
    ellipsisStr: '...',
    expandable: false,
    ...omit(config, ['showTooltip']),
    showTooltip,
    TooltipComponent,
    tooltipProps,
  };
}

export function getTypographyContentTags(
  props: Pick<BaseProps, 'bold' | 'underline' | 'delete' | 'code' | 'mark'>,
) {
  const tags: (keyof HTMLElementTagNameMap)[] = [];
  if (props.bold) tags.push('b');
  if (props.underline) tags.push('u');
  if (props.delete) tags.push('del');
  if (props.code) tags.push('code');
  if (props.mark) tags.push('mark');
  return tags;
}
export function getTypographyMarkStyle(props: Pick<BaseProps, 'mark'>) {
  const style: Record<string, string> = {};
  if (isObject(props.mark) && props.mark.color) style.backgroundColor = props.mark.color;
  return style;
}
export const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
export const styleAttribute = (style?: Record<string, string>) => {
  const text = style
    ? Object.entries(style)
        .map(([name, value]) => `${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}:${value}`)
        .join(';')
    : '';
  return text ? ` style="${escapeHtml(text)}"` : '';
};
// 与 TypographyContent 的标签包裹顺序保持一致：外层为最后一个标签（mark 最外），
// 自定义 mark 颜色通过内联 style 注入到 mark 标签上。
export function getTypographyRichHtml(
  contentTags: (keyof HTMLElementTagNameMap)[],
  markStyle: Record<string, string>,
  fullText: string,
) {
  return contentTags.reduce((html, tag) => {
    const style = tag === 'mark' ? styleAttribute(markStyle) : '';
    return `<${tag}${style}>${html}</${tag}>`;
  }, escapeHtml(fullText));
}
