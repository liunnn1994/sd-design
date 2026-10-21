import type { VNode } from 'vue';

import type { Node, TreeNodeData } from '../interface';

import { getFlattenTreeData, getKey2TreeNode } from '../utils';
import { generateTreeData } from '../utils/tree-data';

// Deep-import consumers retain Vue payloads when they derive types from helpers.
export function treeUtilityTypeContract(data: Parameters<typeof generateTreeData>[0]) {
  const icon: (() => VNode) | undefined = data[0]?.icon;
  const nodes: Node[] = getFlattenTreeData(
    generateTreeData(data, {
      selectable: true,
      checkable: true,
      draggable: false,
      loadMore: false,
      showLine: false,
      blockNode: false,
    }),
  );
  const raw: TreeNodeData | undefined = getKey2TreeNode(nodes).values().next().value?.treeNodeData;
  const rawIcon: VNode | undefined = raw?.icon?.();
  return { icon, rawIcon };
}
