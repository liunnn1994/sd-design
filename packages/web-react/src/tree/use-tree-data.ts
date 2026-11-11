import type { TreeData, TreeModelOptions, TreeNodeKey } from '@sdata/web-core/tree/types';

import { generateTreeData } from '@sdata/web-core/tree/data';
import { getFlattenTreeData, getKey2TreeNode } from '@sdata/web-core/tree/query';
import { useRef } from 'react';

export function useTreeData<T extends TreeData>(
  props: Partial<TreeModelOptions<T>> & { treeData?: T[] },
) {
  const keys = useRef(new WeakMap<T, TreeNodeKey[]>());
  const treeData = generateTreeData(
    props.treeData ?? [],
    {
      fieldNames: props.fieldNames,
      selectable: props.selectable ?? false,
      checkable: props.checkable ?? false,
      blockNode: !!props.blockNode,
      showLine: !!props.showLine,
      loadMore: !!props.loadMore,
      draggable: !!props.draggable,
    },
    keys.current,
  );
  const flattenTreeData = getFlattenTreeData(treeData);
  return { treeData, flattenTreeData, key2TreeNode: getKey2TreeNode(flattenTreeData) };
}
