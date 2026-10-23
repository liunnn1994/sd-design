import type { TreeStateNode } from '../tree/foundation.js';
import type { TreeNodeKey } from '../tree/types.js';
import type { LabelValue, TreeSelectValue } from './types.js';

import { getCheckedStateByCheck, isNodeCheckable } from '../tree/check.js';
import { isNodeSelectable } from '../tree/query.js';

export interface TreeSelectAdapter<T, N extends TreeStateNode<T>> {
  getNodes: () => ReadonlyMap<TreeNodeKey, N>;
  getDisabled: () => boolean;
  getReadonly: () => boolean;
  getMultiple: () => boolean;
  getCheckable: () => boolean;
  getCheckStrictly: () => boolean;
  getLabelInValue: () => boolean;
  getSelectedKeys: () => TreeNodeKey[];
  getLocalKeys: () => TreeNodeKey[];
  getLocalValues: () => LabelValue[];
  getInputValue: () => string;
  getRetainInput: () => boolean;
  setLocalKeys: (keys: TreeNodeKey[]) => void;
  setPanelVisible: (visible: boolean) => void;
  updateInputValue: (value: string) => void;
  afterRender: (task: () => void) => void;
  onFormChange: () => void;
  events: {
    updateValue: (value: TreeSelectValue | undefined) => void;
    change: (value: TreeSelectValue | undefined) => void;
    clear: () => void;
  };
}

export function createTreeSelectFoundation<T, N extends TreeStateNode<T>>(
  adapter: TreeSelectAdapter<T, N>,
) {
  function isNodeClosable(node: N) {
    return adapter.getCheckable() ? isNodeCheckable(node) : isNodeSelectable(node);
  }
  function setSelectedKeys(keys: TreeNodeKey[]) {
    adapter.setLocalKeys(keys);
    adapter.afterRender(() => {
      const values =
        (adapter.getLabelInValue() ? adapter.getLocalValues() : adapter.getLocalKeys()) || [];
      const value = adapter.getMultiple() ? values : values[0];
      adapter.events.updateValue(value);
      adapter.events.change(value);
      adapter.onFormChange();
    });
  }
  function blur() {
    if (!adapter.getRetainInput() && adapter.getInputValue()) adapter.updateInputValue('');
  }
  function select(keys: TreeNodeKey[]) {
    if (adapter.getDisabled() || adapter.getReadonly()) return;
    setSelectedKeys(keys);
    blur();
    if (!adapter.getMultiple()) adapter.setPanelVisible(false);
  }
  function clear() {
    if (adapter.getDisabled() || adapter.getReadonly()) return;
    setSelectedKeys([]);
    adapter.events.clear();
  }
  function remove(id: TreeNodeKey) {
    if (adapter.getDisabled() || adapter.getReadonly()) return;
    const node = adapter.getNodes().get(id);
    if (adapter.getCheckable() && node) {
      if (isNodeClosable(node)) {
        const [keys] = getCheckedStateByCheck({
          node,
          checked: false,
          checkedKeys: adapter.getSelectedKeys(),
          indeterminateKeys: [],
          checkStrictly: adapter.getCheckStrictly(),
        });
        setSelectedKeys(keys);
      }
    } else setSelectedKeys(adapter.getSelectedKeys().filter((key) => key !== id));
  }
  return { isNodeClosable, setSelectedKeys, blur, select, clear, remove };
}
