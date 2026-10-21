import { toRefs, ref, watchEffect, computed } from 'vue';

import { createCheckedStateFoundation } from '@sdata/web-core/tree/checked-state';

import { TreeNodeKey, Key2TreeNode } from '../interface';

export default function useCheckedState(props: {
  defaultCheckedKeys: TreeNodeKey[] | undefined;
  checkedKeys: TreeNodeKey[] | undefined;
  halfCheckedKeys: TreeNodeKey[] | undefined;
  key2TreeNode: Key2TreeNode;
  checkStrictly: boolean;
  onlyCheckLeaf: boolean;
}) {
  const {
    defaultCheckedKeys,
    checkedKeys: propCheckedKeys,
    key2TreeNode,
    checkStrictly,
    halfCheckedKeys,
    onlyCheckLeaf,
  } = toRefs(props);

  const isInitialized = ref(false);
  const localCheckedKeys = ref<TreeNodeKey[]>([]);
  const localIndeterminateKeys = ref<TreeNodeKey[]>([]);
  const computedCheckedKeys = ref<TreeNodeKey[]>();
  const computedIndeterminateKeys = ref<TreeNodeKey[]>();

  const foundation = createCheckedStateFoundation({
    get defaultCheckedKeys() {
      return defaultCheckedKeys?.value;
    },
    get checkedKeys() {
      return propCheckedKeys.value;
    },
    get halfCheckedKeys() {
      return halfCheckedKeys.value;
    },
    get key2TreeNode() {
      return key2TreeNode.value;
    },
    get checkStrictly() {
      return checkStrictly.value;
    },
    get onlyCheckLeaf() {
      return onlyCheckLeaf.value;
    },
    get isInitialized() {
      return isInitialized.value;
    },
    set isInitialized(value) {
      isInitialized.value = value;
    },
    get localCheckedKeys() {
      return localCheckedKeys.value;
    },
    set localCheckedKeys(value) {
      localCheckedKeys.value = value;
    },
    get localIndeterminateKeys() {
      return localIndeterminateKeys.value;
    },
    set localIndeterminateKeys(value) {
      localIndeterminateKeys.value = value;
    },
    get computedCheckedKeys() {
      return computedCheckedKeys.value;
    },
    set computedCheckedKeys(value) {
      computedCheckedKeys.value = value;
    },
    get computedIndeterminateKeys() {
      return computedIndeterminateKeys.value;
    },
    set computedIndeterminateKeys(value) {
      computedIndeterminateKeys.value = value;
    },
  });
  foundation.initialize();
  watchEffect(foundation.sync);
  return {
    checkedKeys: computed(foundation.getCheckedKeys),
    indeterminateKeys: computed(foundation.getIndeterminateKeys),
    setCheckedState: foundation.setCheckedState,
  };
}
