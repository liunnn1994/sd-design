import type { CascaderModelValue, CascaderOptionInfo, CascaderSingleValue } from './types.js';

import { getLeafOptionInfos, getLeafOptionKeys } from './data.js';

export interface CascaderAdapter<P> {
  getMultiple: () => boolean;
  getPathMode: () => boolean;
  getCheckStrictly: () => boolean;
  getReadonly?: () => boolean;
  getValueMap: () => Map<string, CascaderSingleValue>;
  getLeafOptions: () => Map<string, CascaderOptionInfo<P>>;
  setValue: (value: CascaderModelValue) => void;
  setSelectedPath: (key?: string) => void;
  setActiveKey: (key?: string) => void;
  onReadonly?: () => void;
  afterSingleSelect?: () => void;
  afterMultipleSelect?: () => void;
  onFormChange?: () => void;
  updateValue: (value: CascaderModelValue) => void;
  change: (value: CascaderModelValue) => void;
}

/** Shared by the dropdown and standalone panel; view effects are adapter callbacks. */
export function createCascaderFoundation<P>(adapter: CascaderAdapter<P>) {
  function updateValue(values: CascaderSingleValue[]) {
    const value = adapter.getMultiple() ? values : (values[0] ?? '');
    if (values.length === 0) {
      adapter.setSelectedPath();
      adapter.setActiveKey();
    }
    adapter.setValue(value);
    adapter.updateValue(value);
    adapter.change(value);
    adapter.onFormChange?.();
  }
  function selectSingle(option: CascaderOptionInfo<P>) {
    updateValue([adapter.getPathMode() ? option.pathValue : option.value]);
    adapter.afterSingleSelect?.();
  }
  function selectMultiple(option: CascaderOptionInfo<P>, checked: boolean) {
    if (checked) {
      const infos = adapter.getCheckStrictly() ? [option] : getLeafOptionInfos(option);
      updateValue([
        ...adapter.getValueMap().values(),
        ...infos
          .filter((item) => !adapter.getValueMap().has(item.key))
          .map((item) => (adapter.getPathMode() ? item.pathValue : item.value)),
      ]);
    } else {
      const keys = adapter.getCheckStrictly() ? [option.key] : getLeafOptionKeys(option);
      const values: CascaderSingleValue[] = [];
      adapter.getValueMap().forEach((value, key) => {
        if (!keys.includes(key)) values.push(value);
      });
      updateValue(values);
    }
    adapter.afterMultipleSelect?.();
  }
  function click(option: CascaderOptionInfo<P>, checked?: boolean) {
    if (adapter.getReadonly?.()) {
      adapter.onReadonly?.();
      return;
    }
    if (option.disabled || option.selectionDisabled) return;
    if (!adapter.getMultiple() && !adapter.getCheckStrictly() && !option.isLeaf) return;
    if (adapter.getMultiple()) selectMultiple(option, checked ?? true);
    else selectSingle(option);
  }
  function modeChanged() {
    const values: CascaderSingleValue[] = [];
    adapter.getValueMap().forEach((value, key) => {
      const option = adapter.getLeafOptions().get(key);
      if (option) values.push(adapter.getPathMode() ? option.pathValue : option.value);
    });
    updateValue(values);
  }
  function remove(key: string) {
    if (adapter.getReadonly?.()) {
      adapter.onReadonly?.();
      return;
    }
    if (adapter.getMultiple()) {
      const option = adapter.getLeafOptions().get(key);
      if (option) selectMultiple(option, false);
      else {
        const values: CascaderSingleValue[] = [];
        adapter.getValueMap().forEach((value, current) => {
          if (current !== key) values.push(value);
        });
        updateValue(values);
      }
    }
  }
  function clear() {
    if (adapter.getReadonly?.()) {
      adapter.onReadonly?.();
      return false;
    }
    const values: CascaderSingleValue[] = [];
    if (adapter.getMultiple()) {
      adapter.getValueMap().forEach((value, key) => {
        const option = adapter.getLeafOptions().get(key);
        if (option?.disabled) values.push(adapter.getPathMode() ? option.pathValue : option.value);
      });
    }
    updateValue(values);
    return true;
  }
  return { updateValue, click, modeChanged, remove, clear };
}
