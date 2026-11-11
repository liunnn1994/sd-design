import type {
  TagData as CoreTagData,
  TagDataInfo as CoreTagDataInfo,
} from '@sdata/web-core/input-tag/types';
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import { resolveAllowClear } from '@sdata/web-core/config/prop-values';
import {
  createInputTag,
  getVisibleTagCount,
  getDisplayTags,
} from '@sdata/web-core/input-tag/foundation';
import { DEFAULT_INPUT_TAG_FIELD_NAMES, getValueData } from '@sdata/web-core/input-tag/utils';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { TextInputEventNames } from '../_shared/use-text-input.js';

import { LoadingIcon } from '../_shared/loading-icon.js';
import { StatusIcon } from '../_shared/status-icon.js';
import { useAfterRender } from '../_shared/use-after-render.js';
import { useFitWidth } from '../_shared/use-fit-width.js';
import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { WrapClamp } from '../clamp/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';
import { useI18n } from '../locale/index.js';
import { Tag, type TagProps } from '../tag/index.js';
import { Tooltip } from '../tooltip/index.js';
import { TagList } from './tag-list.js';

export type { InputTagFieldNames } from '@sdata/web-core/input-tag/types';
export type TagData = CoreTagData<TagProps>;
export type TagDataInfo = CoreTagDataInfo<TagProps>;
export type InputTagValue = Array<string | number | TagData>;
export interface InputTagInstance {
  readonly inputRef: HTMLInputElement | null;
  focus(): void;
  blur(): void;
}
type NativeInputProps = Pick<
  ComponentPropsWithoutRef<'input'>,
  | TextInputEventNames
  | 'onInput'
  | 'onSelect'
  | 'autoComplete'
  | 'autoFocus'
  | 'maxLength'
  | 'minLength'
  | 'name'
  | 'pattern'
  | 'required'
>;
export interface InputTagProps
  extends
    NativeInputProps,
    Omit<
      ComponentPropsWithoutRef<'span'>,
      | keyof NativeInputProps
      | 'defaultValue'
      | 'prefix'
      | 'onChange'
      | 'onFocus'
      | 'onBlur'
      | 'onKeyDown'
      | 'children'
    > {
  value?: InputTagValue | null;
  defaultValue?: InputTagValue;
  inputValue?: string;
  defaultInputValue?: string;
  placeholder?: string;
  fitWidth?: boolean;
  maxWFull?: boolean;
  disabled?: boolean;
  error?: boolean;
  readonly?: boolean | string;
  allowClear?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large';
  maxTagCount?: number | 'responsive';
  retainInputValue?: boolean | { create?: boolean; blur?: boolean };
  formatTag?: (data: TagData) => string;
  uniqueValue?: boolean;
  fieldNames?: import('@sdata/web-core/input-tag/types').InputTagFieldNames;
  tagNowrap?: boolean;
  baseCls?: string;
  focused?: boolean;
  disabledInput?: boolean;
  uninjectFormItemContext?: boolean;
  inputAttrs?: ComponentPropsWithoutRef<'input'>;
  prefix?: ReactNode;
  suffix?: ReactNode;
  renderTag?: (data: TagDataInfo['raw'] & TagDataInfo) => ReactNode;
  onValueChange?: (value: InputTagValue) => void;
  onInputValueChange?: (value: string, event: Event) => void;
  onChange?: (value: InputTagValue, event: Event) => void;
  onPressEnter?: (value: string, event: KeyboardEvent) => void;
  onRemove?: (value: string | number, event: Event) => void;
  onClear?: (event: MouseEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  ref?: Ref<InputTagInstance>;
}

export function InputTag(props: InputTagProps) {
  const {
    value: _value,
    defaultValue = [],
    inputValue: _inputValue,
    defaultInputValue = '',
    placeholder,
    fitWidth = false,
    maxWFull = true,
    disabled: _disabled,
    error: _error,
    readonly = false,
    allowClear,
    size: _size,
    maxTagCount = 0,
    retainInputValue = false,
    formatTag,
    uniqueValue = false,
    fieldNames: _fieldNames,
    tagNowrap = false,
    baseCls,
    focused = false,
    disabledInput = false,
    uninjectFormItemContext = false,
    inputAttrs,
    prefix: before,
    suffix,
    renderTag,
    onValueChange: _onValueChange,
    onInputValueChange: _onInputValueChange,
    onChange: _onChange,
    onPressEnter: _onPressEnter,
    onRemove: _onRemove,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    onKeyDown,
    ref,
    className,
    style,
    onMouseDown,
    onKeyUp,
    onKeyPress,
    onBeforeInput,
    onInvalid,
    onReset,
    onSubmit,
    onCopy,
    onCut,
    onPaste,
    onSelect,
    onInput,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    name,
    pattern,
    required,
    ...attrs
  } = props;
  const defaultPrefix = usePrefix('input-tag');
  const prefix = baseCls || defaultPrefix;
  const icon = usePrefix('icon');
  const config = useConfig();
  const form = useFormItem({ ...props, uninject: uninjectFormItemContext });
  const { t } = useI18n();
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  const input = useRef<HTMLInputElement | null>(null);
  const mirror = useRef<HTMLSpanElement | null>(null);
  const [, render] = useState(0);
  const [width, setWidth] = useState('12px');
  const local = useRef({
    value: defaultValue,
    input: defaultInputValue,
    focused: false,
    composition: false,
    compositionValue: '',
  });
  const responsive = maxTagCount === 'responsive';
  const previousResponsive = useRef(responsive);
  const replacingInput = previousResponsive.current !== responsive;
  const live = useRef({
    props,
    form,
    tip,
    readonly,
    retainInputValue,
    uniqueValue,
    replacingInput,
  });
  live.current = { props, form, tip, readonly, retainInputValue, uniqueValue, replacingInput };
  const refresh = () => render((version) => version + 1);
  const getValue = () => live.current.props.value ?? local.current.value;
  const getInput = () => live.current.props.inputValue ?? local.current.input;
  const getData = () =>
    getValueData<TagProps>(getValue(), {
      ...DEFAULT_INPUT_TAG_FIELD_NAMES,
      ...live.current.props.fieldNames,
    });
  const afterRender = useAfterRender();
  const [foundation] = useState(() =>
    createInputTag<TagProps>({
      get props() {
        return live.current;
      },
      get disabled() {
        return live.current.form.mergedDisabled;
      },
      get value() {
        return getValue();
      },
      get inputValue() {
        return getInput();
      },
      get data() {
        return getData();
      },
      get renderedTagCount() {
        return getData().length;
      },
      get replacingInput() {
        return live.current.replacingInput;
      },
      get input() {
        return input.current ?? undefined;
      },
      get composition() {
        return local.current.composition;
      },
      set composition(value) {
        local.current.composition = value;
        refresh();
      },
      get compositionValue() {
        return local.current.compositionValue;
      },
      set compositionValue(value) {
        local.current.compositionValue = value;
        refresh();
      },
      get focused() {
        return local.current.focused;
      },
      set focused(value) {
        local.current.focused = value;
        refresh();
      },
      setInner(value) {
        local.current.value = value;
        refresh();
      },
      setInput(value) {
        local.current.input = value;
        refresh();
      },
      afterRender: (callback) => {
        void afterRender().then(callback);
      },
      onInputUpdate() {},
      onInputChange: (value, event) => live.current.props.onInputValueChange?.(value, event),
      onUpdate: (value) => live.current.props.onValueChange?.(value),
      onChange: (value, event) => live.current.props.onChange?.(value, event),
      onFormChange: (event) => live.current.form.eventHandlers?.onChange?.(event),
      onRemove: (value, event) => live.current.props.onRemove?.(value, event),
      onClear: (event) => live.current.props.onClear?.(event),
      onPressEnter: (value, event) => live.current.props.onPressEnter?.(value, event),
      onFocus(event) {
        live.current.props.onFocus?.(event);
        live.current.form.eventHandlers?.onFocus?.(event);
      },
      onBlur(event) {
        live.current.props.onBlur?.(event);
        live.current.form.eventHandlers?.onBlur?.(event);
      },
      showReadonlyTip: () => live.current.tip.show(),
    }),
  );
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return input.current;
      },
      focus() {
        input.current?.focus();
      },
      blur() {
        input.current?.blur();
      },
    }),
    [],
  );
  const previousValue = useRef(props.value);
  useLayoutEffect(() => {
    if (previousValue.current !== props.value) {
      previousValue.current = props.value;
      foundation.syncValue(props.value);
    }
  }, [props.value, foundation]);
  useLayoutEffect(() => {
    foundation.syncInput();
    if (previousResponsive.current !== responsive) {
      previousResponsive.current = responsive;
      if (local.current.focused) input.current?.focus();
    }
  });
  useLayoutEffect(() => {
    const element = mirror.current;
    if (!element) return;
    const measure = () => setWidth(`${Math.max(12, element.offsetWidth)}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const data = getData();
  const text =
    local.current.compositionValue || getInput() || (data.length === 0 ? placeholder : undefined);
  const fit = useFitWidth(input, fitWidth, text, data.length ? '12px' : '4ch', {
    additionalWidth: 12,
  });
  const clear =
    !form.mergedDisabled &&
    !readonly &&
    !!resolveAllowClear({
      hasLocalProp: Object.hasOwn(props, 'allowClear'),
      localValue: allowClear,
      globalValue: config.allowClear,
    }) &&
    !!getValue().length;
  const inputWidth = fitWidth ? fit.value : width;
  const native = {
    onKeyUp,
    onKeyPress,
    onBeforeInput,
    onInvalid,
    onReset,
    onSubmit,
    onCopy,
    onCut,
    onPaste,
    onSelect,
    onInput,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    autoComplete,
    autoFocus,
    maxLength,
    minLength,
    name,
    pattern,
    required,
    ...inputAttrs,
  };
  const inputElement = (
    <input
      {...native}
      key="input-tag-input"
      ref={input}
      className={[`${prefix}-input`, native.className].filter(Boolean).join(' ')}
      defaultValue={getInput()}
      style={{
        ...native.style,
        width: inputWidth,
        ...(responsive ? { flex: '0 0 auto', minWidth: inputWidth } : {}),
      }}
      placeholder={data.length ? undefined : placeholder}
      disabled={form.mergedDisabled}
      readOnly={!!(readonly || disabledInput)}
      onInput={(event) => {
        native.onInput?.(event);
        foundation.input(event.nativeEvent);
      }}
      onKeyDown={(event) => {
        native.onKeyDown?.(event);
        onKeyDown?.(event.nativeEvent);
        foundation.keydown(event.nativeEvent);
      }}
      onFocus={(event) => {
        native.onFocus?.(event);
        foundation.focus(event.nativeEvent);
      }}
      onBlur={(event) => {
        native.onBlur?.(event);
        foundation.blur(event.nativeEvent);
      }}
      onCompositionStart={(event) => {
        native.onCompositionStart?.(event);
        foundation.composition(event.nativeEvent);
      }}
      onCompositionUpdate={(event) => {
        native.onCompositionUpdate?.(event);
        foundation.composition(event.nativeEvent);
      }}
      onCompositionEnd={(event) => {
        native.onCompositionEnd?.(event);
        foundation.composition(event.nativeEvent);
      }}
    />
  );
  const tag = (item: TagDataInfo, index: number, counter = false) => (
    <Tag
      key={counter ? '__sd__more' : `tag-${item.value}`}
      visible
      ellipsis={!renderTag}
      nowrap={tagNowrap || responsive}
      {...item.tagProps}
      className={[`${prefix}-tag`, counter && `${prefix}-tag-counter`, item.tagProps?.className]
        .filter(Boolean)
        .join(' ')}
      closable={foundation.closable(item)}
      onClose={(event) => {
        item.tagProps?.onClose?.(event);
        foundation.remove(item.value, index, event);
      }}
    >
      {renderTag
        ? renderTag(item.raw as TagDataInfo['raw'] & TagDataInfo)
        : (formatTag?.(item.raw) ?? item.label)}
    </Tag>
  );
  const count = getVisibleTagCount(maxTagCount, data.length);
  return (
    <Tooltip popupVisible={tip.visible} content={tip.text} position="top">
      <span
        {...attrs}
        style={{ ...fit.style, ...style }}
        className={[
          prefix,
          `${prefix}-size-${form.mergedSize ?? config.size ?? 'medium'}`,
          form.mergedDisabled && `${prefix}-disabled`,
          disabledInput && `${prefix}-disabled-input`,
          form.mergedError && `${prefix}-error`,
          (focused || local.current.focused) && `${prefix}-focus`,
          readonly && `${prefix}-readonly`,
          responsive && `${prefix}-responsive`,
          data.length > 0 && `${prefix}-has-tag`,
          before != null && `${prefix}-has-prefix`,
          (suffix != null || clear || form.feedback) && `${prefix}-has-suffix`,
          !getValue().length && `${prefix}-has-placeholder`,
          fitWidth && `${prefix}-fit-width`,
          maxWFull && `${prefix}-max-w-full`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          foundation.mousedown(event.nativeEvent);
        }}
      >
        <span ref={mirror} className={`${prefix}-mirror`}>
          {text}
        </span>
        {before != null && <span className={`${prefix}-prefix`}>{before}</span>}
        {responsive ? (
          <WrapClamp
            items={data}
            itemKey={(item) => item.value}
            maxLines={1}
            as="span"
            className={`${prefix}-inner ${prefix}-inner-responsive`}
            renderItem={({ item, index }) => (
              <span className={`${prefix}-item-holder`}>{tag(item, index)}</span>
            )}
            after={({ hiddenItems }) => (
              <>
                {hiddenItems.length > 0 && (
                  <Tag
                    className={`${prefix}-tag ${prefix}-tag-counter`}
                    visible
                    nowrap
                    ellipsis={false}
                  >
                    +{hiddenItems.length}
                  </Tag>
                )}
                {inputElement}
              </>
            )}
          />
        ) : (
          <TagList
            className={[`${prefix}-inner`, tagNowrap && `${prefix}-nowrap`]
              .filter(Boolean)
              .join(' ')}
            items={getDisplayTags(data, count).map((item, index) => ({
              key: index === count && data.length > count ? '__sd__more' : `tag-${item.value}`,
              node: tag(item, index, index === count && data.length > count),
            }))}
          >
            {inputElement}
          </TagList>
        )}
        {clear && (
          <span
            role="button"
            tabIndex={0}
            aria-label={t('a11y.clear')}
            className={`${icon}-hover ${prefix}-clear-btn`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => foundation.clear(event.nativeEvent)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                foundation.clear(event.nativeEvent as unknown as MouseEvent);
              }
            }}
          >
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
        )}
        {(suffix != null || form.feedback) && (
          <span className={`${prefix}-suffix`}>
            {suffix}
            {form.feedback &&
              (form.feedback === 'validating' ? (
                <LoadingIcon spin />
              ) : (
                <StatusIcon type={form.feedback} />
              ))}
          </span>
        )}
      </span>
    </Tooltip>
  );
}
export default InputTag;
