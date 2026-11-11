import type { TagFoundationState } from '@sdata/web-core/tag/foundation';
import type { ComponentRef as ReactComponentRef } from 'react';

import { createTagFoundation } from '@sdata/web-core/tag/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

import type { EllipsisTooltipProps } from '../ellipsis/index.js';
import type { TagProps } from './types.js';

import { LoadingIcon } from '../_shared/loading-icon.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { Ellipsis, PerformantEllipsis } from '../ellipsis/index.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';

export type { TagProps } from './types.js';
export type { TagColor } from '@sdata/web-core/tag/types';

export function Tag(props: TagProps) {
  const {
    color,
    size,
    bordered,
    visible: _visible,
    defaultVisible = true,
    loading,
    closable,
    checkable,
    checked: _checked,
    defaultChecked = true,
    nowrap: _nowrap,
    ellipsis: _ellipsis,
    ellipsisLineClamp,
    ellipsisExpandTrigger,
    ellipsisTooltip = true,
    tooltip,
    tooltipContent,
    ellipsisPerformant,
    textColor: _textColor,
    backgroundAlpha: _backgroundAlpha,
    icon,
    closeIcon,
    onVisibleChange,
    onCheckedChange,
    onClose,
    onCheck,
    children,
    className,
    style,
    onClick,
    onKeyDown,
    ...attributes
  } = props;
  const config = useConfig();
  const prefix = usePrefix('tag');
  const { t } = useI18n();
  const [, render] = useState(0);
  const internal = useRef({ visible: defaultVisible, checked: defaultChecked });
  const [resolved, setResolved] = useState({ input: color, value: color });
  let foundation: ReturnType<typeof createTagFoundation<EllipsisTooltipProps, string>>;
  const state: TagFoundationState<EllipsisTooltipProps> = {
    props: { ...props, ellipsisTooltip },
    get visible() {
      return internal.current.visible;
    },
    set visible(value) {
      internal.current.visible = value;
      render((count) => count + 1);
    },
    get checked() {
      return internal.current.checked;
    },
    set checked(value) {
      internal.current.checked = value;
      render((count) => count + 1);
    },
    size: size ?? config.size ?? 'medium',
    get isBuiltInColor() {
      return foundation.getIsBuiltInColor();
    },
    get isCustomColor() {
      return foundation.getIsCustomColor();
    },
    get resolvedColor() {
      return resolved.input === color ? resolved.value : color;
    },
    get isGradientColor() {
      return foundation.getIsGradientColor();
    },
    get resolvedBackgroundColor() {
      return foundation.getResolvedBackgroundColor();
    },
    get autoTextColor() {
      return foundation.getAutoTextColor();
    },
    get finalTextColor() {
      return foundation.getFinalTextColor();
    },
    get colorAlpha() {
      return foundation.getColorAlpha();
    },
    get finalBackgroundAlpha() {
      return foundation.getFinalBackgroundAlpha();
    },
    get computedChecked() {
      return foundation.getComputedChecked();
    },
    get resolvedEllipsis() {
      return foundation.getResolvedEllipsis();
    },
    get shouldRenderEllipsis() {
      return foundation.getShouldRenderEllipsis();
    },
    get hasCustomTooltip() {
      return foundation.getHasCustomTooltip();
    },
    hasDefaultSlot: children != null,
    hasTooltipSlot: tooltipContent != null,
  };
  foundation = createTagFoundation(state, {
    updateVisible: (value) => onVisibleChange?.(value),
    updateChecked: (value) => onCheckedChange?.(value),
    close: (event) => onClose?.(event),
    check: (value, event) => onCheck?.(value, event),
  });
  useLayoutEffect(() => {
    const value = foundation.getResolvedColor();
    setResolved((previous) =>
      previous.input === color && previous.value === value ? previous : { input: color, value },
    );
  }, [color]);
  if (!foundation.getComputedVisible()) return null;
  const EllipsisComponent = ellipsisPerformant ? PerformantEllipsis : Ellipsis;
  const text = children != null && <span className={`${prefix}-text`}>{children}</span>;
  return (
    <span
      {...attributes}
      role={checkable ? 'button' : attributes.role}
      tabIndex={checkable ? 0 : attributes.tabIndex}
      aria-pressed={checkable ? state.computedChecked : undefined}
      className={[
        prefix,
        `${prefix}-size-${foundation.getMergedSize()}`,
        `${prefix}-${state.shouldRenderEllipsis ? 'ellipsis' : 'no-ellipsis'}`,
        foundation.getHasLineClampEllipsis() && `${prefix}-ellipsis-line-clamp`,
        loading && `${prefix}-loading`,
        state.isBuiltInColor && `${prefix}-${color}`,
        bordered && `${prefix}-bordered`,
        checkable && `${prefix}-checkable`,
        state.computedChecked && `${prefix}-checked`,
        state.isCustomColor && `${prefix}-custom-color`,
        config.rtl && `${prefix}-rtl`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ ...foundation.getStyle(), ...style }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) foundation.handleClick(event.nativeEvent);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) foundation.handleTagKeydown(event.nativeEvent);
      }}
    >
      {icon != null && <span className={`${prefix}-icon`}>{icon}</span>}
      {state.shouldRenderEllipsis ? (
        <EllipsisComponent
          className={`${prefix}-text`}
          lineClamp={ellipsisLineClamp}
          expandTrigger={ellipsisExpandTrigger}
          tooltip={foundation.getMergedEllipsisTooltip()}
          tooltipContent={state.hasCustomTooltip ? (tooltipContent ?? tooltip) : undefined}
        >
          {children}
        </EllipsisComponent>
      ) : state.hasCustomTooltip && ellipsisTooltip !== false && children != null ? (
        <Tooltip {...foundation.getTooltipBindings()} content={tooltipContent ?? tooltip}>
          {text as React.ReactElement}
        </Tooltip>
      ) : (
        text
      )}
      {closable && (
        <span
          role="button"
          tabIndex={0}
          aria-label={t('a11y.close')}
          className={`${prefix}-close-btn`}
          onClick={(event) => {
            event.stopPropagation();
            foundation.handleClose(event.nativeEvent);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            foundation.handleCloseKeydown(event.nativeEvent);
          }}
        >
          {closeIcon ?? '×'}
        </span>
      )}
      {loading && (
        <span className={`${prefix}-loading-icon`}>
          <LoadingIcon />
        </span>
      )}
    </span>
  );
}

export default Tag;

export type TagInstance = ReactComponentRef<typeof Tag>;
