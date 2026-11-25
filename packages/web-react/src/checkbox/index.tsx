import type { ComponentPropsWithRef, ComponentPropsWithoutRef, ReactNode } from 'react';

import { normalizeChoiceOptions } from '@sdata/web-core/_utils/choice-options';
import {
  createCheckboxFoundation,
  createCheckboxGroupFoundation,
  getCheckboxChecked,
  getCheckboxDisabled,
  type CheckboxValue,
  type CheckboxModelValue,
} from '@sdata/web-core/checkbox/foundation';
import { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';

import { useChoiceInput } from '../_shared/use-choice-input.js';
import { usePrefix } from '../config-provider/index.js';
import { useFormItem } from '../form/context.js';

export type { CheckboxValue, CheckboxModelValue } from '@sdata/web-core/checkbox/foundation';
export interface CheckboxRenderState {
  checked: boolean;
  disabled: boolean;
}
export interface CheckboxOption {
  value: string | number;
  label?: ReactNode | (() => ReactNode);
  disabled?: boolean;
  indeterminate?: boolean;
}
export interface CheckboxProps extends Omit<ComponentPropsWithRef<'label'>, 'onChange'> {
  modelValue?: CheckboxModelValue | undefined;
  value?: CheckboxValue;
  defaultChecked?: boolean;
  disabled?: boolean | undefined;
  indeterminate?: boolean | undefined;
  tabIndex?: number;
  uninjectGroupContext?: boolean;
  renderCheckbox?: (state: CheckboxRenderState) => ReactNode;
  onValueChange?: (value: CheckboxModelValue) => void;
  onChange?: (value: CheckboxModelValue, event: Event) => void;
  inputAttrs?: ComponentPropsWithoutRef<'input'>;
}
export interface CheckboxGroupProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'onChange' | 'defaultValue'
> {
  value?: CheckboxValue[];
  defaultValue?: CheckboxValue[];
  max?: number;
  disabled?: boolean;
  direction?: 'horizontal' | 'vertical';
  options?: (string | number | CheckboxOption)[];
  renderLabel?: (option: CheckboxOption) => ReactNode;
  renderCheckbox?: (state: CheckboxRenderState) => ReactNode;
  onValueChange?: (value: CheckboxValue[]) => void;
  onChange?: (value: CheckboxValue[], event: Event) => void;
}
const GroupContext = createContext<
  | {
      value: CheckboxValue[];
      disabled: boolean;
      maxed: boolean;
      change(value: CheckboxValue[], event: Event): void;
      renderCheckbox?: CheckboxProps['renderCheckbox'];
    }
  | undefined
>(undefined);

function CheckboxRoot(props: CheckboxProps) {
  const {
    modelValue,
    value,
    defaultChecked = false,
    disabled: _disabled,
    indeterminate = false,
    tabIndex,
    uninjectGroupContext,
    renderCheckbox,
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
  const prefix = usePrefix('checkbox');
  const hover = usePrefix('icon-hover');
  const [inner, setInner] = useState(defaultChecked);
  const current = useRef({ props, group, form, inner, restore: () => {} });
  current.current = { props, group, form, inner, restore: current.current.restore };
  const getValue = () =>
    current.current.group?.value ?? current.current.props.modelValue ?? current.current.inner;
  const checked = !!getCheckboxChecked(getValue(), value ?? true);
  const disabled = getCheckboxDisabled(group?.disabled, form.mergedDisabled, checked, group?.maxed);
  const native = useChoiceInput(checked, indeterminate);
  current.current.restore = native.restore;
  const [foundation] = useState(() =>
    createCheckboxFoundation<Event>({
      getValue,
      getResolvedValue: () => current.current.props.value ?? true,
      isGroup: () => !!current.current.group,
      setInternalChecked: setInner,
      onGroupChange: (value, event) => current.current.group?.change(value, event),
      onUpdate: (value) => current.current.props.onValueChange?.(value),
      onChange: (value, event) => current.current.props.onChange?.(value, event),
      onFormChange: (event) => current.current.form.eventHandlers?.onChange?.(event),
      afterChange: () => current.current.restore(),
    }),
  );
  const previous = useRef(modelValue);
  useLayoutEffect(() => {
    if (!Object.is(previous.current, modelValue)) {
      previous.current = modelValue;
      foundation.syncModel(modelValue);
    }
  });
  const custom = renderCheckbox ?? group?.renderCheckbox;
  return (
    <label
      {...attributes}
      aria-disabled={disabled}
      className={[
        prefix,
        checked && `${prefix}-checked`,
        indeterminate && `${prefix}-indeterminate`,
        disabled && `${prefix}-disabled`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        {...inputAttrs}
        ref={native.input}
        type="checkbox"
        tabIndex={tabIndex ?? inputAttrs?.tabIndex}
        checked={checked}
        value={value === undefined ? undefined : String(value)}
        disabled={disabled}
        className={[`${prefix}-target`, inputAttrs?.className].filter(Boolean).join(' ')}
        onClick={(event) => {
          inputAttrs?.onClick?.(event);
          event.stopPropagation();
        }}
        onChange={(event) => {
          inputAttrs?.onChange?.(event);
          foundation.change(event.currentTarget.checked, event.nativeEvent);
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
      {custom ? (
        custom({ checked, disabled })
      ) : (
        <span
          className={[hover, `${prefix}-icon-hover`, (disabled || checked) && `${hover}-disabled`]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={`${prefix}-icon`}>
            {checked && (
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 1024 1024"
                width="200"
                height="200"
                fill="currentColor"
                className={`${prefix}-icon-check`}
              >
                <path d="M877.44815445 206.10060629a64.72691371 64.72691371 0 0 0-95.14856334 4.01306852L380.73381888 685.46812814 235.22771741 533.48933518a64.72691371 64.72691371 0 0 0-92.43003222-1.03563036l-45.82665557 45.82665443a64.72691371 64.72691371 0 0 0-0.90617629 90.61767965l239.61903446 250.10479331a64.72691371 64.72691371 0 0 0 71.19960405 15.14609778 64.33855261 64.33855261 0 0 0 35.08198741-21.23042702l36.24707186-42.71976334 40.5190474-40.77795556-3.36579926-3.49525333 411.40426297-486.74638962a64.72691371 64.72691371 0 0 0-3.88361443-87.64024149l-45.3088404-45.43829334z" />
              </svg>
            )}
          </span>
        </span>
      )}
      {children != null && children !== false && (
        <span className={`${prefix}-label`}>{children}</span>
      )}
    </label>
  );
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const {
    value,
    defaultValue = [],
    max: _max,
    disabled: _disabled,
    direction = 'horizontal',
    options,
    renderLabel,
    renderCheckbox,
    onValueChange: _onValueChange,
    onChange: _onChange,
    children,
    className,
    ...attributes
  } = props;
  const form = useFormItem(props);
  const prefix = usePrefix('checkbox-group');
  const [inner, setInner] = useState(defaultValue);
  const current = useRef({ props, form, inner });
  current.current = { props, form, inner };
  const [foundation] = useState(() =>
    createCheckboxGroupFoundation<Event>({
      getModel: () => current.current.props.value,
      getInternal: () => current.current.inner,
      getMax: () => current.current.props.max,
      setInternal: setInner,
      onUpdate: (value) => current.current.props.onValueChange?.(value),
      onChange: (value, event) => current.current.props.onChange?.(value, event),
      onFormChange: (event) => current.current.form.eventHandlers?.onChange?.(event),
    }),
  );
  const previous = useRef(value);
  useLayoutEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      foundation.syncModel(value);
    }
  });
  const normalized: CheckboxOption[] = normalizeChoiceOptions<CheckboxOption>(options);
  return (
    <GroupContext.Provider
      value={{
        value: foundation.getValue(),
        disabled: form.mergedDisabled,
        maxed: foundation.isMaxed(),
        change: foundation.change,
        renderCheckbox,
      }}
    >
      <span
        {...attributes}
        role="group"
        className={[prefix, `${prefix}-direction-${direction}`, className]
          .filter(Boolean)
          .join(' ')}
      >
        {normalized.length
          ? normalized.map((option) => (
              <CheckboxRoot
                key={`${typeof option.value}:${option.value}`}
                value={option.value}
                disabled={option.disabled}
                indeterminate={option.indeterminate}
              >
                {renderLabel
                  ? renderLabel(option)
                  : typeof option.label === 'function'
                    ? option.label()
                    : option.label}
              </CheckboxRoot>
            ))
          : children}
      </span>
    </GroupContext.Provider>
  );
}
export const Checkbox = Object.assign(CheckboxRoot, { Group: CheckboxGroup });
export default Checkbox;

export type CheckboxInstance = HTMLLabelElement;
export type CheckboxGroupInstance = HTMLSpanElement;
