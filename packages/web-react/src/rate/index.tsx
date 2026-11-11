import type { ComponentPropsWithRef, ReactNode } from 'react';

import { resolveAllowClear } from '@sdata/web-core/config/prop-values';
import { createRateFoundation } from '@sdata/web-core/rate/foundation';
import { useLayoutEffect, useRef, useState } from 'react';

import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';
import { RateIcon } from './icons.js';

export type RateInstance = HTMLDivElement;
export interface RateProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'onChange' | 'defaultValue' | 'color' | 'children'
> {
  value?: number;
  defaultValue?: number;
  count?: number;
  allowHalf?: boolean;
  allowClear?: boolean;
  grading?: boolean;
  readonly?: boolean | string;
  disabled?: boolean;
  color?: string | Record<string, string>;
  renderCharacter?: (index: number) => ReactNode;
  onValueChange?: (value: number) => void;
  onChange?: (value: number) => void;
  onHoverChange?: (value: number) => void;
}

export function Rate(props: RateProps) {
  const {
    value,
    defaultValue = 0,
    count = 5,
    allowHalf = false,
    allowClear,
    grading = false,
    readonly = false,
    disabled: _disabled,
    color,
    renderCharacter,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onHoverChange: _onHoverChange,
    className,
    onMouseLeave,
    onKeyDown,
    tabIndex,
    ...attributes
  } = props;
  const prefix = usePrefix('rate');
  const form = useFormItem(props);
  const config = useConfig();
  const { t } = useI18n();
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  const disabled = form.mergedDisabled || !!readonly;
  const clear = resolveAllowClear({
    hasLocalProp: Object.hasOwn(props, 'allowClear'),
    localValue: allowClear,
    globalValue: config.allowClear,
  });
  const current = useRef({
    props,
    form,
    disabled,
    clear,
    options: { modelValue: value, count, allowHalf, grading, readonly, color },
  });
  current.current = {
    props,
    form,
    disabled,
    clear,
    options: { modelValue: value, count, allowHalf, grading, readonly, color },
  };
  const state = useRef({ inner: defaultValue, hover: 0, animation: false });
  const [, render] = useState(0);
  const refresh = () => render((version) => version + 1);
  const [foundation] = useState((): ReturnType<typeof createRateFoundation> =>
    createRateFoundation({
      get options() {
        return current.current.options;
      },
      get inner() {
        return state.current.inner;
      },
      get value() {
        return foundation.getValue();
      },
      get display() {
        return foundation.getDisplay();
      },
      get indices() {
        return foundation.getIndices();
      },
      get colors() {
        return foundation.getColors();
      },
      get hover() {
        return state.current.hover;
      },
      get animation() {
        return state.current.animation;
      },
      isDisabled: () => current.current.disabled,
      isFormDisabled: () => current.current.form.mergedDisabled,
      allowClear: () => current.current.clear,
      setInner: (next) => {
        state.current.inner = next;
        refresh();
      },
      setHover: (next) => {
        state.current.hover = next;
        refresh();
      },
      setAnimation: (next) => {
        state.current.animation = next;
        refresh();
      },
      onUpdate: (next) => current.current.props.onValueChange?.(next),
      onChange: (next) => current.current.props.onChange?.(next),
      onHover: (next) => current.current.props.onHoverChange?.(next),
      onFormChange: () => current.current.form.eventHandlers?.onChange?.(),
    }),
  );
  const previous = useRef({ value, disabled });
  useLayoutEffect(() => {
    if (!Object.is(previous.current.value, value)) foundation.syncModel(value);
    if (previous.current.disabled !== disabled) foundation.syncDisabled(disabled);
    previous.current = { value, disabled };
  });
  const display = foundation.getDisplay();
  const interaction = foundation.getInteractionMode();
  const character = (index: number) => {
    if (!grading) return renderCharacter ? renderCharacter(index) : <RateIcon name="star-fill" />;
    const face = foundation.getGradingFace(index);
    return (
      <RateIcon
        name={
          face === 'frown'
            ? 'face-frown-fill'
            : face === 'smile'
              ? 'face-smile-fill'
              : 'face-meh-fill'
        }
      />
    );
  };
  return (
    <Tooltip popupVisible={tip.visible} content={tip.text} position="top">
      <div
        {...attributes}
        role="radiogroup"
        aria-label={props['aria-label'] ?? t('a11y.rating')}
        tabIndex={disabled ? undefined : (tabIndex ?? 0)}
        className={[
          prefix,
          readonly && `${prefix}-readonly`,
          form.mergedDisabled && `${prefix}-disabled`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseLeave={(event) => {
          onMouseLeave?.(event);
          foundation.resetHover();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) foundation.keydown(event.nativeEvent);
        }}
      >
        {foundation.getIndices().map((_, index) => (
          <div
            key={index}
            className={[
              `${prefix}-character`,
              allowHalf && index + 0.5 === display && `${prefix}-character-half`,
              index + 1 <= display && `${prefix}-character-full`,
              state.current.animation &&
                index + 1 < foundation.getValue() &&
                `${prefix}-character-scale`,
            ]
              .filter(Boolean)
              .join(' ')}
            style={state.current.animation ? { animationDelay: `${50 * index}ms` } : undefined}
            {...(!allowHalf ? foundation.getAriaProps(index) : {})}
            onAnimationEnd={() => foundation.animationEnd(index)}
          >
            {[true, false].map((half) => (
              <div
                key={String(half)}
                className={`${prefix}-character-${half ? 'left' : 'right'}`}
                style={foundation.getCharacterColor(index, half)}
                {...foundation.getInteractionProps(index, half)}
                onMouseEnter={
                  interaction === 'edit' ? () => foundation.mouseEnter(index, half) : undefined
                }
                onClick={
                  interaction === 'edit'
                    ? () => foundation.click(index, half)
                    : interaction === 'readonly-tip'
                      ? tip.show
                      : undefined
                }
              >
                {character(index)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Tooltip>
  );
}
export default Rate;
