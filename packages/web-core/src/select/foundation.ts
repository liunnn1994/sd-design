import type {
  SelectOptionInfo,
  SelectFieldNames,
  SelectOptionValue,
  SelectOptionData,
  SelectModelValue,
  OptionValueWithKey,
} from './types.js';

import { isEmptyObject, isObject, isUndefined } from '../_utils/is.js';
import { getKeyFromValue, hasEmptyStringKey } from './options.js';
export interface SelectAdapter<E> {
  getOptions: () => Map<string, SelectOptionInfo>;
  getMultiple: () => boolean;
  getReadonly: () => boolean;
  getLimit: () => number;
  getValueKey: () => string;
  getFieldNames: () => Required<SelectFieldNames>;
  getAllowCreate: () => boolean;
  getFallbackOption: () => boolean | ((value: SelectOptionValue) => SelectOptionData) | undefined;
  getInputValue: () => string;
  getValueObjects: () => OptionValueWithKey[];
  getValueKeys: () => string[];
  getEnabledKeys: () => string[];
  getPopupVisible: () => boolean;
  getRetainInput: () => boolean;
  getAllowSearch: () => boolean;
  getSelectedOptions: () => Record<string, unknown>;
  setSelectedOptions: (options: Record<string, unknown>) => void;
  setValue: (value: SelectModelValue) => void;
  setInputValue: (value: string) => void;
  setPopupVisible: (visible: boolean) => void;
  search: (value: string) => void;
  onFormChange: () => void;
  events: {
    updateValue: (value: SelectModelValue) => void;
    change: (value: SelectModelValue) => void;
    updateInput: (value: string) => void;
    inputChange: (value: string) => void;
    exceedLimit: (value: SelectOptionValue | undefined, event: E) => void;
    remove: (value: SelectOptionValue | undefined) => void;
    clear: (event: E) => void;
  };
}
/** Construct without reading state; adapters can bind computed indexes later in setup. */
export function createSelectFoundation<E>(adapter: SelectAdapter<E>) {
  const getRawOptionFromValueKeys = (valueKeys: string[]) => {
    const optionMap: Record<string, unknown> = {};

    valueKeys.forEach((key) => {
      optionMap[key] = adapter.getOptions().get(key);
    });

    return optionMap;
  };

  const updateSelectedOption = (valueKeys: string[]) => {
    adapter.setSelectedOptions(getRawOptionFromValueKeys(valueKeys));
  };

  const getFallBackOption = (value: SelectOptionValue): SelectOptionData => {
    const fallback = adapter.getFallbackOption();
    if (typeof fallback === 'function') return fallback(value);

    return {
      [adapter.getFieldNames().value]: value,
      [adapter.getFieldNames().label]: String(
        isObject(value) ? value[adapter.getValueKey()] : value,
      ),
    };
  };

  const shouldAppendExtraValue = (
    keyArray: string[],
    optionKey: string,
    optionValue: SelectOptionValue,
  ) => {
    if (keyArray.includes(optionKey) || optionValue === '') {
      return false;
    }

    const optionInfo = adapter.getOptions().get(optionKey);
    return !optionInfo || optionInfo.origin === 'extraOptions';
  };

  const appendExtraValue = (
    valueArray: OptionValueWithKey[],
    keyArray: string[],
    option: OptionValueWithKey,
  ) => {
    valueArray.push(option);
    keyArray.push(option.key);
  };

  const getExtraValueData = (): OptionValueWithKey[] => {
    const valueArray: OptionValueWithKey[] = [];
    const keyArray: string[] = [];

    if (adapter.getAllowCreate() || adapter.getFallbackOption()) {
      for (const item of adapter.getValueObjects()) {
        if (shouldAppendExtraValue(keyArray, item.key, item.value)) {
          appendExtraValue(valueArray, keyArray, item);
        }
      }
    }

    if (adapter.getAllowCreate() && adapter.getInputValue()) {
      const createdOption = {
        value: adapter.getInputValue(),
        key: getKeyFromValue(adapter.getInputValue()),
      };

      if (shouldAppendExtraValue(keyArray, createdOption.key, createdOption.value)) {
        appendExtraValue(valueArray, keyArray, createdOption);
      }
    }

    return valueArray;
  };

  const getValueFromValueKeys = (valueKeys: string[]): SelectModelValue => {
    if (!adapter.getMultiple()) {
      return (
        adapter.getOptions().get(valueKeys[0])?.value ??
        (hasEmptyStringKey(adapter.getOptions()) ? undefined : '')
      );
    }

    return valueKeys.map((key) => adapter.getOptions().get(key)?.value ?? '');
  };

  const updateValue = (valueKeys: string[]) => {
    const nextValue = getValueFromValueKeys(valueKeys);
    adapter.setValue(nextValue);
    adapter.events.updateValue(nextValue);
    adapter.events.change(nextValue);
    adapter.onFormChange();
    updateSelectedOption(valueKeys);
  };

  const updateInputValue = (inputValue: string) => {
    adapter.setInputValue(inputValue);
    adapter.events.updateInput(inputValue);
    adapter.events.inputChange(inputValue);
  };

  const handleMultipleSelect = (key: string, ev: E) => {
    if (!adapter.getValueKeys().includes(key)) {
      if (adapter.getEnabledKeys().includes(key)) {
        if (adapter.getLimit() > 0 && adapter.getValueKeys().length >= adapter.getLimit()) {
          const info = adapter.getOptions().get(key);
          adapter.events.exceedLimit(info?.value, ev);
        } else {
          updateValue(adapter.getValueKeys().concat(key));
        }
      }
    } else {
      updateValue(adapter.getValueKeys().filter((valueKeyItem) => valueKeyItem !== key));
    }

    if (!adapter.getRetainInput()) {
      updateInputValue('');
    }
  };

  const handleSingleSelect = (key: string) => {
    if (key !== adapter.getValueKeys()[0]) {
      updateValue([key]);
    }

    if (adapter.getRetainInput()) {
      const optionInfo = adapter.getOptions().get(key);
      if (optionInfo) {
        updateInputValue(optionInfo.label);
      }
    }

    adapter.setPopupVisible(false);
  };

  const handleSelect = (key: string, ev: E) => {
    if (adapter.getReadonly()) return;
    if (adapter.getMultiple()) {
      handleMultipleSelect(key, ev);
      return;
    }

    handleSingleSelect(key);
  };

  const handleInputValueChange = (inputValue: string) => {
    if (inputValue === adapter.getInputValue()) {
      return;
    }

    if (!adapter.getPopupVisible()) {
      adapter.setPopupVisible(true);
    }

    updateInputValue(inputValue);

    if (adapter.getAllowSearch()) {
      adapter.search(inputValue);
    }
  };

  const handleRemove = (key: string) => {
    if (adapter.getReadonly()) return;
    const optionInfo = adapter.getOptions().get(key);
    updateValue(adapter.getValueKeys().filter((currentKey) => currentKey !== key));
    adapter.events.remove(optionInfo?.value);
  };

  const handleClear = (event: E) => {
    if (adapter.getReadonly()) return;
    const newKeys = adapter.getValueKeys().filter((key) => adapter.getOptions().get(key)?.disabled);
    updateValue(newKeys);
    updateInputValue('');
    adapter.events.clear(event);
  };

  function getExtraOptions(values: OptionValueWithKey[]): SelectOptionData[] {
    return values.map((item) => {
      let optionInfo = getFallBackOption(item.value);
      const extraOptionRawInfo = adapter.getSelectedOptions()[item.key];

      if (!isUndefined(extraOptionRawInfo) && !isEmptyObject(extraOptionRawInfo)) {
        optionInfo = { ...optionInfo, ...(extraOptionRawInfo as Record<string, unknown>) };
      }

      return optionInfo;
    });
  }

  function popupChanged(visible: boolean) {
    if (!visible && !adapter.getRetainInput() && adapter.getInputValue()) updateInputValue('');
  }
  return {
    getExtraValueData,
    getExtraOptions,
    popupChanged,
    handleSelect,
    handleInputValueChange,
    handleRemove,
    handleClear,
  };
}
