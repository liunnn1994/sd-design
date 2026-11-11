import type { CheckedState } from '@sdata/web-core/tree/checked-state';
import type { TreeNodeKey } from '@sdata/web-core/tree/types';

import { createCheckedStateFoundation } from '@sdata/web-core/tree/checked-state';
import { useReducer, useRef, useState } from 'react';

export type TreeCheckedStateProps = Pick<
  CheckedState,
  | 'defaultCheckedKeys'
  | 'checkedKeys'
  | 'halfCheckedKeys'
  | 'key2TreeNode'
  | 'checkStrictly'
  | 'onlyCheckLeaf'
>;

export function useTreeCheckedState(props: TreeCheckedStateProps) {
  const current = useRef(props);
  current.current = props;
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [foundation] = useState(() => {
    const instance = createCheckedStateFoundation({
      get defaultCheckedKeys() {
        return current.current.defaultCheckedKeys;
      },
      get checkedKeys() {
        return current.current.checkedKeys;
      },
      get halfCheckedKeys() {
        return current.current.halfCheckedKeys;
      },
      get key2TreeNode() {
        return current.current.key2TreeNode;
      },
      get checkStrictly() {
        return current.current.checkStrictly;
      },
      get onlyCheckLeaf() {
        return current.current.onlyCheckLeaf;
      },
      isInitialized: false,
      localCheckedKeys: [],
      localIndeterminateKeys: [],
      computedCheckedKeys: undefined,
      computedIndeterminateKeys: undefined,
    });
    instance.initialize();
    instance.sync();
    return instance;
  });
  const previousControlled = useRef(props.checkedKeys !== undefined);
  // Core sync clears released controlled state; ordinary uncontrolled renders must retain it.
  if (props.checkedKeys !== undefined || previousControlled.current) foundation.sync();
  previousControlled.current = props.checkedKeys !== undefined;
  return {
    get checkedKeys() {
      return foundation.getCheckedKeys();
    },
    get indeterminateKeys() {
      return foundation.getIndeterminateKeys();
    },
    setCheckedState(checked: TreeNodeKey[], indeterminate: TreeNodeKey[], reinitialize = false) {
      const result = foundation.setCheckedState(checked, indeterminate, reinitialize);
      render();
      return result;
    },
  };
}
