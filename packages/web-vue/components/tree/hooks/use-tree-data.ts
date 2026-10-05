import { computed, ref, toRefs, watchEffect } from 'vue';

import {
  TreeFieldNames,
  TreeNodeData,
  TreeNodeKey,
  Node,
  LoadMore,
  CheckableType,
} from '../interface';
import { getFlattenTreeData, getKey2TreeNode } from '../utils';
import { generateTreeData } from '../utils/tree-data';

export default function useTreeData(props: {
  treeData: TreeNodeData[];
  fieldNames?: TreeFieldNames;
  selectable?: CheckableType;
  showLine?: boolean;
  blockNode?: boolean;
  checkable?: CheckableType;
  loadMore?: LoadMore;
  draggable?: boolean;
}) {
  const {
    treeData: propTreeData,
    fieldNames,
    selectable,
    showLine,
    blockNode,
    checkable,
    loadMore,
    draggable,
  } = toRefs(props);

  const treeData = ref<Node[]>([]);
  const keyCache = new WeakMap<TreeNodeData, TreeNodeKey[]>();

  watchEffect(() => {
    treeData.value = generateTreeData(
      propTreeData.value || [],
      {
        selectable: selectable?.value ?? false,
        showLine: !!showLine?.value,
        blockNode: !!blockNode?.value,
        checkable: checkable?.value ?? false,
        fieldNames: fieldNames?.value,
        loadMore: !!loadMore?.value,
        draggable: !!draggable?.value,
      },
      keyCache,
    );
  });

  const flattenTreeData = computed(() => getFlattenTreeData(treeData.value));
  const key2TreeNode = computed(() => getKey2TreeNode(flattenTreeData.value));

  return { treeData, flattenTreeData, key2TreeNode };
}
