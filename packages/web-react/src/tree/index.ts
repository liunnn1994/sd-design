export { Tree, Tree as default } from './tree.js';
export type { TreeProps, TreeInstance } from './tree.js';
export type { TreeNodeData, TreeNodeStatus } from './node.js';
export type { TreeNodeKey, TreeFieldNames, TreeCheckable } from '@sdata/web-core/tree/types';
export type { TreeDropPosition } from '@sdata/web-core/tree/drag';
export type { TreeSwipeDirection } from '@sdata/web-core/tree/gestures';
import type { TreeModelNode, TreeNodeKey } from '@sdata/web-core/tree/types';

import type { TreeNodeData } from './node.js';
import type { TreeProps } from './tree.js';

export type CheckedStrategy = NonNullable<TreeProps['checkedStrategy']>;
export type CheckableType = NonNullable<TreeProps['checkable']>;
export type { TreeDropPosition as DropPosition } from '@sdata/web-core/tree/drag';
export type FilterTreeNode<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeProps<T>['filterTreeNode']
>;
export type LoadMore<T extends TreeNodeData = TreeNodeData> = NonNullable<TreeProps<T>['loadMore']>;
export type Key2TreeNode<T extends TreeNodeData = TreeNodeData> = Map<
  TreeNodeKey,
  TreeModelNode<T>
>;
export type TreeCheckHandler<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeProps<T>['onCheck']
>;
export type TreeDropHandler<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeProps<T>['onDrop']
>;
export type TreeExpandHandler<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeProps<T>['onExpand']
>;
export type TreeSelectHandler<T extends TreeNodeData = TreeNodeData> = NonNullable<
  TreeProps<T>['onSelect']
>;
export type TreeNodeSwipeEventData = Parameters<NonNullable<TreeProps['onNodeSwipe']>>[2];
