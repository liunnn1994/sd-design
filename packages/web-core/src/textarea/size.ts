export type TextareaAutoSize = boolean | { minRows?: number; maxRows?: number };

const sizeStyles = [
  'border-width',
  'box-sizing',
  'font-family',
  'font-weight',
  'font-size',
  'font-variant',
  'letter-spacing',
  'line-height',
  'padding-top',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'text-indent',
  'text-rendering',
  'text-transform',
  'white-space',
  'overflow-wrap',
  'width',
];

export function getSizeStyles(style: Pick<CSSStyleDeclaration, 'getPropertyValue'>) {
  return Object.fromEntries(sizeStyles.map((name) => [name, style.getPropertyValue(name)]));
}

export function getTextareaHeightLimits(
  styles: Record<string, string>,
  autoSize: TextareaAutoSize,
) {
  const lineHeight = Number.parseInt(styles['line-height'] || '0', 10);
  const outerHeight =
    Number.parseInt(styles['border-width'] || '0', 10) * 2 +
    Number.parseInt(styles['padding-top'] || '0', 10) +
    Number.parseInt(styles['padding-bottom'] || '0', 10);
  const rows = typeof autoSize === 'object' ? autoSize : undefined;
  return {
    minHeight: rows?.minRows ? rows.minRows * lineHeight + outerHeight : 0,
    maxHeight: rows?.maxRows ? rows.maxRows * lineHeight + outerHeight : 0,
  };
}

export function getTextareaAutoStyle(
  mirrorHeight: number,
  limits: { minHeight: number; maxHeight: number },
) {
  let height = mirrorHeight;
  let overflow = 'hidden';
  if (limits.minHeight && height < limits.minHeight) height = limits.minHeight;
  if (limits.maxHeight && height > limits.maxHeight) {
    height = limits.maxHeight;
    overflow = 'auto';
  }
  return { height: `${height}px`, resize: 'none' as const, overflow };
}
