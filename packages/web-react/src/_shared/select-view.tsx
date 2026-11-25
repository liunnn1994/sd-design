import type { ReactNode } from 'react';

import { createSelectViewFoundation } from '@sdata/web-core/select/view';
import { createSelectViewFocus } from '@sdata/web-core/select/view-focus';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { TagData, InputTagInstance } from '../input-tag/index.js';
import type { InputLabelProps } from './input-label.js';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { InputTag } from '../input-tag/index.js';
import { useI18n } from '../locale/index.js';
import { InputLabel } from './input-label.js';
import { LoadingIcon } from './loading-icon.js';
import { StatusIcon } from './status-icon.js';

export interface SelectViewValue extends TagData {
  value: string | number;
  label: string;
  closable: boolean;
  option?: Record<string, unknown> | undefined;
}
export interface SelectViewProps extends Omit<
  InputLabelProps,
  | 'value'
  | 'enabledInput'
  | 'formatLabel'
  | 'baseCls'
  | 'uninjectFormItemContext'
  | 'suffix'
  | 'focused'
> {
  value: SelectViewValue[];
  loading?: boolean;
  opened?: boolean;
  bordered?: boolean | undefined;
  multiple?: boolean;
  allowClear?: boolean | undefined;
  allowCreate?: boolean;
  showArrow?: boolean;
  allowSearch?: boolean;
  maxTagCount?: number | 'responsive';
  tagNowrap?: boolean;
  renderTag?: (data: SelectViewValue) => ReactNode;
  loadingIcon?: ReactNode;
  searchIcon?: ReactNode;
  arrowIcon?: ReactNode;
  onRemove?: (value: string | number) => void;
  onClear?: (event: MouseEvent) => void;
}
export function SelectView(props: SelectViewProps) {
  const {
    value,
    loading = false,
    opened = false,
    bordered = true,
    multiple = false,
    allowClear = false,
    allowCreate = false,
    showArrow = true,
    allowSearch = true,
    maxTagCount = 0,
    tagNowrap = false,
    retainInputValue: _retainInputValue,
    renderTag,
    renderLabel,
    loadingIcon,
    searchIcon,
    arrowIcon,
    onRemove,
    onClear,
    onFocus,
    onBlur,
    ref,
    className,
    ...attrs
  } = props;
  const prefix = usePrefix('select-view');
  const icon = usePrefix('icon');
  const feedbackPrefix = usePrefix('feedback-icon');
  const config = useConfig();
  const form = useFormItem(props);
  const { t } = useI18n();
  const child = useRef<InputTagInstance | null>(null);
  const [focus] = useState(() =>
    createSelectViewFocus({
      get input() {
        return child.current?.inputRef ?? undefined;
      },
    }),
  );
  const previousOpened = useRef(opened);
  useLayoutEffect(() => {
    if (previousOpened.current !== opened) {
      previousOpened.current = opened;
      focus.syncOpened(opened);
    }
  }, [opened, focus]);
  useImperativeHandle(
    ref,
    () => ({
      ...focus,
      get inputRef() {
        return child.current?.inputRef ?? null;
      },
    }),
    [focus],
  );
  const foundation = createSelectViewFoundation({
    multiple,
    allowSearch,
    allowCreate,
    allowClear,
    disabled: form.mergedDisabled,
    valueCount: value.length,
    loading,
    opened,
  });
  const mode = foundation.getIconMode();
  const suffix = (
    <>
      {foundation.getShowClear() && (
        <button
          type="button"
          className={`${prefix}-clear-btn`}
          aria-label={t('a11y.clear')}
          onClick={(event) => {
            onClear?.(event.nativeEvent);
            if (event.nativeEvent.cancelBubble) event.stopPropagation();
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <span className={`${icon}-hover`}>
            <svg
              className={`${icon} ${icon}-close`}
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth={4}
              aria-hidden="true"
            >
              <path d="m12 12 24 24M12 36l24-24" />
            </svg>
          </span>
        </button>
      )}
      <span className={`${prefix}-icon`}>
        {mode === 'loading'
          ? (loadingIcon ?? <LoadingIcon spin />)
          : mode === 'search'
            ? (searchIcon ?? (
                <svg
                  className={`${icon} ${icon}-search`}
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={4}
                  aria-hidden="true"
                >
                  <path d="M33.072 33.071c6.248-6.248 6.248-16.379 0-22.627-6.249-6.249-16.38-6.249-22.628 0s-6.248 16.379 0 22.627 16.38 6.248 22.628 0Zm0 0 8.485 8.485" />
                </svg>
              ))
            : (arrowIcon ??
              (showArrow && (
                <svg
                  className={`${icon} ${icon}-down ${prefix}-arrow-icon`}
                  viewBox="0 0 48 48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={4}
                  aria-hidden="true"
                >
                  <path d="M39.6 17.443 24.043 33 8.487 17.443" />
                </svg>
              )))}
      </span>
      {form.feedback && (
        <span className={`${feedbackPrefix} ${feedbackPrefix}-status-${form.feedback}`}>
          {form.feedback === 'validating' ? (
            <LoadingIcon spin />
          ) : (
            <StatusIcon type={form.feedback} />
          )}
        </span>
      )}
    </>
  );
  const common = {
    ...attrs,
    ref: child,
    baseCls: prefix,
    disabled: form.mergedDisabled,
    error: form.mergedError,
    size: form.mergedSize ?? config.size ?? 'medium',
    focused: opened,
    uninjectFormItemContext: true,
    suffix,
    className: [
      `${prefix}-${foundation.getMode()}`,
      opened && `${prefix}-opened`,
      !bordered && `${prefix}-borderless`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
    onFocus(event: FocusEvent) {
      onFocus?.(event);
      form.eventHandlers?.onFocus?.(event);
    },
    onBlur(event: FocusEvent) {
      onBlur?.(event);
      form.eventHandlers?.onBlur?.(event);
    },
  };
  return multiple ? (
    <InputTag
      {...common}
      value={value}
      allowClear={false}
      maxTagCount={maxTagCount}
      disabledInput={!foundation.getEnabledInput()}
      tagNowrap={tagNowrap}
      retainInputValue
      onRemove={onRemove}
      renderTag={
        renderTag || renderLabel
          ? (raw) => (renderTag ?? renderLabel)?.(raw as SelectViewValue)
          : undefined
      }
    />
  ) : (
    <InputLabel
      {...common}
      value={value[0]}
      enabledInput={foundation.getEnabledInput()}
      renderLabel={renderLabel}
    />
  );
}
