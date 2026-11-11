import type { TextareaAutoSize } from '@sdata/web-core/textarea/size';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode, Ref } from 'react';

import { resolveAllowClear } from '@sdata/web-core/config/prop-values';
import { isReadonlyModificationKey } from '@sdata/web-core/text-input/readonly';
import {
  getSizeStyles,
  getTextareaHeightLimits,
  getTextareaAutoStyle,
} from '@sdata/web-core/textarea/size';
import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { TextInputProps, TextInputEventNames } from '../_shared/use-text-input.js';

import { useFitWidth } from '../_shared/use-fit-width.js';
import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { useTextInput } from '../_shared/use-text-input.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';

export type { TextareaAutoSize } from '@sdata/web-core/textarea/size';
export interface TextareaInstance {
  focus(): void;
  blur(): void;
}
export interface TextareaProps
  extends
    Omit<
      ComponentPropsWithoutRef<'div'>,
      keyof TextInputProps | TextInputEventNames | 'children' | 'onKeyDown'
    >,
    Omit<TextInputProps, 'size' | 'onPressEnter'>,
    Pick<ComponentPropsWithoutRef<'textarea'>, TextInputEventNames> {
  placeholder?: string;
  fitWidth?: boolean;
  maxWFull?: boolean;
  readonly?: boolean | string;
  showWordLimit?: boolean;
  allowClear?: boolean;
  autoSize?: TextareaAutoSize;
  textareaAttrs?: ComponentPropsWithoutRef<'textarea'>;
  suffix?: ReactNode;
  onKeyDown?: (event: KeyboardEvent) => void;
  ref?: Ref<TextareaInstance>;
}

export function Textarea(props: TextareaProps) {
  const {
    value: _value,
    defaultValue: _defaultValue,
    disabled: _disabled,
    error: _error,
    onValueChange: _onValueChange,
    onInput: _onInput,
    onChange: _onChange,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    maxLength: _maxLength,
    wordLength: _wordLength,
    wordSlice: _wordSlice,
    placeholder,
    fitWidth = false,
    maxWFull = true,
    readonly,
    showWordLimit = false,
    allowClear,
    autoSize = false,
    textareaAttrs,
    suffix,
    ref,
    onKeyDown,
    onKeyUp,
    onKeyPress,
    onBeforeInput,
    onInvalid,
    onReset,
    onSubmit,
    onCopy,
    onCut,
    onPaste,
    onCompositionStart,
    onCompositionUpdate,
    onCompositionEnd,
    className,
    style,
    onMouseDown,
    ...attributes
  } = props;
  const prefix = usePrefix('textarea');
  const icon = usePrefix('icon');
  const config = useConfig();
  const { t } = useI18n();
  const element = useRef<HTMLTextAreaElement>(null);
  const mirror = useRef<HTMLDivElement>(null);
  const input = useTextInput(props, element, 'textarea');
  const { foundation, form } = input;
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  const fit = useFitWidth(element, fitWidth, input.value || placeholder, '12ch', {
    whiteSpace: 'pre-wrap',
  });
  const clear =
    resolveAllowClear({
      hasLocalProp: Object.hasOwn(props, 'allowClear'),
      localValue: allowClear,
      globalValue: config.allowClear,
    }) &&
    !readonly &&
    !form.mergedDisabled &&
    !!input.value;
  const [autoStyle, setAutoStyle] = useState<ReturnType<typeof getTextareaAutoStyle>>();
  const [scroll, setScroll] = useState(false);
  const measure = useRef(() => {});
  measure.current = () => {
    const node = element.current;
    if (!node) return;
    if (autoSize && mirror.current) {
      const styles = getSizeStyles(getComputedStyle(node));
      for (const [name, value] of Object.entries(styles))
        mirror.current.style.setProperty(name, value);
      const next = getTextareaAutoStyle(
        mirror.current.offsetHeight,
        getTextareaHeightLimits(styles, autoSize),
      );
      setAutoStyle((previous) =>
        previous?.height === next.height && previous.overflow === next.overflow ? previous : next,
      );
    } else setAutoStyle(undefined);
    setScroll(node.scrollHeight > node.offsetHeight);
  };
  useLayoutEffect(() => {
    measure.current();
  });
  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => measure.current());
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, []);
  useImperativeHandle(
    ref,
    () => ({ focus: () => element.current?.focus(), blur: () => element.current?.blur() }),
    [],
  );
  const composition = (event: React.CompositionEvent<HTMLTextAreaElement>) =>
    foundation.composition(
      event.currentTarget.value,
      event.nativeEvent,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
    );
  const textareaStyle: CSSProperties = {
    ...textareaAttrs?.style,
    ...(fitWidth ? { width: fit.value, minWidth: 0 } : {}),
    ...(autoSize ? autoStyle : {}),
  };
  return (
    <Tooltip popupVisible={tip.visible} content={tip.text} position="top">
      <div
        {...attributes}
        style={{ ...fit.style, ...style }}
        className={[
          `${prefix}-wrapper`,
          input.focused && `${prefix}-focus`,
          form.mergedDisabled && `${prefix}-disabled`,
          input.error && `${prefix}-error`,
          scroll && `${prefix}-scroll`,
          fitWidth && `${prefix}-fit-width`,
          maxWFull && `${prefix}-max-w-full`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseDown={(event) => {
          onMouseDown?.(event);
          if (element.current && event.target !== element.current) {
            event.preventDefault();
            element.current.focus();
          }
        }}
      >
        {!!autoSize && <div ref={mirror} className={`${prefix}-mirror`}>{`${input.value}\n`}</div>}
        <textarea
          {...{
            onKeyUp,
            onKeyPress,
            onBeforeInput,
            onInvalid,
            onReset,
            onSubmit,
            onCopy,
            onCut,
            onPaste,
          }}
          {...textareaAttrs}
          ref={element}
          className={[prefix, textareaAttrs?.className].filter(Boolean).join(' ')}
          style={textareaStyle}
          id={textareaAttrs?.id ?? form.formItemCtx?.fieldId}
          aria-invalid={input.error ? true : textareaAttrs?.['aria-invalid']}
          defaultValue={input.value}
          value={undefined}
          placeholder={placeholder}
          disabled={form.mergedDisabled}
          readOnly={!!readonly}
          onInput={(event) => {
            textareaAttrs?.onInput?.(event);
            foundation.input(
              event.currentTarget.value,
              (event.nativeEvent as InputEvent).inputType,
              event.nativeEvent,
            );
          }}
          onChange={textareaAttrs?.onChange}
          onKeyDown={(event) => {
            if (textareaAttrs?.onKeyDown) textareaAttrs.onKeyDown(event);
            else onKeyDown?.(event.nativeEvent);
            if (readonly && !form.mergedDisabled && isReadonlyModificationKey(event.nativeEvent))
              tip.show();
          }}
          onFocus={(event) => {
            textareaAttrs?.onFocus?.(event);
            foundation.focus(event.nativeEvent);
          }}
          onBlur={(event) => {
            textareaAttrs?.onBlur?.(event);
            foundation.blur(event.nativeEvent);
          }}
          onCompositionStart={(event) => {
            (textareaAttrs?.onCompositionStart ?? onCompositionStart)?.(event);
            composition(event);
          }}
          onCompositionUpdate={(event) => {
            (textareaAttrs?.onCompositionUpdate ?? onCompositionUpdate)?.(event);
            composition(event);
          }}
          onCompositionEnd={(event) => {
            (textareaAttrs?.onCompositionEnd ?? onCompositionEnd)?.(event);
            composition(event);
          }}
        />
        {suffix}
        {!!foundation.getMaxLength() && showWordLimit && (
          <div className={`${prefix}-word-limit`}>
            {foundation.getLength(input.value)}/{foundation.getMaxLength()}
          </div>
        )}
        {clear && (
          <div
            className={`${prefix}-clear-btn`}
            role="button"
            tabIndex={0}
            aria-label={t('a11y.clear')}
            onClick={(event) => foundation.clear(event.nativeEvent)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                foundation.clear(event.nativeEvent as unknown as MouseEvent);
              }
            }}
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
          </div>
        )}
      </div>
    </Tooltip>
  );
}
export default Textarea;
