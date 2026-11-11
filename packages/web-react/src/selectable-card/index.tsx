import type { SelectableCardProps as CoreProps } from '@sdata/web-core/selectable-card/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import {
  createSelectableCardFoundation,
  toCssSize,
} from '@sdata/web-core/selectable-card/foundation';
import { useId, useRef, useState } from 'react';

import { usePrefix } from '../config-provider/index.js';
export type {
  SelectableCardColor,
  SelectableCardVariant,
  SelectableCardSize,
  SelectableCardLayout,
  SelectableCardAlign,
  SelectableCardSizeValue,
} from '@sdata/web-core/selectable-card/types';
export interface SelectableCardProps
  extends
    Omit<CoreProps, 'title' | 'value' | 'description'>,
    Omit<ComponentPropsWithRef<'div'>, keyof CoreProps | 'onChange'> {
  title?: ReactNode;
  value?: ReactNode;
  description?: ReactNode;
  figure?: ReactNode;
  actions?: ReactNode;
  onChange?: (isSelected: boolean) => void;
}
export function SelectableCard({
  label,
  isSelected,
  isDisabled = false,
  color = 'sdblue',
  variant = 'outline',
  size = 'medium',
  layout = 'vertical',
  align = 'start',
  padding,
  title,
  value,
  description,
  width,
  height,
  maxWidth,
  figure,
  actions,
  children,
  onChange,
  onClick,
  className,
  style,
  ...attrs
}: SelectableCardProps) {
  const prefix = usePrefix('selectable-card');
  const inputId = `selectable-card-${useId()}`;
  const live = useRef({ isSelected, isDisabled, onChange });
  live.current = { isSelected, isDisabled, onChange };
  const [foundation] = useState(() =>
    createSelectableCardFoundation(
      {
        get disabled() {
          return live.current.isDisabled;
        },
        get selected() {
          return live.current.isSelected;
        },
      },
      (value) => live.current.onChange?.(value),
    ),
  );
  return (
    <div
      {...attrs}
      className={[
        prefix,
        `${prefix}--color-${color}`,
        `${prefix}--${variant}`,
        `${prefix}--size-${size}`,
        `${prefix}--layout-${layout}`,
        `${prefix}--align-${align}`,
        isSelected && `${prefix}--selected`,
        isDisabled && `${prefix}--disabled`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        padding: toCssSize(padding, true),
        width: toCssSize(width),
        height: toCssSize(height),
        maxWidth: toCssSize(maxWidth),
        ...style,
      }}
      data-selected={isSelected}
      data-variant={variant}
      onClick={(event) => {
        onClick?.(event);
        foundation.handleCardClick(event.nativeEvent);
      }}
    >
      <input
        id={inputId}
        className={`${prefix}-input`}
        type="checkbox"
        aria-label={label}
        checked={isSelected}
        disabled={isDisabled}
        onChange={(event) => foundation.handleInputChange(event.nativeEvent)}
      />
      <div className={`${prefix}-body`}>
        {figure != null && <div className={`${prefix}-figure`}>{figure}</div>}
        <div className={`${prefix}-content`}>
          {(!!title || title === 0) && <div className={`${prefix}-title`}>{title}</div>}
          {(!!value || value === 0) && <div className={`${prefix}-value`}>{value}</div>}
          {(!!description || description === 0) && (
            <div className={`${prefix}-description`}>{description}</div>
          )}
          {children != null && <div className={`${prefix}-default`}>{children}</div>}
          {actions != null && <div className={`${prefix}-actions`}>{actions}</div>}
        </div>
      </div>
    </div>
  );
}
export default SelectableCard;

export type SelectableCardInstance = ReactComponentRef<typeof SelectableCard>;
