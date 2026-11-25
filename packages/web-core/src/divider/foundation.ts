export interface DividerOptions {
  direction?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'center' | 'right';
  type?: 'solid' | 'dashed' | 'dotted' | 'double' | undefined;
  size?: number | undefined;
  margin?: number | string | undefined;
}

/** Vue 与 React 共用的分割线样式规则。 */
export function getDividerStyle({ direction = 'horizontal', type, size, margin }: DividerOptions) {
  const horizontal = direction === 'horizontal';
  const styles: {
    borderBottomWidth?: string;
    borderLeftWidth?: string;
    borderBottomStyle?: DividerOptions['type'];
    borderLeftStyle?: DividerOptions['type'];
    margin?: string;
  } = {};
  if (size !== undefined) {
    styles[horizontal ? 'borderBottomWidth' : 'borderLeftWidth'] = `${size}px`;
  }
  if (type) {
    styles[horizontal ? 'borderBottomStyle' : 'borderLeftStyle'] = type;
  }
  if (margin !== undefined) {
    const value = typeof margin === 'number' ? `${margin}px` : margin;
    styles.margin = horizontal ? `${value} 0` : `0 ${value}`;
  }
  return styles;
}
