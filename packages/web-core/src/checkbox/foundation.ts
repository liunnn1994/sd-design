import { isArray, isNull } from '../_utils/is.js';

export type CheckboxValue = string | number | boolean;
export type CheckboxModelValue = boolean | CheckboxValue[];

export function getCheckboxChecked(
  value: CheckboxModelValue | undefined,
  resolvedValue: CheckboxValue,
) {
  return isArray(value) ? value.includes(resolvedValue) : value;
}

export function getCheckboxDisabled(
  groupDisabled: boolean | undefined,
  formDisabled: boolean,
  checked: boolean,
  groupMaxed: boolean | undefined,
) {
  return groupDisabled || formDisabled || (!checked && groupMaxed) || false;
}

export interface CheckboxAdapter<E> {
  getValue(): CheckboxModelValue | undefined;
  getResolvedValue(): CheckboxValue;
  isGroup(): boolean;
  setInternalChecked(value: boolean): void;
  onGroupChange(value: CheckboxValue[], event: E): void;
  onUpdate(value: CheckboxModelValue): void;
  onChange(value: CheckboxModelValue, event: E): void;
  onFormChange(event: E): void;
  afterChange(): void;
}

export function createCheckboxFoundation<E>(adapter: CheckboxAdapter<E>) {
  function change(checked: boolean, event: E) {
    let newValue: CheckboxModelValue = checked;
    if (isArray(adapter.getValue())) {
      const values = new Set(adapter.getValue() as CheckboxValue[]);
      if (checked) values.add(adapter.getResolvedValue());
      else values.delete(adapter.getResolvedValue());
      newValue = Array.from(values);
    }
    adapter.setInternalChecked(checked);
    if (adapter.isGroup() && isArray(newValue)) adapter.onGroupChange(newValue, event);
    else {
      adapter.onUpdate(newValue);
      adapter.onChange(newValue, event);
      adapter.onFormChange(event);
    }
    adapter.afterChange();
  }
  function syncModel(value: CheckboxModelValue | null | undefined) {
    if (value === undefined || isNull(value)) adapter.setInternalChecked(false);
  }
  return { change, syncModel };
}

export interface CheckboxGroupAdapter<E> {
  getModel(): CheckboxValue[] | undefined;
  getInternal(): CheckboxValue[];
  getMax(): number | undefined;
  setInternal(value: CheckboxValue[]): void;
  onUpdate(value: CheckboxValue[]): void;
  onChange(value: CheckboxValue[], event: E): void;
  onFormChange(event: E): void;
}

export function createCheckboxGroupFoundation<E>(adapter: CheckboxGroupAdapter<E>) {
  const getValue = () =>
    isArray(adapter.getModel()) ? adapter.getModel()! : adapter.getInternal();
  const isMaxed = () =>
    adapter.getMax() === undefined ? false : getValue().length >= adapter.getMax()!;
  function change(value: CheckboxValue[], event: E) {
    adapter.setInternal(value);
    adapter.onUpdate(value);
    adapter.onChange(value, event);
    adapter.onFormChange(event);
  }
  function syncModel(value: CheckboxValue[] | undefined) {
    adapter.setInternal(isArray(value) ? [...value] : []);
  }
  const isChecked = (value: CheckboxValue) => getValue().includes(value);
  return { getValue, isMaxed, isChecked, change, syncModel };
}
