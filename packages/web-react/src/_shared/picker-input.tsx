import type { Dayjs } from 'dayjs';
import type { ComponentPropsWithoutRef, ReactElement, ReactNode, Ref, SyntheticEvent } from 'react';

import {
  createPickerRangeInputFoundation,
  resolvePickerInputValue,
  type PickerInputFormat,
} from '@sdata/web-core/picker/input';
import { isReadonlyModificationKey } from '@sdata/web-core/text-input/readonly';
import { useImperativeHandle, useRef } from 'react';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { IconClose } from '../icon/icon-close.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';
import { LoadingIcon } from './loading-icon.js';
import { StatusIcon } from './status-icon.js';
import { useFitWidth } from './use-fit-width.js';
import { useReadonlyTip } from './use-readonly-tip.js';

export interface PickerInputInstance {
  focus(index?: number): void;
  blur(): void;
}
export interface PickerInputProps {
  ref?: Ref<PickerInputInstance>;
  range?: boolean;
  value?: Dayjs | Array<Dayjs | undefined>;
  inputValue?: string | Array<string | undefined>;
  format: PickerInputFormat;
  focused?: boolean;
  focusedIndex?: number;
  size?: 'mini' | 'small' | 'medium' | 'large';
  disabled?: boolean | boolean[];
  readonly?: boolean | string;
  error?: boolean;
  allowClear?: boolean;
  placeholder?: string | string[];
  fitWidth?: boolean;
  maxWFull?: boolean;
  fitWidthFallback?: string;
  fitWidthFallbackText?: string;
  prefix?: ReactNode;
  suffixIcon?: ReactNode;
  separator?: ReactNode;
  inputProps?: ComponentPropsWithoutRef<'input'> | ComponentPropsWithoutRef<'input'>[];
  rootProps?: ComponentPropsWithoutRef<'div'>;
  renderRoot?(element: ReactElement): ReactElement;
  onFocusedIndexChange?(index: number): void;
  onChange?(event: Event): void;
  onPressEnter?(): void;
  onClear?(event: Event): void;
  onBlur?(event: FocusEvent): void;
}

export function PickerInput(props: PickerInputProps) {
  const {
    range = false,
    readonly,
    format,
    value,
    inputValue,
    focusedIndex,
    placeholder,
    fitWidth = false,
    maxWFull = true,
    fitWidthFallback = '4ch',
    fitWidthFallbackText,
    rootProps = {},
    onFocusedIndexChange,
  } = props;
  const first = useRef<HTMLInputElement>(null);
  const second = useRef<HTMLInputElement>(null);
  const form = useFormItem({
    size: props.size,
    error: props.error,
    disabled: typeof props.disabled === 'boolean' ? props.disabled : undefined,
  });
  const config = useConfig();
  const prefix = usePrefix('picker');
  const icon = usePrefix('icon');
  const { t } = useI18n();
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  const rangeFoundation = createPickerRangeInputFoundation({
    mergedDisabled: form.mergedDisabled,
    disabled: props.disabled ?? false,
    focusedIndex,
    inputValue: Array.isArray(inputValue) ? inputValue : undefined,
    value: Array.isArray(value) ? value : [],
    format,
    get inputs() {
      return [first.current ?? undefined, second.current ?? undefined] as const;
    },
    emitFocusedIndexChange: (next) => onFocusedIndexChange?.(next),
    emitUpdateFocusedIndex: () => {},
  });
  const values = range
    ? [rangeFoundation.getDisplayValue(0), rangeFoundation.getDisplayValue(1)]
    : [
        resolvePickerInputValue({
          value: Array.isArray(value) ? undefined : value,
          inputValue: typeof inputValue === 'string' ? inputValue : undefined,
          format,
        }),
      ];
  const placeholders = Array.isArray(placeholder) ? placeholder : [placeholder, placeholder];
  const firstWidth = useFitWidth(
    first,
    fitWidth,
    values[0] || placeholders[0] || fitWidthFallbackText,
    fitWidthFallback,
  );
  const secondWidth = useFitWidth(
    second,
    fitWidth && range,
    values[1] || placeholders[1] || fitWidthFallbackText,
    fitWidthFallback,
  );
  const disabled = range
    ? rangeFoundation.getDisabled(0) && rangeFoundation.getDisabled(1)
    : form.mergedDisabled;
  useImperativeHandle(props.ref, () => ({
    focus: (index) => {
      if (range) rangeFoundation.focus(index);
      else first.current?.focus();
    },
    blur: () => {
      if (range) rangeFoundation.blur();
      else first.current?.blur();
    },
  }));
  const clear =
    props.allowClear &&
    !disabled &&
    (range ? Array.isArray(value) && value.length === 2 : !!values[0]);
  const onClear = (event: SyntheticEvent) => {
    event.stopPropagation();
    props.onClear?.(event.nativeEvent);
  };
  const renderInput = (index: number) => {
    const inputAttrs =
      (Array.isArray(props.inputProps) ? props.inputProps[index] : props.inputProps) ?? {};
    const width = index === 0 ? firstWidth : secondWidth;
    return (
      <div
        className={[`${prefix}-input`, range && index === focusedIndex && `${prefix}-input-active`]
          .filter(Boolean)
          .join(' ')}
        style={
          fitWidth
            ? { ...width.style, flex: `0 1 ${width.value}`, width: width.value, minWidth: 0 }
            : undefined
        }
      >
        <input
          {...inputAttrs}
          ref={index === 0 ? first : second}
          className={[!range && `${prefix}-start-time`, inputAttrs.className]
            .filter(Boolean)
            .join(' ')}
          disabled={range ? rangeFoundation.getDisabled(index) : disabled}
          readOnly={!!readonly || inputAttrs.readOnly}
          placeholder={placeholders[index]}
          value={values[index] ?? ''}
          onChange={(event) => {
            if (range) event.stopPropagation();
            props.onChange?.(event.nativeEvent);
            inputAttrs.onChange?.(event);
          }}
          onClick={(event) => {
            if (range) rangeFoundation.changeFocusedInput(index);
            inputAttrs.onClick?.(event);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') props.onPressEnter?.();
            if (range && event.key === 'Tab') event.preventDefault();
            inputAttrs.onKeyDown?.(event);
          }}
          onBlur={(event) => {
            if (!range) props.onBlur?.(event.nativeEvent);
            inputAttrs.onBlur?.(event);
          }}
        />
      </div>
    );
  };
  const root = (
    <div
      {...rootProps}
      className={[
        prefix,
        `${prefix}-size-${form.mergedSize ?? config.size ?? 'medium'}`,
        range && `${prefix}-range`,
        props.focused && `${prefix}-focused`,
        disabled && `${prefix}-disabled`,
        form.mergedError && `${prefix}-error`,
        props.prefix != null && `${prefix}-has-prefix`,
        fitWidth && `${prefix}-fit-width`,
        maxWFull && `${prefix}-max-w-full`,
        rootProps.className,
      ]
        .filter(Boolean)
        .join(' ')}
      onKeyDown={(event) => {
        if (readonly && !disabled && isReadonlyModificationKey(event.nativeEvent)) tip.show();
        rootProps.onKeyDown?.(event);
      }}
    >
      {props.prefix != null && <div className={`${prefix}-prefix`}>{props.prefix}</div>}
      {renderInput(0)}
      {range && (
        <>
          <span className={`${prefix}-separator`}>{props.separator ?? ' - '}</span>
          {renderInput(1)}
        </>
      )}
      <div className={`${prefix}-suffix`}>
        {clear && (
          <span
            role="button"
            tabIndex={0}
            aria-label={t('a11y.clear')}
            className={`${icon}-hover ${prefix}-icon-hover ${prefix}-clear-icon`}
            onClick={onClear}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClear(event);
              }
            }}
          >
            <IconClose />
          </span>
        )}
        <span className={`${prefix}-suffix-icon`}>{props.suffixIcon}</span>
        {form.feedback &&
          (form.feedback === 'validating' ? (
            <LoadingIcon spin />
          ) : (
            <StatusIcon type={form.feedback} />
          ))}
      </div>
    </div>
  );
  return (
    <Tooltip popupVisible={tip.visible} content={tip.text} position="top">
      {props.renderRoot?.(root) ?? root}
    </Tooltip>
  );
}
