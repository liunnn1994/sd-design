import type { ComponentRef as ReactComponentRef } from 'react';

import { getSpaceAlign, getSpaceStyle } from '@sdata/web-core/space/foundation';
import { Fragment } from 'react';

import type { SpaceProps } from './types.js';

import { getRenderItems } from '../_shared/children.js';
import { usePrefix, useConfig } from '../config-provider/index.js';

export type { SpaceProps } from './types.js';

export function Space({
  align,
  direction = 'horizontal',
  size = 'small',
  wrap = false,
  fill = false,
  split,
  children,
  className,
  style,
  ...attributes
}: SpaceProps) {
  const prefix = usePrefix('space');
  const config = useConfig();
  const resolvedAlign = getSpaceAlign({ align, direction });
  return (
    <div
      {...attributes}
      className={[
        `${prefix}`,
        `${prefix}-${direction}`,
        resolvedAlign && `${prefix}-align-${resolvedAlign}`,
        config.rtl && `${prefix}-rtl`,
        wrap && `${prefix}-wrap`,
        fill && `${prefix}-fill`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...getSpaceStyle({ size }), ...style }}
    >
      {getRenderItems(children).map((item, index) => (
        <Fragment key={item.key}>
          {split != null && index > 0 && <div className={`${prefix}-item-split`}>{split}</div>}
          <div className={`${prefix}-item`}>{item.content}</div>
        </Fragment>
      ))}
    </div>
  );
}

export default Space;

export type SpaceInstance = ReactComponentRef<typeof Space>;
