import { generateTreeData as generateSharedTreeData } from '@sdata/web-core/tree/data';

import type { CheckableType, Node, TreeFieldNames, TreeNodeData, TreeNodeKey } from '../interface';
export { generateKey } from '@sdata/web-core/tree/data';

interface TreeProps {
  fieldNames?: TreeFieldNames;
  selectable: CheckableType;
  checkable: CheckableType;
  blockNode: boolean;
  showLine: boolean;
  loadMore: boolean;
  draggable: boolean;
}

// Preserve the concrete signatures of the existing Vue deep import.
export const generateTreeData: (
  treeData: TreeNodeData[],
  treeProps: TreeProps,
  keyCache?: WeakMap<TreeNodeData, TreeNodeKey[]>,
) => Node[] = generateSharedTreeData;
