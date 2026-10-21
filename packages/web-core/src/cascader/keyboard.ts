import type { CascaderOptionInfo, CascaderSingleValue } from './types.js';

import { getCheckedStatus } from './data.js';

export interface CascaderKeyboardAdapter<P> {
  getPopupVisible: () => boolean;
  getActiveOption: () => CascaderOptionInfo<P> | undefined;
  getCheckStrictly: () => boolean;
  getValues: () => Map<string, CascaderSingleValue>;
  getSearchPanel: () => boolean;
  next: (direction: 'next' | 'preview') => CascaderOptionInfo<P> | undefined;
  load: (option: CascaderOptionInfo<P>) => void;
  select: (option: CascaderOptionInfo<P>, checked: boolean) => void;
  setSelectedPath: (key?: string) => void;
  setActiveKey: (key?: string) => void;
  setPopupVisible?: (visible: boolean) => void;
}
export function createCascaderKeyboard<P>(adapter: CascaderKeyboardAdapter<P>) {
  return (key: string, event: { preventDefault: () => void }) => {
    if (key === 'Enter') {
      if (!adapter.getPopupVisible()) {
        adapter.setPopupVisible?.(true);
        return;
      }
      const active = adapter.getActiveOption();
      if (active && !active.disabled) {
        const checked =
          adapter.getCheckStrictly() || active.isLeaf
            ? !adapter.getValues().has(active.key)
            : !getCheckedStatus(active, adapter.getValues()).checked;
        adapter.load(active);
        adapter.setSelectedPath(active.key);
        adapter.select(active, checked);
      }
    } else if (key === 'Escape') adapter.setPopupVisible?.(false);
    else if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      adapter.setActiveKey(adapter.next(key === 'ArrowDown' ? 'next' : 'preview')?.key);
    } else if (key === 'ArrowRight' && !adapter.getSearchPanel()) {
      event.preventDefault();
      const active = adapter.getActiveOption();
      if (active && !active.disabled) {
        adapter.load(active);
        adapter.setSelectedPath(active.key);
        if (active.children)
          adapter.setActiveKey(active.children.find((option) => !option.disabled)?.key);
      }
    } else if (key === 'ArrowLeft' && !adapter.getSearchPanel()) {
      event.preventDefault();
      const parent = adapter.getActiveOption()?.parent;
      if (parent) {
        adapter.setSelectedPath(parent.key);
        adapter.setActiveKey(parent.key);
      }
    }
  };
}
