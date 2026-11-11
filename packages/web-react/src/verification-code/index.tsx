import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import {
  createVerificationCode,
  getVerificationCells,
} from '@sdata/web-core/verification-code/foundation';
import { Fragment, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';

import type { InputInstance, InputProps } from '../input/index.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { usePrefix } from '../config-provider/index.js';
import { Input } from '../input/index.js';
import { useI18n } from '../locale/index.js';

export interface VerificationCodeInstance {
  focus(): void;
  blur(): void;
}
export interface VerificationCodeProps extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'defaultValue' | 'onChange' | 'onInput' | 'children'
> {
  value?: string;
  defaultValue?: string;
  length?: number;
  size?: InputProps['size'];
  disabled?: boolean;
  masked?: boolean;
  readonly?: boolean | string;
  error?: boolean;
  separator?: (index: number, character: string) => ReactNode;
  formatter?: (inputValue: string, index: number, value: string) => string | boolean;
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  onFinish?: (value: string) => void;
  onInput?: (inputValue: string, index: number, event: Event) => void;
  ref?: Ref<VerificationCodeInstance>;
}

export function VerificationCode(props: VerificationCodeProps) {
  const {
    value,
    defaultValue = '',
    length = 6,
    size,
    disabled = false,
    masked = false,
    readonly = false,
    error = false,
    separator,
    formatter,
    onValueChange: _onValueChange,
    onChange: _onChange,
    onFinish: _onFinish,
    onInput: _onInput,
    ref,
    className,
    ...attributes
  } = props;
  const prefix = usePrefix('verification-code');
  const inputPrefix = usePrefix('input');
  const { t } = useI18n();
  const afterRender = useAfterRender();
  const cells = useRef<InputInstance[]>([]);
  const inner = useRef(getVerificationCells(value ?? defaultValue, length));
  const [, render] = useState(0);
  const current = useRef({
    props,
    options: { modelValue: value, length, readonly, disabled, formatter },
    defaultValue,
  });
  current.current = {
    props,
    options: { modelValue: value, length, readonly, disabled, formatter },
    defaultValue,
  };
  const [foundation] = useState(() =>
    createVerificationCode({
      get props() {
        return current.current.options;
      },
      get filled() {
        return getVerificationCells(
          current.current.props.value ?? current.current.defaultValue,
          current.current.options.length,
        );
      },
      get cells() {
        return cells.current;
      },
      get activeElement() {
        return cells.current.find(Boolean)?.inputRef?.ownerDocument.activeElement ?? null;
      },
      get inner() {
        return inner.current;
      },
      set inner(next) {
        inner.current = next;
        render((version) => version + 1);
      },
      afterRender(callback) {
        void afterRender().then(callback);
      },
      onUpdate(next) {
        render((version) => version + 1);
        current.current.props.onValueChange?.(next);
      },
      onChange(next) {
        current.current.props.onChange?.(next);
      },
      onFinish(next) {
        current.current.props.onFinish?.(next);
      },
      onInput(next, index, event) {
        current.current.props.onInput?.(next, index, event);
      },
    }),
  );
  const mergedValue = value ?? defaultValue;
  const previous = useRef({ value: mergedValue, length });
  useLayoutEffect(() => {
    if (mergedValue !== previous.current.value || length !== previous.current.length) {
      foundation.syncValue(mergedValue, previous.current.value);
      previous.current = { value: mergedValue, length };
    }
  }, [foundation, mergedValue, length]);
  useImperativeHandle(ref, () => ({ focus: foundation.focus, blur: foundation.blur }), [
    foundation,
  ]);
  return (
    <div
      role="group"
      aria-label={t('a11y.verificationCode')}
      {...attributes}
      className={[prefix, className].filter(Boolean).join(' ')}
    >
      {inner.current.map((character, index) => (
        <Fragment key={index}>
          <Input
            ref={(cell) => {
              if (cell) cells.current[index] = cell;
              else delete cells.current[index];
            }}
            type={masked ? 'password' : 'text'}
            value={character}
            size={size}
            error={error}
            disabled={disabled}
            readonly={readonly}
            className={[inputPrefix, size && `${inputPrefix}-size-${size}`]
              .filter(Boolean)
              .join(' ')}
            inputAttrs={{ 'aria-label': t('a11y.characterOf', index + 1, length) }}
            onFocus={() => foundation.focusEmpty(index)}
            onInput={(next, event) => foundation.input(index, next, event)}
            onKeyDown={(event) => foundation.keydown(index, event)}
            onPaste={(event) => foundation.paste(event.nativeEvent, index)}
            onMouseDown={(event) => foundation.cursorToEnd(event.nativeEvent, index)}
          />
          {separator?.(index, character)}
        </Fragment>
      ))}
    </div>
  );
}

export default VerificationCode;
