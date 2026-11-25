import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import { resolveAllowClear } from '@sdata/web-core/config/prop-values';
import { createInputPasswordFoundation } from '@sdata/web-core/input-password/foundation';
import { createInputSearchFoundation } from '@sdata/web-core/input-search/foundation';
import { isReadonlyModificationKey } from '@sdata/web-core/text-input/readonly';
import { useImperativeHandle, useRef, useState } from 'react';

import type { TextInputProps, TextInputEventNames } from '../_shared/use-text-input.js';
import type { ButtonProps } from '../button/index.js';

import { EyeIcon } from '../_shared/eye-icon.js';
import { hasContent } from '../_shared/has-content.js';
import { LoadingIcon } from '../_shared/loading-icon.js';
import { StatusIcon } from '../_shared/status-icon.js';
import { useFitWidth } from '../_shared/use-fit-width.js';
import { useReadonlyTip } from '../_shared/use-readonly-tip.js';
import { useTextInput } from '../_shared/use-text-input.js';
import { Button } from '../button/index.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useI18n } from '../locale/index.js';
import { Tooltip } from '../tooltip/index.js';

export interface InputInstance {
  readonly inputRef: HTMLInputElement | null;
  focus(): void;
  blur(): void;
}
export interface InputProps
  extends
    Omit<
      ComponentPropsWithoutRef<'span'>,
      keyof TextInputProps | TextInputEventNames | 'prefix' | 'onKeyDown' | 'children'
    >,
    TextInputProps,
    Pick<ComponentPropsWithoutRef<'input'>, TextInputEventNames> {
  allowClear?: boolean | undefined;
  readonly?: boolean | string;
  placeholder?: string | undefined;
  fitWidth?: boolean;
  maxWFull?: boolean;
  showWordLimit?: boolean | undefined;
  inputAttrs?: ComponentPropsWithoutRef<'input'>;
  type?: 'text' | 'password';
  fitWidthFallback?: string;
  prepend?: ReactNode;
  append?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  onKeyDown?: (event: KeyboardEvent) => void;
  ref?: Ref<InputInstance>;
}

function InputRoot(props: InputProps) {
  const {
    value: _value,
    defaultValue: _defaultValue,
    size: _size,
    disabled: _disabled,
    error: _error,
    onValueChange: _onValueChange,
    onInput: _onInput,
    onChange: _onChange,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    onPressEnter: _onPressEnter,
    allowClear,
    readonly,
    placeholder,
    fitWidth = false,
    maxWFull = true,
    maxLength = 0,
    showWordLimit = false,
    wordLength: _wordLength,
    wordSlice: _wordSlice,
    inputAttrs,
    type = 'text',
    fitWidthFallback = '4ch',
    prepend,
    append,
    prefix: before,
    suffix,
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
    ref,
    className,
    style,
    onMouseDown,
    ...attributes
  } = props;
  const prefix = usePrefix('input');
  const icon = usePrefix('icon');
  const config = useConfig();
  const { t } = useI18n();
  const element = useRef<HTMLInputElement>(null);
  const input = useTextInput(props, element, 'input');
  const { foundation, form } = input;
  const size = form.mergedSize ?? config.size ?? 'medium';
  const fit = useFitWidth(
    element,
    fitWidth,
    foundation.getFitWidthText(input.compositionValue, type === 'password', placeholder),
    fitWidthFallback,
  );
  const hasOuter = hasContent(prepend) || hasContent(append);
  const clear =
    resolveAllowClear({
      hasLocalProp: Object.hasOwn(props, 'allowClear'),
      localValue: allowClear,
      globalValue: config.allowClear,
    }) &&
    !readonly &&
    !form.mergedDisabled &&
    !!input.value;
  const tip = useReadonlyTip(readonly, form.mergedDisabled);
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return element.current;
      },
      focus: () => element.current?.focus(),
      blur: () => element.current?.blur(),
    }),
    [],
  );
  const composition = (event: React.CompositionEvent<HTMLInputElement>) => {
    foundation.composition(
      event.currentTarget.value,
      event.nativeEvent,
      event.currentTarget.selectionStart,
      event.currentTarget.selectionEnd,
    );
  };
  const wrapperClasses = [
    `${prefix}-wrapper`,
    input.error && `${prefix}-error`,
    form.mergedDisabled && `${prefix}-disabled`,
    input.focused && `${prefix}-focus`,
    fitWidth && `${prefix}-fit-width`,
    maxWFull && `${prefix}-max-w-full`,
    !hasOuter && className,
  ]
    .filter(Boolean)
    .join(' ');
  const wrapperAttributes = { ...attributes, style: { ...fit.style, ...style } };
  const content = (
    <span
      {...(!hasOuter ? wrapperAttributes : {})}
      className={wrapperClasses}
      onMouseDown={(event) => {
        if (!hasOuter) onMouseDown?.(event);
        if (element.current && event.target !== element.current) {
          event.preventDefault();
          element.current.focus();
        }
      }}
    >
      {hasContent(before) && <span className={`${prefix}-prefix`}>{before}</span>}
      <input
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
        {...inputAttrs}
        ref={element}
        id={inputAttrs?.id ?? form.formItemCtx?.fieldId}
        aria-invalid={input.error ? true : inputAttrs?.['aria-invalid']}
        className={[prefix, `${prefix}-size-${size}`, inputAttrs?.className]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...(fitWidth ? { flex: `0 1 ${fit.value}`, width: fit.value, minWidth: 0 } : {}),
          ...inputAttrs?.style,
        }}
        defaultValue={input.value}
        value={undefined}
        type={type}
        placeholder={placeholder}
        data-fit-width-content={
          fitWidth &&
          foundation.getFitWidthText(input.compositionValue, type === 'password', placeholder)
            ? ''
            : undefined
        }
        readOnly={!!readonly}
        disabled={form.mergedDisabled}
        onInput={(event) => {
          inputAttrs?.onInput?.(event);
          foundation.input(
            event.currentTarget.value,
            (event.nativeEvent as InputEvent).inputType,
            event.nativeEvent,
          );
        }}
        onChange={inputAttrs?.onChange}
        onKeyDown={(event) => {
          if (inputAttrs?.onKeyDown) inputAttrs.onKeyDown(event);
          else onKeyDown?.(event.nativeEvent);
          if (readonly && !form.mergedDisabled && isReadonlyModificationKey(event.nativeEvent))
            tip.show();
          foundation.keydown(event.nativeEvent);
        }}
        onFocus={(event) => {
          inputAttrs?.onFocus?.(event);
          foundation.focus(event.nativeEvent);
        }}
        onBlur={(event) => {
          inputAttrs?.onBlur?.(event);
          foundation.blur(event.nativeEvent);
        }}
        onCompositionStart={(event) => {
          (inputAttrs?.onCompositionStart ?? onCompositionStart)?.(event);
          composition(event);
        }}
        onCompositionUpdate={(event) => {
          (inputAttrs?.onCompositionUpdate ?? onCompositionUpdate)?.(event);
          composition(event);
        }}
        onCompositionEnd={(event) => {
          (inputAttrs?.onCompositionEnd ?? onCompositionEnd)?.(event);
          composition(event);
        }}
      />
      {clear && (
        <span
          role="button"
          tabIndex={0}
          aria-label={t('a11y.clear')}
          className={`${icon}-hover ${prefix}-icon-hover ${prefix}-clear-btn`}
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
      {(hasContent(suffix) || (!!maxLength && showWordLimit) || form.feedback) && (
        <span
          className={[`${prefix}-suffix`, form.feedback && `${prefix}-suffix-has-feedback`]
            .filter(Boolean)
            .join(' ')}
        >
          {!!maxLength && showWordLimit && (
            <span className={`${prefix}-word-limit`}>
              {foundation.getLength(input.value)}/{foundation.getMaxLength()}
            </span>
          )}
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
  );
  return (
    <Tooltip popupVisible={tip.visible} content={tip.text} position="top">
      {hasOuter ? (
        <span
          {...wrapperAttributes}
          onMouseDown={onMouseDown}
          className={[
            `${prefix}-outer`,
            `${prefix}-outer-size-${size}`,
            hasContent(suffix) && `${prefix}-outer-has-suffix`,
            form.mergedDisabled && `${prefix}-outer-disabled`,
            fitWidth && `${prefix}-fit-width`,
            maxWFull && `${prefix}-max-w-full`,
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {hasContent(prepend) && <span className={`${prefix}-prepend`}>{prepend}</span>}
          {content}
          {hasContent(append) && <span className={`${prefix}-append`}>{append}</span>}
        </span>
      ) : (
        content
      )}
    </Tooltip>
  );
}

export interface InputPasswordProps extends Omit<InputProps, 'type' | 'ref'> {
  visibility?: boolean;
  defaultVisibility?: boolean;
  invisibleButton?: boolean;
  onVisibilityChange?: (masked: boolean) => void;
  onVisibilityUpdate?: (masked: boolean) => void;
  ref?: Ref<InputPasswordInstance>;
}
export type InputPasswordInstance = Pick<InputInstance, 'focus' | 'blur'>;
export function InputPassword({
  visibility,
  defaultVisibility = true,
  invisibleButton = true,
  onVisibilityChange,
  onVisibilityUpdate,
  suffix,
  className,
  ref,
  ...props
}: InputPasswordProps) {
  const prefix = usePrefix('input-password');
  const icon = usePrefix('icon');
  const [local, setLocal] = useState(defaultVisibility);
  const masked = visibility ?? local;
  const current = useRef({ masked, onVisibilityChange, onVisibilityUpdate });
  current.current = { masked, onVisibilityChange, onVisibilityUpdate };
  const [foundation] = useState(() =>
    createInputPasswordFoundation(
      {
        get masked() {
          return current.current.masked;
        },
      },
      (value) => current.current.onVisibilityChange?.(value),
      (value) => current.current.onVisibilityUpdate?.(value),
      setLocal,
    ),
  );
  const input = useRef<InputInstance>(null);
  useImperativeHandle(
    ref,
    () => ({ focus: () => input.current?.focus(), blur: () => input.current?.blur() }),
    [],
  );
  return (
    <InputRoot
      {...props}
      ref={input}
      type={masked ? 'password' : 'text'}
      className={[prefix, className].filter(Boolean).join(' ')}
      suffix={
        invisibleButton || hasContent(suffix) ? (
          <>
            {invisibleButton && (
              <span
                className={`${icon}-hover`}
                role="button"
                tabIndex={0}
                aria-label={masked ? 'Show password' : 'Hide password'}
                aria-pressed={!masked}
                onMouseDown={(event) => event.preventDefault()}
                onMouseUp={(event) => event.preventDefault()}
                onClick={() => foundation.toggle()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    foundation.toggle();
                  }
                }}
              >
                <EyeIcon invisible={masked} />
              </span>
            )}
            {suffix}
          </>
        ) : undefined
      }
    />
  );
}

export interface InputSearchProps extends Omit<InputProps, 'ref'> {
  searchButton?: boolean;
  loading?: boolean;
  buttonText?: ReactNode;
  buttonIcon?: ReactNode;
  buttonProps?: ButtonProps;
  onSearch?: (value: string, event: MouseEvent) => void;
  ref?: Ref<InputSearchInstance>;
}
export interface InputSearchInstance extends Pick<InputInstance, 'focus' | 'blur'> {
  readonly inputRef: InputInstance | null;
}
function SearchIcon() {
  const prefix = usePrefix('icon');
  return (
    <svg
      className={`${prefix} ${prefix}-search`}
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path d="M33.072 33.071c6.248-6.248 6.248-16.379 0-22.627-6.249-6.249-16.38-6.249-22.628 0s-6.248 16.379 0 22.627 16.38 6.248 22.628 0Zm0 0 8.485 8.485" />
    </svg>
  );
}
export function InputSearch({
  searchButton = false,
  loading = false,
  buttonText,
  buttonIcon,
  buttonProps,
  onSearch,
  ref,
  suffix,
  append,
  className,
  ...props
}: InputSearchProps) {
  const prefix = usePrefix('input-search');
  const icon = usePrefix('icon');
  const input = useRef<InputInstance>(null);
  const current = useRef(onSearch);
  current.current = onSearch;
  const [foundation] = useState(() =>
    createInputSearchFoundation(
      {
        get input() {
          return input.current?.inputRef ?? undefined;
        },
      },
      (value, event) => current.current?.(value, event),
    ),
  );
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return input.current;
      },
      focus: () => input.current?.focus(),
      blur: () => input.current?.blur(),
    }),
    [],
  );
  return (
    <InputRoot
      {...props}
      ref={input}
      className={[prefix, className].filter(Boolean).join(' ')}
      suffix={
        searchButton ? (
          suffix
        ) : (
          <>
            {loading ? (
              <LoadingIcon />
            ) : (
              <span
                className={`${icon}-hover`}
                role="button"
                tabIndex={0}
                aria-label="Search"
                onClick={(event) => foundation.handleClick(event.nativeEvent)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    foundation.handleClick(event.nativeEvent as unknown as MouseEvent);
                  }
                }}
              >
                <SearchIcon />
              </span>
            )}
            {suffix}
          </>
        )
      }
      append={
        searchButton ? (
          <Button
            type="primary"
            size={props.size}
            {...buttonProps}
            className={[`${prefix}-btn`, buttonProps?.className].filter(Boolean).join(' ')}
            disabled={props.disabled || buttonProps?.disabled}
            loading={loading || buttonProps?.loading}
            icon={buttonIcon ?? (!hasContent(buttonText) ? <SearchIcon /> : undefined)}
            onClick={(event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
              if (buttonProps?.href !== undefined)
                buttonProps.onClick?.(event as React.MouseEvent<HTMLAnchorElement>);
              else buttonProps?.onClick?.(event as React.MouseEvent<HTMLButtonElement>);
              foundation.handleClick(event.nativeEvent);
            }}
          >
            {buttonText}
          </Button>
        ) : (
          append
        )
      }
    />
  );
}
export type InputGroupInstance = HTMLDivElement;
export interface InputGroupProps extends ComponentPropsWithRef<'div'> {}
export function InputGroup({ className, ...props }: InputGroupProps) {
  const prefix = usePrefix('input-group');
  return <div {...props} className={[prefix, className].filter(Boolean).join(' ')} />;
}
export const Input = Object.assign(InputRoot, {
  Password: InputPassword,
  Search: InputSearch,
  Group: InputGroup,
});
export default Input;
