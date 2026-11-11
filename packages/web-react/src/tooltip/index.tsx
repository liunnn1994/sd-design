import { useMemo, useState } from 'react';

import type { ScrollbarExposed } from '../scrollbar/index.js';
import type { TriggerProps } from '../trigger/index.js';

import { usePopupVisible } from '../_shared/use-popup-visible.js';
import { usePrefix } from '../config-provider/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { Trigger } from '../trigger/index.js';

export interface TooltipProps extends Omit<TriggerProps, 'trigger'> {
  mouseThrough?: boolean;
  mini?: boolean;
  backgroundColor?: string;
}

export function Tooltip({
  children,
  content,
  popupVisible,
  defaultPopupVisible = false,
  disabled = false,
  mouseThrough = true,
  position = 'top',
  mini = false,
  backgroundColor,
  contentClass,
  contentStyle,
  arrowClass,
  arrowStyle,
  className,
  onPopupVisibleChange,
  ...attrs
}: TooltipProps) {
  const prefix = usePrefix('tooltip');
  const [overflowing, setOverflowing] = useState(false);
  const foundation = usePopupVisible(popupVisible, defaultPopupVisible, onPopupVisibleChange);
  const events = useMemo(() => {
    const update = (instance: NonNullable<ReturnType<ScrollbarExposed['getOSInstance']>>) => {
      const { hasOverflow } = instance.state();
      setOverflowing(hasOverflow.x || hasOverflow.y);
    };
    return { initialized: update, updated: update };
  }, []);
  return (
    <Trigger
      {...attrs}
      className={[prefix, mouseThrough && !overflowing && `${prefix}-mouse-through`, className]
        .filter(Boolean)
        .join(' ')}
      trigger={['hover', 'focus']}
      position={position}
      popupVisible={foundation.getVisible()}
      disabled={disabled}
      popupOffset={10}
      showArrow
      autoFitTransformOrigin
      autoFitPopupSize
      animationName="zoom-in-fade-out"
      role="tooltip"
      ariaDescribedbyPopup
      onPopupVisibleChange={foundation.handlePopupVisibleChange}
      contentClass={[`${prefix}-content`, mini && `${prefix}-mini`, contentClass]
        .filter(Boolean)
        .join(' ')}
      contentStyle={{ backgroundColor, ...contentStyle }}
      arrowClass={[`${prefix}-popup-arrow`, arrowClass].filter(Boolean).join(' ')}
      arrowStyle={{ backgroundColor, ...arrowStyle }}
      content={
        <Scrollbar outerClass={`${prefix}-scrollbar`} events={events}>
          {content}
        </Scrollbar>
      }
    >
      {children}
    </Trigger>
  );
}

export default Tooltip;
