import { Slot, VNode } from 'vue';

import { VirtualListProps } from '../_components/virtual-list/interface';
import { Size } from '../_utils/constant';

export type TreeNodeKey = number | string;
export type TreeEllipsis = boolean | 'performant-ellipsis';
export type TreeNodeDomEventName =
  | 'click'
  | 'dblclick'
  | 'contextmenu'
  | 'mouseover'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseout'
  | 'mousedown'
  | 'mouseup'
  | 'pointerdown'
  | 'pointermove'
  | 'pointerup'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointerover'
  | 'pointerout'
  | 'pointercancel'
  | 'touchstart'
  | 'touchmove'
  | 'touchend'
  | 'touchcancel'
  | 'keydown'
  | 'keyup'
  | 'keypress';
export type TreeNodeSwipeEventName = 'swipeStart' | 'swipe' | 'swipeEnd';
export type TreeNodeSwipeDirection = 'up' | 'down' | 'left' | 'right' | 'none';

export interface TreeNodeSwipeEventData {
  direction: TreeNodeSwipeDirection;
}

export type TreeNodeEventHandler<T extends Event = Event> = (node: TreeNodeData, event: T) => void;
export type TreeNodeSwipeEventHandler = (
  node: TreeNodeData,
  event: TouchEvent,
  data: TreeNodeSwipeEventData,
) => void;

export interface TreeNodeData {
  /**
   * @zh 唯一标示
   * @en Unique key
   * */
  key?: string | number;
  /**
   * @zh 该节点显示的标题
   * @en The title of the node
   * */
  title?: string;
  /**
   * @zh 是否允许选中
   * @en Whether to allow selection
   * */
  selectable?: boolean;
  /**
   * @zh 是否禁用节点
   * @en Whether to disable the node
   * */
  disabled?: boolean;
  /**
   * @zh 是否禁用复选框
   * @en Whether to disable the checkbox
   * */
  disableCheckbox?: boolean;
  /**
   * @zh 是否显示多选框
   * @en Whether to show checkbox
   * */
  checkable?: boolean;
  /**
   * @zh 是否可以拖拽
   * @en Whether it can be dragged
   * */
  draggable?: boolean;
  /**
   * @zh 是否是叶子节点。动态加载时有效
   * @en Whether it is a leaf node. Effective when loading dynamically
   * */
  isLeaf?: boolean;
  /**
   * @zh 节点的图标
   * @en Node icon
   * */
  icon?: () => VNode;
  /**
   * @zh 定制 switcher 图标，优先级大于 tree
   * @en Custom switcher icon, priority is greater than tree
   * */
  switcherIcon?: () => VNode;
  /**
   * @zh 定制 loading 图标，优先级大于 tree
   * @en Customize loading icon, priority is greater than tree
   * */
  loadingIcon?: () => VNode;
  /**
   * @zh 定制 drag 图标，优先级大于 tree
   * @en Custom drag icon, priority is greater than tree
   * */
  dragIcon?: () => VNode;
  /**
   * @zh 子节点
   * @en Child node
   * */
  children?: TreeNodeData[];

  [other: string]: unknown;
}

export interface TreeNodeProps extends Omit<TreeNodeData, 'children'> {
  selectable: boolean;
  disabled: boolean;
  disableCheckbox: boolean;
  checkable: boolean;
  draggable: boolean;
  isLeaf: boolean;
  isTail: boolean;
  blockNode: boolean;
  showLine: boolean;
  level: number;
  lineless: boolean[];
}

export interface Node extends TreeNodeProps {
  key: TreeNodeKey;
  treeNodeProps: TreeNodeProps;
  treeNodeData: TreeNodeData;
  parent?: Node;
  parentKey?: TreeNodeKey;
  pathParentKeys: TreeNodeKey[];
  children?: Node[];
}

export type FilterTreeNode = (node: TreeNodeData) => boolean;

export interface TreeFieldNames {
  /**
   * @zh 指定 key 在 TreeNodeData 中的字段名
   * @en Specify the field name of key in TreeNodeData
   * @defaultValue key
   */
  key?: string;
  /**
   * @zh 指定 title 在 TreeNodeData 中的字段名
   * @en Specify the field name of title in TreeNodeData
   * @defaultValue title
   */
  title?: string;
  /**
   * @zh 指定 disabled 在 TreeNodeData 中的字段名
   * @en Specify the field name of disabled in TreeNodeData
   * @defaultValue disabled
   */
  disabled?: string;
  /**
   * @zh 指定 children 在 TreeNodeData 中的字段名
   * @en Specify the field name of children in TreeNodeData
   * @defaultValue children
   */
  children?: string;
  /**
   * @zh 指定 isLeaf 在 TreeNodeData 中的字段名
   * @en Specify the field name of isLeaf in TreeNodeData
   * @defaultValue isLeaf
   */
  isLeaf?: string;
  /**
   * @zh 指定 disableCheckbox 在 TreeNodeData 中的字段名
   * @en Specify the field name of disableCheckbox in TreeNodeData
   * @defaultValue disableCheckbox
   */
  disableCheckbox?: string;
  /**
   * @zh 指定 checkable 在 TreeNodeData 中的字段名
   * @en Specify the field name of checkable in TreeNodeData
   * @defaultValue checkable
   */
  checkable?: string;
  /**
   * @zh 指定 icon 在 TreeNodeData 中的字段名
   * @en Specify the field name of icon in TreeNodeData
   * @defaultValue checkable
   */
  icon?: string;

  [field: string]: string | undefined;
}

export type LoadMore = (node: TreeNodeData) => Promise<void>;
export type DropPosition = -1 | 0 | 1;
export type CheckedStrategy = 'all' | 'parent' | 'child';
export type CheckableType =
  | boolean
  | ((
      node: TreeNodeData,
      info: {
        level: number;
        isLeaf: boolean;
      },
    ) => boolean);
export interface TreeProps {
  size: Size;
  blockNode: boolean;
  switcher: boolean;
  /**
   * @zh 是否默认展开所有节点
   * @en Whether every node is expanded by default
   */
  defaultExpandAll: boolean;
  multiple: boolean;
  checkable: CheckableType;
  draggable: boolean;
  /**
   * @zh 是否允许把节点拖放到目标位置，返回 false 拒绝
   * @en Whether a node may be dropped at the target; return false to reject
   */
  allowDrop?: (options: { dropNode: TreeNodeData; dropPosition: DropPosition }) => boolean;
  selectable: CheckableType;
  /**
   * @zh 是否父子不关联，勾选父节点不会自动勾选子节点
   * @en Whether parent and child are independent, so checking a parent does not check its children
   */
  checkStrictly: boolean;
  /**
   * @zh 勾选父子关联时的勾选策略
   * @en How checked keys are derived when parent and child are linked
   */
  checkedStrategy: CheckedStrategy;
  defaultSelectedKeys?: TreeNodeKey[];
  selectedKeys?: TreeNodeKey[];
  defaultCheckedKeys?: TreeNodeKey[];
  checkedKeys?: TreeNodeKey[];
  halfCheckedKeys: TreeNodeKey[] | undefined;
  defaultExpandedKeys?: TreeNodeKey[];
  expandedKeys?: TreeNodeKey[];
  data: TreeNodeData[];
  /**
   * @zh 数据结构字段映射
   * @en Field mapping of the node data source
   */
  fieldNames?: TreeFieldNames;
  /**
   * @zh 虚拟列表的属性，用于大数据量渲染
   * @en Props forwarded to the virtual list, used for large data sets
   */
  virtualListProps?: VirtualListProps;
  /**
   * @zh 是否显示节点之间的连线
   * @en Whether to show the line between nodes
   */
  showLine: boolean;
  /**
   * @zh 异步加载子节点数据的方法
   * @en Function that loads children asynchronously
   */
  loadMore?: LoadMore;
  /**
   * @zh 搜索关键字
   * @en Keyword used to search the tree
   */
  searchValue?: string;
  /**
   * @zh 是否默认展开选中节点的父级
   * @en Whether the parents of selected nodes are expanded by default
   */
  defaultExpandSelected?: boolean;
  /**
   * @zh 是否默认展开勾选节点的父级
   * @en Whether the parents of checked nodes are expanded by default
   */
  defaultExpandChecked?: boolean;
  /**
   * @zh 是否自动展开已展开节点的父节点
   * @en Whether to automatically expand the parent node of the expanded node
   */
  autoExpandParent?: boolean;
  /**
   * @zh 是否只能勾选叶子节点
   * @en Whether only leaf nodes can be checked
   */
  onlyCheckLeaf: boolean;
  /**
   * @zh 展开收起是否有动画
   * @en Whether expand/collapse is animated
   */
  animation: boolean;
  /**
   * @zh 标题超出宽度时的省略方式
   * @en How the title is ellipsized when it overflows
   */
  ellipsis: TreeEllipsis;
  /**
   * @zh 点击节点时执行的动作
   * @en Action performed when a node is clicked
   */
  actionOnNodeClick?: 'expand';
  /**
   * @zh 禁用选中动作，节点只能用于展开等其它操作
   * @en Disable the select action so nodes can only be used for expansion and similar actions
   */
  disableSelectActionOnly: boolean;
  /**
   * @zh 拖拽图标插槽
   * @en Slot for the drag icon
   */
  dragIcon?: Slot;
  /**
   * @zh 展开/收起图标插槽
   * @en Slot for the expand/collapse icon
   */
  switcherIcon?: Slot;
  /**
   * @zh 加载图标插槽
   * @en Slot for the loading icon
   */
  loadingIcon?: Slot;
  /**
   * @zh 节点右侧额外内容插槽
   * @en Slot for extra content on the right of a node
   */
  extra?: Slot;
  /**
   * @zh 节点标题插槽
   * @en Slot for the node title
   */
  title?: Slot;
  /**
   * @zh 选中节点时触发
   * @en Triggered when the selection changes
   */
  onSelect?: (
    selectedKeys: TreeNodeKey[],
    event: {
      selected?: boolean;
      selectedNodes: TreeNodeData[];
      node?: TreeNodeData;
      e?: Event;
    },
  ) => void;
  /**
   * @zh 勾选状态变化时触发
   * @en Triggered when the checked keys change
   */
  onCheck?: (
    checkedKeys: TreeNodeKey[],
    event: {
      checked?: boolean;
      checkedNodes: TreeNodeData[];
      node?: TreeNodeData;
      halfCheckedKeys: TreeNodeKey[];
      halfCheckedNodes: TreeNodeData[];
      e?: Event;
    },
  ) => void;
  /**
   * @zh 展开或收起节点时触发
   * @en Triggered when a node is expanded or collapsed
   */
  onExpand?: (
    expandedKeys: TreeNodeKey[],
    event: {
      expanded: boolean;
      expandedNodes: TreeNodeData[];
      node: TreeNodeData;
      e?: Event;
    },
  ) => void;
  /**
   * @zh 开始拖拽节点时触发
   * @en Triggered when dragging a node starts
   */
  onDragStart?: (e: DragEvent, node: TreeNodeData) => void;
  /**
   * @zh 结束拖拽节点时触发
   * @en Triggered when dragging a node ends
   */
  onDragEnd?: (e: DragEvent, node: TreeNodeData) => void;
  /**
   * @zh 拖拽经过节点时触发
   * @en Triggered when a dragged node moves over a node
   */
  onDragOver?: (e: DragEvent, node: TreeNodeData) => void;
  /**
   * @zh 拖拽离开节点时触发
   * @en Triggered when a dragged node leaves a node
   */
  onDragLeave?: (e: DragEvent, node: TreeNodeData) => void;
  /**
   * @zh 把节点拖放到目标位置时触发
   * @en Triggered when a node is dropped onto a target
   */
  onDrop?: (event: {
    e: DragEvent;
    dragNode: TreeNodeData;
    dropNode: TreeNodeData;
    dropPosition: number;
  }) => void;
  /**
   * @zh 点击节点时触发
   * @en Triggered when a node is clicked
   */
  onNodeClick?: TreeNodeEventHandler;
  /**
   * @zh 双击节点时触发
   * @en Triggered when a node is double-clicked
   */
  onNodeDblclick?: TreeNodeEventHandler;
  /**
   * @zh 右键点击节点时触发
   * @en Triggered when a node is right-clicked
   */
  onNodeContextmenu?: TreeNodeEventHandler;
  /**
   * @zh 鼠标移入节点时触发
   * @en Triggered when a node receives a mouseover event
   */
  onNodeMouseover?: TreeNodeEventHandler;
  /**
   * @zh 鼠标进入节点时触发
   * @en Triggered when a node receives a mouseenter event
   */
  onNodeMouseenter?: TreeNodeEventHandler;
  /**
   * @zh 鼠标离开节点时触发
   * @en Triggered when a node receives a mouseleave event
   */
  onNodeMouseleave?: TreeNodeEventHandler;
  /**
   * @zh 鼠标移动节点时触发
   * @en Triggered when a node receives a mousemove event
   */
  onNodeMousemove?: TreeNodeEventHandler;
  /**
   * @zh 鼠标移出节点时触发
   * @en Triggered when a node receives a mouseout event
   */
  onNodeMouseout?: TreeNodeEventHandler;
  /**
   * @zh 鼠标按下节点时触发
   * @en Triggered when a node receives a mousedown event
   */
  onNodeMousedown?: TreeNodeEventHandler;
  /**
   * @zh 鼠标抬起节点时触发
   * @en Triggered when a node receives a mouseup event
   */
  onNodeMouseup?: TreeNodeEventHandler;
  /**
   * @zh 指针按下时触发
   * @en Triggered when a node receives a pointerdown event
   */
  onNodePointerdown?: TreeNodeEventHandler;
  /**
   * @zh 指针移动时触发
   * @en Triggered when a node receives a pointermove event
   */
  onNodePointermove?: TreeNodeEventHandler;
  /**
   * @zh 指针抬起时触发
   * @en Triggered when a node receives a pointerup event
   */
  onNodePointerup?: TreeNodeEventHandler;
  /**
   * @zh 指针进入时触发
   * @en Triggered when a node receives a pointerenter event
   */
  onNodePointerenter?: TreeNodeEventHandler;
  /**
   * @zh 指针离开时触发
   * @en Triggered when a node receives a pointerleave event
   */
  onNodePointerleave?: TreeNodeEventHandler;
  /**
   * @zh 指针悬停时触发
   * @en Triggered when a node receives a pointerover event
   */
  onNodePointerover?: TreeNodeEventHandler;
  /**
   * @zh 指针移出时触发
   * @en Triggered when a node receives a pointerout event
   */
  onNodePointerout?: TreeNodeEventHandler;
  /**
   * @zh 指针交互被取消时触发
   * @en Triggered when a node receives a pointercancel event
   */
  onNodePointercancel?: TreeNodeEventHandler;
  /**
   * @zh 触摸开始节点时触发
   * @en Triggered when a node receives a touchstart event
   */
  onNodeTouchstart?: TreeNodeEventHandler;
  /**
   * @zh 触摸移动节点时触发
   * @en Triggered when a node receives a touchmove event
   */
  onNodeTouchmove?: TreeNodeEventHandler;
  /**
   * @zh 触摸结束节点时触发
   * @en Triggered when a node receives a touchend event
   */
  onNodeTouchend?: TreeNodeEventHandler;
  /**
   * @zh 触摸被取消节点时触发
   * @en Triggered when a node receives a touchcancel event
   */
  onNodeTouchcancel?: TreeNodeEventHandler;
  /**
   * @zh 按下按键节点时触发
   * @en Triggered when a node receives a keydown event
   */
  onNodeKeydown?: TreeNodeEventHandler;
  /**
   * @zh 松开按键节点时触发
   * @en Triggered when a node receives a keyup event
   */
  onNodeKeyup?: TreeNodeEventHandler;
  /**
   * @zh 按下并触发按键节点时触发
   * @en Triggered when a node receives a keypress event
   */
  onNodeKeypress?: TreeNodeEventHandler;
  /**
   * @zh 长按节点时触发
   * @en Triggered when a node is long-pressed
   */
  onNodeLongPress?: TreeNodeEventHandler<PointerEvent>;
  /**
   * @zh 开始滑动节点时触发
   * @en Triggered when a swipe on a node starts
   */
  onNodeSwipeStart?: TreeNodeSwipeEventHandler;
  /**
   * @zh 滑动中节点时触发
   * @en Triggered when a swipe on a node continues
   */
  onNodeSwipe?: TreeNodeSwipeEventHandler;
  /**
   * @zh 滑动结束节点时触发
   * @en Triggered when a swipe on a node ends
   */
  onNodeSwipeEnd?: TreeNodeSwipeEventHandler;
  /**
   * @zh 搜索时用于过滤节点的函数
   * @en Function used to filter nodes while searching
   */
  filterTreeNode?: (node: TreeNodeData) => boolean;
}

export type Key2TreeNode = Map<TreeNodeKey, Node>;
