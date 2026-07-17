import { InjectionKey, Slot } from 'vue';

import type {
  Node,
  DropPosition,
  TreeNodeKey,
  TreeProps,
  Key2TreeNode,
  FilterTreeNode,
  TreeNodeDomEventName,
  TreeNodeSwipeEventData,
  TreeNodeSwipeEventName,
} from './interface';

export const TreeInjectionKey: InjectionKey<TreeContext> = Symbol('TreeInjectionKey');

export type TreeContext = Readonly<{
  treeProps: TreeProps;
  switcherIcon?: Slot;
  loadingIcon?: Slot;
  nodeIcon?: Slot;
  dragIcon?: Slot;
  nodeTitle?: Slot;
  nodeExtra?: Slot;
  treeData: Node[];
  flattenTreeData: Node[];
  key2TreeNode: Key2TreeNode;
  checkedKeys: TreeNodeKey[];
  filterTreeNode?: FilterTreeNode;
  indeterminateKeys: TreeNodeKey[];
  selectedKeys: TreeNodeKey[];
  expandedKeys: TreeNodeKey[];
  loadingKeys: TreeNodeKey[];
  currentExpandKeys: TreeNodeKey[];
  /**
   * roving tabindex 的活动节点 key（WAI-ARIA tree 键盘导航）：该节点 tabindex=0，其余 -1。
   */
  activeKey?: TreeNodeKey;
  onLoadMore?: (key: TreeNodeKey) => void;
  onCheck: (checked: boolean, key: TreeNodeKey, e?: Event) => void;
  onSelect: (key: TreeNodeKey, e: Event) => void;
  onExpand: (expanded: boolean, key: TreeNodeKey, e?: Event) => void;
  onExpandEnd: (key: TreeNodeKey) => void;
  onDragStart?: (key: TreeNodeKey, e: DragEvent) => void;
  onDragEnd?: (key: TreeNodeKey, e: DragEvent) => void;
  onDragOver?: (key: TreeNodeKey, e: DragEvent) => void;
  onDragLeave?: (key: TreeNodeKey, e: DragEvent) => void;
  onDrop?: (key: TreeNodeKey, dropPosition: DropPosition, e: DragEvent) => void;
  allowDrop?: (key: TreeNodeKey, dropPosition: DropPosition) => boolean;
  onNodeEvent?: (eventName: TreeNodeDomEventName, key: TreeNodeKey, e: Event) => void;
  onNodeKeydown?: (key: TreeNodeKey, e: KeyboardEvent) => void;
  onNodeLongPress?: (key: TreeNodeKey, e: PointerEvent) => void;
  onNodeSwipe?: (
    eventName: TreeNodeSwipeEventName,
    key: TreeNodeKey,
    e: TouchEvent,
    data: TreeNodeSwipeEventData,
  ) => void;
}>;
