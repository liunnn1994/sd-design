import type {
  InputMaskProps as CoreProps,
  InputMaskSelection,
} from '@sdata/web-core/input-mask/types';

import { createInputMaskFoundation } from '@sdata/web-core/input-mask/foundation';
import { createInputMaskPresets } from '@sdata/web-core/input-mask/presets';
import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { InputProps, InputInstance } from '../input/index.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { usePrefix } from '../config-provider/index.js';
import { Input } from '../input/index.js';
import { useI18n } from '../locale/index.js';
import zhCN from '../locale/lang/zh-cn.js';

export type {
  InputMaskToken,
  InputMaskPattern,
  InputMaskSelection,
  InputMaskState,
  InputMaskBeforeChange,
  InputMaskPresetDefinition,
  InputMaskPresetName,
} from '@sdata/web-core/input-mask/types';
export const inputMaskPresets = createInputMaskPresets(zhCN.inputMask!.ipPlaceholder);
export {
  defaultInputMaskFormatChars,
  formatInputMask,
} from '@sdata/web-core/input-mask/mask-engine';
export type InputMaskInstance = InputInstance;
export interface InputMaskProps
  extends
    Omit<InputProps, 'type'>,
    Pick<
      CoreProps,
      'mask' | 'preset' | 'maskChar' | 'formatChars' | 'alwaysShowMask' | 'beforeMaskedValueChange'
    > {
  onComplete?: (value: string) => void;
}

export function InputMask(props: InputMaskProps) {
  const {
    value,
    defaultValue: _defaultValue,
    mask: _mask,
    preset,
    maskChar: _maskChar,
    formatChars,
    alwaysShowMask: _alwaysShowMask,
    beforeMaskedValueChange: _beforeMaskedValueChange,
    onComplete: _onComplete,
    allowClear = false,
    maxLength,
    showWordLimit,
    inputAttrs,
    placeholder,
    className,
    ref,
    onValueChange: _onValueChange,
    onInput: _onInput,
    onChange: _onChange,
    onPressEnter: _onPressEnter,
    onClear: _onClear,
    onFocus: _onFocus,
    onBlur: _onBlur,
    ...attributes
  } = props;
  const prefix = usePrefix('input-mask');
  const { t } = useI18n();
  const input = useRef<InputInstance>(null);
  const current = useRef(props);
  current.current = props;
  const afterRender = useAfterRender();
  const [, render] = useState(0);
  const state = useRef({
    focused: false,
    lastSelection: null as InputMaskSelection | null,
    complete: false,
    innerValue: '',
  });
  const [foundation] = useState(() => {
    let initialized = false;
    const refresh = () => {
      if (initialized) render((version) => version + 1);
    };
    const result: ReturnType<typeof createInputMaskFoundation> = createInputMaskFoundation(
      {
        props: {
          get modelValue() {
            return current.current.value ?? undefined;
          },
          get defaultValue() {
            return current.current.defaultValue ?? '';
          },
          get mask() {
            return current.current.mask;
          },
          get preset() {
            return current.current.preset;
          },
          get maskChar() {
            return current.current.maskChar === undefined ? '_' : current.current.maskChar;
          },
          get formatChars() {
            return current.current.formatChars;
          },
          get alwaysShowMask() {
            return current.current.alwaysShowMask ?? false;
          },
          get beforeMaskedValueChange() {
            return current.current.beforeMaskedValueChange;
          },
          get inputAttrs() {
            return current.current.inputAttrs;
          },
        },
        presets: inputMaskPresets,
        get inputElement() {
          return input.current?.inputRef ?? undefined;
        },
        get focused() {
          return state.current.focused;
        },
        set focused(next) {
          state.current.focused = next;
          refresh();
        },
        get lastSelection() {
          return state.current.lastSelection;
        },
        set lastSelection(next) {
          state.current.lastSelection = next;
        },
        get complete() {
          return state.current.complete;
        },
        set complete(next) {
          state.current.complete = next;
        },
        get innerValue() {
          return state.current.innerValue;
        },
        set innerValue(next) {
          state.current.innerValue = next;
          refresh();
        },
        get presetDefinition() {
          return result.getPresetDefinition();
        },
        get effectiveMask() {
          return result.getEffectiveMask();
        },
        get effectiveFormatChars() {
          return result.getEffectiveFormatChars();
        },
        get effectiveMaskChar() {
          return result.getEffectiveMaskChar();
        },
        get hasValue() {
          return result.getHasValue();
        },
      },
      {
        update: (next) => current.current.onValueChange?.(next),
        complete: (next) => current.current.onComplete?.(next),
        input: (next, event) => current.current.onInput?.(next, event),
        change: (next, event) => current.current.onChange?.(next, event),
        pressEnter: (event) => current.current.onPressEnter?.(event),
        clear: (event) => current.current.onClear?.(event),
        focus: (event) => current.current.onFocus?.(event),
        blur: (event) => current.current.onBlur?.(event),
        afterRender: (task) => {
          void afterRender().then(task);
        },
      },
    );
    result.initialize();
    initialized = true;
    return result;
  });
  const effectiveFormatChars = useMemo(
    () => foundation.getEffectiveFormatChars(),
    [foundation, preset, formatChars],
  );
  const maskState = [
    foundation.getEffectiveMask(),
    foundation.getPresetDefinition(),
    foundation.getEffectiveMaskChar(),
    effectiveFormatChars,
  ] as const;
  const previous = useRef({ value, maskState });
  useLayoutEffect(() => {
    if (value !== previous.current.value) foundation.syncModel(value);
    if (maskState.some((item, index) => item !== previous.current.maskState[index]))
      foundation.syncMask(maskState, previous.current.maskState);
    previous.current = { value, maskState };
  });
  useLayoutEffect(() => {
    foundation.mount();
    return foundation.dispose;
  }, [foundation]);
  useImperativeHandle(
    ref,
    () => ({
      get inputRef() {
        return input.current?.inputRef ?? null;
      },
      focus: () => input.current?.focus(),
      blur: () => input.current?.blur(),
    }),
    [],
  );
  const { inputmode, ...nativeAttrs } = foundation.getMergedInputAttrs();
  const lengthManaged = foundation.getLengthManaged();
  return (
    <Input
      {...attributes}
      ref={input}
      className={[prefix, className].filter(Boolean).join(' ')}
      value={foundation.getDisplayValue()}
      allowClear={allowClear && foundation.getHasValue()}
      maxLength={lengthManaged ? undefined : maxLength}
      showWordLimit={!lengthManaged && showWordLimit}
      inputAttrs={{
        ...nativeAttrs,
        inputMode:
          inputAttrs?.inputMode ??
          (inputmode as NonNullable<InputProps['inputAttrs']>['inputMode']),
      }}
      placeholder={
        placeholder ??
        (preset === 'ip'
          ? t('inputMask.ipPlaceholder')
          : foundation.getPresetDefinition()?.placeholder)
      }
      onValueChange={foundation.handleModelUpdate}
      onInput={foundation.handleInput}
      onChange={foundation.handleChange}
      onPressEnter={foundation.handlePressEnter}
      onClear={foundation.handleClear}
      onFocus={foundation.handleFocus}
      onBlur={foundation.handleBlur}
    />
  );
}

export default InputMask;
