import type { RadioValue } from './types.js';

import { isNull } from '../_utils/is.js';

export interface RadioAdapter<E> {
  isGroup(): boolean;
  getGroupValue(): RadioValue | undefined;
  getModel(): RadioValue | undefined;
  getInternalChecked(): boolean;
  getResolvedValue(): RadioValue;
  setInternalChecked(value: boolean): void;
  onGroupChange(value: RadioValue, event: E): void;
  onUpdate(value: RadioValue): void;
  onChange(value: RadioValue, event: E): void;
  onFormChange(event: E): void;
  afterChange(): void;
}

export function createRadioFoundation<E>(adapter: RadioAdapter<E>) {
  function isChecked() {
    if (adapter.isGroup()) return adapter.getGroupValue() === adapter.getResolvedValue();
    if (adapter.getModel() !== undefined) return adapter.getModel() === adapter.getResolvedValue();
    return adapter.getInternalChecked();
  }
  function change(event: E) {
    adapter.setInternalChecked(true);
    if (adapter.isGroup()) adapter.onGroupChange(adapter.getResolvedValue(), event);
    else {
      adapter.onUpdate(adapter.getResolvedValue());
      adapter.onChange(adapter.getResolvedValue(), event);
      adapter.onFormChange(event);
    }
    adapter.afterChange();
  }
  function syncModel(value: RadioValue | null | undefined) {
    if (value === undefined || isNull(value)) adapter.setInternalChecked(false);
  }
  return { isChecked, change, syncModel };
}

export interface RadioGroupAdapter<E> {
  getModel(): RadioValue | undefined;
  getInternal(): RadioValue;
  setInternal(value: RadioValue): void;
  incrementChangeCount(): void;
  onUpdate(value: RadioValue): void;
  onChange(value: RadioValue, event: E): void;
  onFormChange(event: E): void;
}

export function createRadioGroupFoundation<E>(adapter: RadioGroupAdapter<E>) {
  const getValue = () => adapter.getModel() ?? adapter.getInternal();
  function change(value: RadioValue, event: E) {
    adapter.incrementChangeCount();
    adapter.setInternal(value);
    adapter.onUpdate(value);
    adapter.onChange(value, event);
    adapter.onFormChange(event);
  }
  function syncValue(value: RadioValue) {
    if (adapter.getInternal() !== value) adapter.setInternal(value);
  }
  function syncModel(value: RadioValue | null | undefined) {
    if (value === undefined || isNull(value)) adapter.setInternal('');
  }
  return { getValue, change, syncValue, syncModel };
}
