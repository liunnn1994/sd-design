import { computed, onBeforeUnmount, toRefs, watchEffect, ref } from 'vue';

import { getFilteredTreeKeys, matchTreeNodeKey } from '@sdata/web-core/tree-select/filter';

import { debounce } from '../../_utils/debounce';
import { TreeFieldNames, Node, TreeNodeData, TreeNodeKey } from '../../tree/interface';
import { FilterTreeNode } from '../interface';

export default function useFilterTreeNode(props: {
  searchValue: string;
  flattenTreeData: Node[];
  filterMethod?: FilterTreeNode;
  disableFilter?: boolean;
  fieldNames: TreeFieldNames | undefined;
}) {
  const {
    searchValue,
    flattenTreeData,
    filterMethod: propFilterMethod,
    disableFilter,
    fieldNames,
  } = toRefs(props);

  const keyField = computed(() => (fieldNames.value?.key || 'key') as keyof TreeNodeData);

  const defaultFilterMethod = (keyword: string, node: TreeNodeData) => {
    return matchTreeNodeKey(node, keyword, keyField.value);
  };

  const filterMethod = computed(() => propFilterMethod?.value || defaultFilterMethod);

  const filteredKeysSet = ref<Set<TreeNodeKey>>();

  const isFiltering = computed(() => !!searchValue.value);

  const isEmptyFilterResult = computed(
    () =>
      !disableFilter?.value &&
      isFiltering.value &&
      filteredKeysSet.value &&
      filteredKeysSet.value.size === 0,
  );

  const filterTreeNode = computed(() =>
    disableFilter?.value
      ? undefined
      : (node: TreeNodeData) => {
          if (!isFiltering.value) return true;

          const key = node[keyField.value] as TreeNodeKey;
          return filteredKeysSet.value?.has(key) ?? false;
        },
  );

  const updateFilteredKeysSet = debounce(
    (treeData: Node[], keyword: string, method: FilterTreeNode) => {
      filteredKeysSet.value = getFilteredTreeKeys(treeData, keyword, method);
    },
    100,
  );
  onBeforeUnmount(updateFilteredKeysSet.cancel);

  watchEffect(() => {
    if (disableFilter?.value) {
      filteredKeysSet.value = undefined;
    } else {
      updateFilteredKeysSet(flattenTreeData.value, searchValue.value, filterMethod.value);
    }
  });

  return {
    isEmptyFilterResult,
    filterTreeNode,
  };
}
