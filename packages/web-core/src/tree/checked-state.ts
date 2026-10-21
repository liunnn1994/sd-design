import type { CheckNode, TreeNodeKey } from './types.js';

import { getCheckedStateByInitKeys } from './check.js';

export interface CheckedState {
  readonly defaultCheckedKeys: TreeNodeKey[] | undefined;
  readonly checkedKeys: TreeNodeKey[] | undefined;
  readonly halfCheckedKeys: TreeNodeKey[] | undefined;
  readonly key2TreeNode: Map<TreeNodeKey, CheckNode>;
  readonly checkStrictly: boolean;
  readonly onlyCheckLeaf: boolean;
  isInitialized: boolean;
  localCheckedKeys: TreeNodeKey[];
  localIndeterminateKeys: TreeNodeKey[];
  computedCheckedKeys: TreeNodeKey[] | undefined;
  computedIndeterminateKeys: TreeNodeKey[] | undefined;
}
export function createCheckedStateFoundation(state: CheckedState) {
  const getStateByKeys = (keys: TreeNodeKey[]) => {
    return getCheckedStateByInitKeys({
      initCheckedKeys: keys,
      key2TreeNode: state.key2TreeNode,
      checkStrictly: state.checkStrictly,
      onlyCheckLeaf: state.onlyCheckLeaf,
    });
  };
  const init = (keys: TreeNodeKey[]) => {
    const initState = getStateByKeys(keys);
    [state.localCheckedKeys, state.localIndeterminateKeys] = initState;
  };
  const initialize = () => init(state.checkedKeys || state.defaultCheckedKeys || []);
  const sync = () => {
    if (state.checkedKeys) {
      [state.computedCheckedKeys, state.computedIndeterminateKeys] = getStateByKeys(
        state.checkedKeys,
      );
    } else if (state.isInitialized) {
      state.computedCheckedKeys = undefined;
      state.computedIndeterminateKeys = undefined;
      state.localCheckedKeys = [];
      state.localIndeterminateKeys = [];
    }
    if (!state.isInitialized) {
      state.isInitialized = true;
    }
  };
  const getCheckedKeys = () => state.computedCheckedKeys || state.localCheckedKeys;
  const getIndeterminateKeys = () => {
    if (state.checkStrictly && state.halfCheckedKeys) {
      return state.halfCheckedKeys;
    }
    return state.computedIndeterminateKeys || state.localIndeterminateKeys;
  };
  function setCheckedState(
    newCheckedKeys: TreeNodeKey[],
    newIndeterminateKeys: TreeNodeKey[],
    reinitialize = false,
  ) {
    if (reinitialize) {
      init(newCheckedKeys);
    } else {
      state.localCheckedKeys = newCheckedKeys;
      state.localIndeterminateKeys = newIndeterminateKeys;
    }
    return [state.localCheckedKeys, state.localIndeterminateKeys];
  }
  return { initialize, sync, getCheckedKeys, getIndeterminateKeys, setCheckedState };
}
