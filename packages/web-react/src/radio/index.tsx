import type { RadioType, RadioValue } from '@sdata/web-core/radio/types';
import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';

import { normalizeChoiceOptions } from '@sdata/web-core/_utils/choice-options';
import {
  createRadioFoundation,
  createRadioGroupFoundation,
} from '@sdata/web-core/radio/foundation';
import { createContext, useContext, useId, useLayoutEffect, useRef, useState } from 'react';

import { useChoiceInput } from '../_shared/use-choice-input.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';

export type { RadioType, RadioValue } from '@sdata/web-core/radio/types';
export interface RadioRenderState {
  checked: boolean;
  disabled: boolean;
}
export interface RadioOption {
  value: string | number;
  label?: ReactNode | (() => ReactNode);
  disabled?: boolean;
}
export interface RadioProps extends Omit<ComponentPropsWithRef<'label'>, 'onChange'> {
  modelValue?: RadioValue | undefined;
  value?: RadioValue;
  defaultChecked?: boolean;
  disabled?: boolean | undefined;
  type?: RadioType;
  uninjectGroupContext?: boolean;
  renderRadio?: (state: RadioRenderState) => ReactNode;
  onValueChange?: (value: RadioValue) => void;
  onChange?: (value: RadioValue, event: Event) => void;
  inputAttrs?: ComponentPropsWithoutRef<'input'>;
}
export interface RadioGroupProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'onChange' | 'defaultValue'
> {
  value?: RadioValue;
  defaultValue?: RadioValue;
  disabled?: boolean;
  type?: RadioType;
  size?: 'mini' | 'small' | 'medium' | 'large';
  direction?: 'horizontal' | 'vertical';
  options?: (string | number | RadioOption)[];
  renderLabel?: (option: RadioOption) => ReactNode;
  renderRadio?: (state: RadioRenderState) => ReactNode;
  onValueChange?: (value: RadioValue) => void;
  onChange?: (value: RadioValue, event: Event) => void;
}
const GroupContext = createContext<
  | {
      value: RadioValue;
      disabled: boolean;
      type: RadioType;
      name: string;
      change(value: RadioValue, event: Event): void;
      renderRadio?: RadioProps['renderRadio'];
    }
  | undefined
>(undefined);

function RadioRoot(props: RadioProps) {
  const {
    modelValue,
    value = true,
    defaultChecked = false,
    disabled: _disabled,
    type = 'radio',
    uninjectGroupContext,
    renderRadio,
    onValueChange: _onValueChange,
    onChange: _onChange,
    inputAttrs,
    children,
    className,
    ...attributes
  } = props;
  const inherited = useContext(GroupContext);
  const group = uninjectGroupContext ? undefined : inherited;
  const form = useFormItem(props);
  const prefix = usePrefix('radio');
  const hover = usePrefix('icon-hover');
  const [inner, setInner] = useState(defaultChecked);
  const current = useRef({ props, group, form, inner, restore: () => {} });
  current.current = { props, group, form, inner, restore: current.current.restore };
  const [foundation] = useState(() =>
    createRadioFoundation<Event>({
      isGroup: () => !!current.current.group,
      getGroupValue: () => current.current.group?.value,
      getModel: () => current.current.props.modelValue,
      getInternalChecked: () => current.current.inner,
      getResolvedValue: () => current.current.props.value ?? true,
      setInternalChecked: setInner,
      onGroupChange: (value, event) => current.current.group?.change(value, event),
      onUpdate: (value) => current.current.props.onValueChange?.(value),
      onChange: (value, event) => current.current.props.onChange?.(value, event),
      onFormChange: (event) => current.current.form.eventHandlers?.onChange?.(event),
      afterChange: () => current.current.restore(),
    }),
  );
  const checked = foundation.isChecked();
  const disabled = !!(group?.disabled || form.mergedDisabled);
  const mergedType = group?.type ?? type;
  const native = useChoiceInput(checked);
  current.current.restore = native.restore;
  const previous = useRef(modelValue);
  useLayoutEffect(() => {
    if (!Object.is(previous.current, modelValue)) {
      previous.current = modelValue;
      foundation.syncModel(modelValue);
    }
  });
  const custom = renderRadio ?? group?.renderRadio;
  return (
    <label
      {...attributes}
      className={[
        mergedType === 'button' ? `${prefix}-button` : prefix,
        checked && `${prefix}-checked`,
        disabled && `${prefix}-disabled`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        {...inputAttrs}
        ref={native.input}
        type="radio"
        value={String(value)}
        name={group?.name ?? inputAttrs?.name}
        checked={checked}
        disabled={disabled}
        className={[`${prefix}-target`, inputAttrs?.className].filter(Boolean).join(' ')}
        onClick={(event) => {
          inputAttrs?.onClick?.(event);
          event.stopPropagation();
        }}
        onChange={(event) => {
          inputAttrs?.onChange?.(event);
          foundation.change(event.nativeEvent);
        }}
        onFocus={(event) => {
          inputAttrs?.onFocus?.(event);
          form.eventHandlers?.onFocus?.(event.nativeEvent);
        }}
        onBlur={(event) => {
          inputAttrs?.onBlur?.(event);
          form.eventHandlers?.onBlur?.(event.nativeEvent);
        }}
      />
      {mergedType === 'button' ? (
        <span className={`${prefix}-button-content`}>{children}</span>
      ) : custom ? (
        custom({ checked, disabled })
      ) : (
        <>
          <span
            className={[hover, `${prefix}-icon-hover`, (disabled || checked) && `${hover}-disabled`]
              .filter(Boolean)
              .join(' ')}
          >
            <span className={`${prefix}-icon`} />
          </span>
          {children != null && children !== false && (
            <span className={`${prefix}-label`}>{children}</span>
          )}
        </>
      )}
    </label>
  );
}
export function RadioGroup(props: RadioGroupProps) {
  const {
    value,
    defaultValue = '',
    disabled: _disabled,
    type = 'radio',
    size: _size,
    direction = 'horizontal',
    options,
    renderLabel,
    renderRadio,
    onValueChange: _onValueChange,
    onChange: _onChange,
    children,
    className,
    ...attributes
  } = props;
  const form = useFormItem(props);
  const config = useConfig();
  const prefix = usePrefix('radio-group');
  const name = `${prefix}-${useId()}`;
  const [inner, setInner] = useState(defaultValue);
  const [, render] = useState(0);
  const current = useRef({ props, form, inner });
  current.current = { props, form, inner };
  const [foundation] = useState(() =>
    createRadioGroupFoundation<Event>({
      getModel: () => current.current.props.value,
      getInternal: () => current.current.inner,
      setInternal: setInner,
      incrementChangeCount: () => render((count) => count + 1),
      onUpdate: (value) => current.current.props.onValueChange?.(value),
      onChange: (value, event) => current.current.props.onChange?.(value, event),
      onFormChange: (event) => current.current.form.eventHandlers?.onChange?.(event),
    }),
  );
  const previous = useRef(value);
  useLayoutEffect(() => {
    if (!Object.is(previous.current, value)) {
      previous.current = value;
      foundation.syncModel(value);
    } else foundation.syncValue(foundation.getValue());
  });
  const normalized: RadioOption[] = normalizeChoiceOptions<RadioOption>(options);
  return (
    <GroupContext.Provider
      value={{
        value: foundation.getValue(),
        disabled: form.mergedDisabled,
        type,
        name,
        change: foundation.change,
        renderRadio,
      }}
    >
      <span
        {...attributes}
        role="radiogroup"
        className={[
          `${prefix}${type === 'button' ? '-button' : ''}`,
          `${prefix}-size-${form.mergedSize ?? config.size ?? 'medium'}`,
          `${prefix}-direction-${direction}`,
          form.mergedDisabled && `${prefix}-disabled`,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {normalized.length
          ? normalized.map((option) => (
              <RadioRoot
                key={`${typeof option.value}:${option.value}`}
                value={option.value}
                disabled={option.disabled}
              >
                {renderLabel
                  ? renderLabel(option)
                  : typeof option.label === 'function'
                    ? option.label()
                    : option.label}
              </RadioRoot>
            ))
          : children}
      </span>
    </GroupContext.Provider>
  );
}
export const Radio = Object.assign(RadioRoot, { Group: RadioGroup });
export default Radio;

export type RadioInstance = HTMLLabelElement;
export type RadioGroupInstance = HTMLSpanElement;
export type { RadioGroupChangeHandler } from '@sdata/web-core/radio/types';
