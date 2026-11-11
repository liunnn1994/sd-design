import { getDividerStyle } from '@sdata/web-core/divider/foundation';

import type { DividerProps } from './types.js';

import { usePrefix } from '../config-provider/index.js';

export type { DividerProps } from './types.js';

export function Divider({
  direction = 'horizontal',
  orientation = 'center',
  type,
  size,
  margin,
  children,
  className,
  style,
  ...attributes
}: DividerProps) {
  const prefix = usePrefix('divider');
  const hasText = children !== undefined && children !== null && typeof children !== 'boolean';
  return (
    <div
      {...attributes}
      role="separator"
      aria-orientation={direction}
      className={[
        `${prefix}`,
        `${prefix}-${direction}`,
        hasText && `${prefix}-with-text`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...getDividerStyle({ direction, type, size, margin }), ...style }}
    >
      {hasText && direction === 'horizontal' && (
        <span className={`${prefix}-text ${prefix}-text-${orientation}`}>{children}</span>
      )}
    </div>
  );
}

export default Divider;
