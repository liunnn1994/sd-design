import type { ReactNode } from 'react';

import type { ScrollbarProps } from '../scrollbar/index.js';
import type { TriggerProps } from '../trigger/index.js';

import { usePopupVisible } from '../_shared/use-popup-visible.js';
import { usePrefix } from '../config-provider/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { Trigger } from '../trigger/index.js';

export interface PopoverProps extends Omit<TriggerProps, 'title'> {
  title?: ReactNode;
  scrollbar?: boolean | Omit<ScrollbarProps, 'children'>;
}

export function Popover({
  children,
  title,
  content,
  popupVisible,
  defaultPopupVisible = false,
  onPopupVisibleChange,
  trigger = 'hover',
  position = 'top',
  scrollbar = true,
  className,
  contentClass,
  arrowClass,
  ...attrs
}: PopoverProps) {
  const prefix = usePrefix('popover');
  const foundation = usePopupVisible(popupVisible, defaultPopupVisible, onPopupVisibleChange);
  const scrollbarProps = typeof scrollbar === 'object' ? scrollbar : {};
  return (
    <Trigger
      popupOffset={10}
      showArrow
      animationName="zoom-in-fade-out"
      autoFitTransformOrigin
      escToClose
      ariaHasPopup
      {...attrs}
      className={[prefix, className].filter(Boolean).join(' ')}
      trigger={trigger}
      position={position}
      popupVisible={foundation.getVisible()}
      onPopupVisibleChange={foundation.handlePopupVisibleChange}
      contentClass={[`${prefix}-popup-content`, contentClass].filter(Boolean).join(' ')}
      arrowClass={[`${prefix}-popup-arrow`, arrowClass].filter(Boolean).join(' ')}
      content={
        <>
          {title != null && title !== false && title !== '' && (
            <div className={`${prefix}-title`}>{title}</div>
          )}
          {scrollbar === false ? (
            <div className={`${prefix}-content`}>{content}</div>
          ) : (
            <Scrollbar
              {...scrollbarProps}
              className={[`${prefix}-content`, scrollbarProps.className].filter(Boolean).join(' ')}
            >
              {content}
            </Scrollbar>
          )}
        </>
      }
    >
      {children}
    </Trigger>
  );
}

export default Popover;
