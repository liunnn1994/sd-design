import type { CascaderOptionInfo, CascaderSingleValue } from './types.js';

export interface CascaderInteractionAdapter<P> {
  getInputValue: () => string;
  getPopupVisible: () => boolean;
  getAllowSearch: () => boolean;
  getValues: () => Map<string, CascaderSingleValue>;
  getLeafOptions: () => Map<string, CascaderOptionInfo<P>>;
  getActiveKey: () => string | undefined;
  setInputValue: (value: string) => void;
  setPopupVisible: (visible: boolean) => void;
  setSelectedPath: (key?: string) => void;
  setActiveKey: (key?: string) => void;
  clearSelection: () => boolean;
  inputChange: (value: string) => void;
  search: (value: string) => void;
  clear: () => void;
}
export function createCascaderInteraction<P>(adapter: CascaderInteractionAdapter<P>) {
  function inputChange(value: string, reason: string) {
    if (value !== adapter.getInputValue()) {
      if (reason === 'manual' && !adapter.getPopupVisible()) adapter.setPopupVisible(true);
      adapter.setInputValue(value);
      adapter.inputChange(value);
      if (adapter.getAllowSearch()) adapter.search(value);
    }
  }
  function popupChanged(visible: boolean) {
    if (visible) {
      if (adapter.getValues().size > 0) {
        const keys = Array.from(adapter.getValues().keys());
        const option = adapter.getLeafOptions().get(keys[keys.length - 1]);
        if (option && option.key !== adapter.getActiveKey()) {
          adapter.setSelectedPath(option.key);
          adapter.setActiveKey(option.key);
        }
      }
    } else {
      if (adapter.getValues().size === 0) {
        adapter.setSelectedPath();
        adapter.setActiveKey();
      }
      inputChange('', 'optionListHide');
    }
  }
  function clear() {
    if (adapter.clearSelection()) {
      inputChange('', 'manual');
      adapter.clear();
    }
  }
  return { inputChange, popupChanged, clear };
}
