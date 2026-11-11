import type { AvatarShape } from '@sdata/web-core/avatar/types';
import type { ComponentPropsWithRef, CSSProperties } from 'react';

import { createAvatarGroupFoundation } from '@sdata/web-core/avatar/group';
import { isValidElement } from 'react';

import type { TriggerProps } from '../trigger/index.js';

import { getRenderItems } from '../_shared/children.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Popover } from '../popover/index.js';
import { AvatarGroupContext } from './context.js';
import { Avatar } from './index.js';

export interface AvatarGroupProps extends ComponentPropsWithRef<'div'> {
  shape?: AvatarShape;
  size?: number;
  autoFixFontSize?: boolean;
  maxCount?: number;
  zIndexAscend?: boolean;
  maxStyle?: CSSProperties;
  maxPopoverTriggerProps?: Omit<TriggerProps, 'children'>;
}

export function AvatarGroup({
  shape = 'circle',
  size,
  autoFixFontSize = true,
  maxCount = 0,
  zIndexAscend = false,
  maxStyle,
  maxPopoverTriggerProps,
  children,
  className,
  ...attrs
}: AvatarGroupProps) {
  const prefix = usePrefix('avatar-group');
  const { rtl } = useConfig();
  const items = getRenderItems(children).filter((item) => isValidElement(item.content));
  const foundation = createAvatarGroupFoundation({ maxCount });
  const visible = foundation.getVisibleAvatars(items);
  const overflow = foundation.getOverflowAvatars(items);
  const group = { shape, size, autoFixFontSize, zIndexAscend, total: items.length };
  const renderItems = (list: typeof items) =>
    list.map((item, index) => (
      <AvatarGroupContext.Provider key={item.key} value={{ ...group, index }}>
        {item.content}
      </AvatarGroupContext.Provider>
    ));
  return (
    <div
      {...attrs}
      className={[prefix, rtl && `${prefix}-rtl`, className].filter(Boolean).join(' ')}
    >
      {renderItems(visible)}
      {overflow.length > 0 && (
        <AvatarGroupContext.Provider value={{ ...group, index: visible.length }}>
          <Popover
            {...maxPopoverTriggerProps}
            content={<div className={`${prefix}-popover`}>{renderItems(overflow)}</div>}
          >
            <Avatar className={`${prefix}-max-count-avatar`} style={maxStyle}>
              +{overflow.length}
            </Avatar>
          </Popover>
        </AvatarGroupContext.Provider>
      )}
    </div>
  );
}
