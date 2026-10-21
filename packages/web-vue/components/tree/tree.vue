<template>
  <div ref="rootEl" :class="classNames" :style="treeStyle" role="tree">
    <VirtualList
      v-if="virtualListProps"
      :key="virtualListKey"
      ref="virtualListRef"
      v-bind="resolvedVirtualListProps"
      :items="visibleTreeNodeList"
      @scroll-end="focusPendingNode"
    >
      <template #item="{ item: node }">
        <TreeNode
          :key="`${searchValue}-${node.key}`"
          v-bind="node.treeNodeProps"
          @vue:mounted="focusPendingNode"
        />
      </template>
    </VirtualList>
    <template v-else>
      <TreeNode v-for="node in visibleTreeNodeList" :key="node.key" v-bind="node.treeNodeProps" />
    </template>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    nextTick,
    provide,
    reactive,
    PropType,
    toRefs,
    ref,
    watch,
    useSlots,
  } from 'vue';

  import { createTreeDragFoundation } from '@sdata/web-core/tree/drag';
  import { createTreeFoundation } from '@sdata/web-core/tree/foundation';
  import { getActiveTreeKey, getTreeKeyAction } from '@sdata/web-core/tree/keyboard';
  import {
    getDefaultExpandedKeys as getInitialExpandedKeys,
    getVisibleTreeNodes,
  } from '@sdata/web-core/tree/query';

  import type {
    VirtualListProps,
    ScrollIntoViewOptions,
    VirtualListRef,
  } from '../_components/virtual-list/interface';
  import type {
    TreeFieldNames,
    TreeNodeData,
    FilterTreeNode,
    DropPosition,
    TreeNodeKey,
    CheckedStrategy,
    Node,
    TreeNodeDomEventName,
    TreeNodeSwipeEventData,
    TreeNodeSwipeEventName,
    TreeEllipsis,
  } from './interface';

  import VirtualList from '../_components/virtual-list';
  import useDragSort from '../_hooks/use-drag-sort';
  import useMergeState from '../_hooks/use-merge-state';
  import usePickSlots from '../_hooks/use-pick-slots';
  import { getPrefixCls } from '../_utils/global-config';
  import { isUndefined } from '../_utils/is';
  import { TreeInjectionKey } from './context';
  import useCheckedState from './hooks/use-checked-state';
  import useTreeData from './hooks/use-tree-data';
  import TreeNode from './node.vue';

  const TREE_VIRTUAL_ITEM_SIZE = {
    mini: 24,
    small: 28,
    medium: 32,
    large: 36,
  } as const;
  defineOptions({ name: 'Tree' });

  const props = defineProps({
    /**
     * @zh 尺寸
     * @en Size
     */
    size: {
      type: String as PropType<'mini' | 'small' | 'medium' | 'large'>,
      default: 'medium',
    },
    /**
     * @zh 节点是否占据一行
     * @en Whether the node occupies a row
     */
    blockNode: {
      type: Boolean,
    },
    /**
     * @zh 是否显示节点的展开/收起 switcher，设为 `false` 时不渲染 `switcher` 节点
     * @en Whether to display the expand/collapse switcher of the node. When set to `false`, the switcher node will not be rendered
     */
    switcher: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否默认展开父节点
     * @en Whether to expand the parent node by default
     */
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否支持多选
     * @en Whether to support multiple selection
     */
    multiple: {
      type: Boolean,
    },
    /**
     * @zh 是否在节点前添加复选框，从 `2.27.0` 开始支持函数格式
     * @en Whether to add a checkbox before the node, function format is supported since `2.27.0`
     */
    checkable: {
      type: [Boolean, String, Function] as PropType<
        | boolean
        | ((
            node: TreeNodeData,
            info: {
              level: number;
              isLeaf: boolean;
            },
          ) => boolean)
      >,
      default: false,
    },
    /**
     * @zh 是否支持选择，从 `2.27.0` 开始支持函数格式
     * @en Whether to support selection, function format is supported since `2.27.0`
     * */
    selectable: {
      type: [Boolean, Function] as PropType<
        | boolean
        | ((
            node: TreeNodeData,
            info: {
              level: number;
              isLeaf: boolean;
            },
          ) => boolean)
      >,
      default: true,
    },
    /**
     * @zh 是否取消父子节点关联
     * @en Whether to cancel the parent-child node association
     * */
    checkStrictly: {
      type: Boolean,
    },
    /**
     * @zh 定制回填方式 <br/> all: 返回所有选中的节点  <br/> parent: 父子节点都选中时只返回父节点 <br/> child: 只返回子节点
     * @en Customized backfill method <br/> all: return all selected nodes <br/> parent: return only parent node when both parent and child nodes are selected <br/> child: return only child nodes
     * */
    checkedStrategy: {
      type: String as PropType<'all' | 'parent' | 'child'>,
      default: 'all',
    },
    /**
     * @zh 默认选中的树节点
     * @en Tree node selected by default
     * */
    defaultSelectedKeys: {
      type: Array as PropType<Array<string | number>>,
    },
    /**
     * @zh 选中的树节点
     * @en Selected tree node
     * @vModel
     */
    selectedKeys: {
      type: Array as PropType<Array<string | number>>,
    },
    /**
     * @zh 默认选中复选框的树节点
     * @en Tree node with checkbox selected by default
     * */
    defaultCheckedKeys: {
      type: Array as PropType<Array<string | number>>,
    },
    /**
     * @zh 选中复选框的树节点
     * @en Tree node with check box selected
     * @vModel
     */
    checkedKeys: {
      type: Array as PropType<Array<string | number>>,
    },
    /**
     * @zh 默认展开的节点
     * @en Nodes expanded by default
     * */
    defaultExpandedKeys: {
      type: Array as PropType<Array<string | number>>,
    },
    /**
     * @zh 展开的节点
     * @en Expanded node
     * @vModel
     */
    expandedKeys: {
      type: Array as PropType<Array<string | number>>,
    },
    /**
     * @zh 传入`data`,生成对应的树结构
     * @en Pass in `data` to generate the corresponding tree structure
     * */
    data: {
      type: Array as PropType<TreeNodeData[]>,
      default: () => [],
    },
    /**
     * @zh 指定节点数据中的字段名
     * @en Specify the field name in the node data
     * */
    fieldNames: {
      type: Object as PropType<TreeFieldNames>,
    },
    /**
     * @zh 是否展示连接线
     * @en Whether to display the connection line
     * */
    showLine: {
      type: Boolean,
    },
    /**
     * @zh 异步加载数据的回调，返回一个 `Promise`
     * @en A callback for loading data asynchronously, returning a `Promise`
     * */
    loadMore: {
      type: Function as PropType<(node: TreeNodeData) => Promise<void>>,
    },
    /**
     * @zh 是否可以拖拽
     * @en Whether it can be dragged
     * */
    draggable: {
      type: Boolean,
    },
    /**
     * @zh 拖拽时是否允许在某节点上释放
     * @en Whether to allow release on a node when dragging
     * */
    allowDrop: {
      type: Function as PropType<
        (options: { dropNode: TreeNodeData; dropPosition: -1 | 0 | 1 }) => boolean
      >,
    },
    filterTreeNode: {
      type: Function as PropType<FilterTreeNode>,
    },
    searchValue: {
      type: String,
      default: '',
    },
    /**
     * @zh 传递虚拟列表属性，传入此参数以开启虚拟滚动，[VirtualListProps](#VirtualListProps)
     * @en Pass virtual list properties, pass in this parameter to turn on virtual scrolling, [VirtualListProps](#VirtualListProps)
     */
    virtualListProps: {
      type: Object as PropType<VirtualListProps>,
    },
    /**
     * @zh 是否默认展开已选中节点的父节点
     * @en Whether to expand the parent node of the selected node by default
     * @version 2.9.0
     */
    defaultExpandSelected: {
      type: Boolean,
    },
    /**
     * @zh 是否默认展开已选中复选框节点的父节点
     * @en Whether to expand the parent node of the checked node by default
     * @version 2.9.0
     */
    defaultExpandChecked: {
      type: Boolean,
    },
    /**
     * @zh 是否自动展开已展开节点的父节点
     * @en Whether to automatically expand the parent node of the expanded node
     * @version 2.9.0
     */
    autoExpandParent: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 半选状态的节点.仅在 checkable 且 checkStrictly 时生效
     * @en The keys of half checked. Only valid when checkable and checkStrictly
     * @version 2.19.0
     * @vModel
     */
    halfCheckedKeys: {
      type: Array as PropType<Array<string | number>>,
    },
    /**
     * @zh 开启后 checkedKeys 只处理叶子节点，父节点状态由子节点决定（仅在 checkable 且 checkStrictly 为 false 时生效）
     * @en When enabled, checkedKeys is only for checked leaf nodes, and the status of the parent node is determined by the child node.(Only valid when checkable and checkStrictly is false)
     * @version 2.21.0
     */
    onlyCheckLeaf: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否开启展开时的过渡动效
     * @en Whether to enable expand transition animation
     * @version 2.21.0
     */
    animation: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否使用 Ellipsis 组件渲染节点标题。传入 `performant-ellipsis` 时使用高性能省略实现。
     * @en Whether to render node titles with the Ellipsis component. Use `performant-ellipsis` for the performant implementation.
     */
    ellipsis: {
      type: [Boolean, String] as PropType<TreeEllipsis>,
      default: false,
    },
    /**
     * @zh 点击节点的时候触发的动作
     * @en The action triggered when the node is clicked
     * @version 2.27.0
     */
    actionOnNodeClick: {
      type: String as PropType<'expand'>,
    },
    // internal
    disableSelectActionOnly: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 点击树节点时触发
     * @en Triggered when the tree node is clicked
     * @param {Array<string | number>} selectedKeys
     * @param {{ selected?: boolean; selectedNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event; }} data
     */
    'select': [
      _selectedKeys: (string | number)[],
      _data: {
        selected?: boolean;
        selectedNodes: TreeNodeData[];
        node?: TreeNodeData;
        e?: Event;
      },
    ];
    'update:selectedKeys': [_selectedKeys: (string | number)[]];
    /**
     * @zh 点击树节点复选框时触发。`halfCheckedKeys` 和 `halfCheckedNodes` 从 `2.19.0` 开始支持。
     * @en Triggered when the tree node checkbox is clicked. `halfCheckedKeys` and `halfCheckedNodes` support from `2.19.0`.
     * @param {Array<string | number>} checkedKeys
     * @param {{ checked?: boolean; checkedNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event; halfCheckedKeys: (string | number)[]; halfCheckedNodes: TreeNodeData[]; }} data
     */
    'check': [
      _checkedKeys: (string | number)[],
      _data: {
        checked?: boolean;
        checkedNodes: TreeNodeData[];
        node?: TreeNodeData;
        halfCheckedKeys: (string | number)[];
        halfCheckedNodes: TreeNodeData[];
        e?: Event;
      },
    ];
    'update:checkedKeys': [_checkedKeys: (string | number)[]];
    'update:halfCheckedKeys': [_halfCheckedKeys: (string | number)[]];
    /**
     * @zh 展开/关闭
     * @en Expand/close
     * @param {Array<string | number>} expandKeys
     * @param {{ expanded?: boolean; expandNodes: TreeNodeData[]; node?: TreeNodeData; e?: Event; }} data
     */
    'expand': [
      _expandKeys: (string | number)[],
      _data: {
        expanded?: boolean;
        expandedNodes: TreeNodeData[];
        node?: TreeNodeData;
        e?: Event;
      },
    ];
    'update:expandedKeys': [_expandKeys: (string | number)[]];
    /**
     * @zh 节点开始拖拽
     * @en Node starts dragging
     * @param {DragEvent} ev
     * @param {TreeNodeData} node
     */
    'dragStart': [_ev: DragEvent, _node: TreeNodeData];
    /**
     * @zh 节点结束拖拽
     * @en Node end drag
     * @param {DragEvent} ev
     * @param {TreeNodeData} node
     */
    'dragEnd': [_ev: DragEvent, _node: TreeNodeData];
    /**
     * @zh 节点被拖拽至可释放目标
     * @en The node is dragged to the releasable target
     * @param {DragEvent} ev
     * @param {TreeNodeData} node
     */
    'dragOver': [_ev: DragEvent, _node: TreeNodeData];
    /**
     * @zh 节点离开可释放目标
     * @en Node leaves to release the target
     * @param {DragEvent} ev
     * @param {TreeNodeData} node
     */
    'dragLeave': [_ev: DragEvent, _node: TreeNodeData];
    /**
     * @zh 节点在可释放目标上释放
     * @en The node is released on a releasable target
     * @param {{ e: DragEvent; dragNode: TreeNodeData; dropNode: TreeNodeData; dropPosition: number; }} data
     */
    'drop': [
      _data: {
        e: DragEvent;
        dragNode: TreeNodeData;
        dropNode: TreeNodeData;
        dropPosition: number;
      },
    ];
    /**
     * @zh 节点标题区域触发基础 DOM 事件时触发
     * @en Triggered when basic DOM events are fired on the node title area
     * @param {TreeNodeData} node
     * @param {Event} event
     */
    'nodeClick': [_node: TreeNodeData, _event: Event];
    'nodeDblclick': [_node: TreeNodeData, _event: Event];
    'nodeContextmenu': [_node: TreeNodeData, _event: Event];
    'nodeMouseover': [_node: TreeNodeData, _event: Event];
    'nodeMouseenter': [_node: TreeNodeData, _event: Event];
    'nodeMouseleave': [_node: TreeNodeData, _event: Event];
    'nodeMousemove': [_node: TreeNodeData, _event: Event];
    'nodeMouseout': [_node: TreeNodeData, _event: Event];
    'nodeMousedown': [_node: TreeNodeData, _event: Event];
    'nodeMouseup': [_node: TreeNodeData, _event: Event];
    'nodePointerdown': [_node: TreeNodeData, _event: Event];
    'nodePointermove': [_node: TreeNodeData, _event: Event];
    'nodePointerup': [_node: TreeNodeData, _event: Event];
    'nodePointerenter': [_node: TreeNodeData, _event: Event];
    'nodePointerleave': [_node: TreeNodeData, _event: Event];
    'nodePointerover': [_node: TreeNodeData, _event: Event];
    'nodePointerout': [_node: TreeNodeData, _event: Event];
    'nodePointercancel': [_node: TreeNodeData, _event: Event];
    'nodeTouchstart': [_node: TreeNodeData, _event: Event];
    'nodeTouchmove': [_node: TreeNodeData, _event: Event];
    'nodeTouchend': [_node: TreeNodeData, _event: Event];
    'nodeTouchcancel': [_node: TreeNodeData, _event: Event];
    'nodeKeydown': [_node: TreeNodeData, _event: Event];
    'nodeKeyup': [_node: TreeNodeData, _event: Event];
    'nodeKeypress': [_node: TreeNodeData, _event: Event];
    /**
     * @zh 节点标题区域触发长按时触发
     * @en Triggered when the node title area is long pressed
     * @param {TreeNodeData} node
     * @param {PointerEvent} event
     */
    'nodeLongPress': [_node: TreeNodeData, _event: PointerEvent];
    /**
     * @zh 节点标题区域触发滑动时触发
     * @en Triggered when the node title area is swiped
     * @param {TreeNodeData} node
     * @param {TouchEvent} event
     * @param {{ direction: 'up' | 'down' | 'left' | 'right' | 'none' }} data
     */
    'nodeSwipeStart': [_node: TreeNodeData, _event: TouchEvent, _data: TreeNodeSwipeEventData];
    'nodeSwipe': [_node: TreeNodeData, _event: TouchEvent, _data: TreeNodeSwipeEventData];
    'nodeSwipeEnd': [_node: TreeNodeData, _event: TouchEvent, _data: TreeNodeSwipeEventData];
  }>();

  /**
   * @zh 定制节点图标
   * @en Custom node icon
   * @slot icon
   * @binding {TreeNodeData} node
   * @version 2.18.0
   */
  /**
   * @zh 定制 switcher 图标
   * @en Custom switcher icon
   * @slot switcher-icon
   */
  /**
   * @zh 定制 loading 图标
   * @en Custom loading icon
   * @slot loading-icon
   */
  /**
   * @zh 定制 drag 图标
   * @en Custom drag icon
   * @slot drag-icon
   * @binding {TreeNodeData} node
   */
  /**
   * @zh 渲染额外的节点内容
   * @en Render additional node content
   * @slot extra
   */
  /**
   * @zh 标题
   * @en Title
   * @slot title
   * @binding {string} title
   */

  const slots = useSlots();

  const {
    data: propTreeData,
    showLine,
    multiple,
    loadMore,
    checkStrictly,
    checkedKeys: propCheckedKeys,
    defaultCheckedKeys,
    selectedKeys: propSelectedKeys,
    defaultSelectedKeys,
    expandedKeys: propExpandedKeys,
    defaultExpandedKeys,
    checkedStrategy,
    selectable,
    checkable,
    blockNode,
    fieldNames,
    size,
    defaultExpandAll,
    filterTreeNode,
    draggable,
    allowDrop,
    defaultExpandSelected,
    defaultExpandChecked,
    autoExpandParent,
    halfCheckedKeys,
    onlyCheckLeaf,
    animation,
    virtualListProps,
  } = toRefs(props);

  const prefixCls = getPrefixCls('tree');
  const classNames = computed(() => [
    `${prefixCls}`,
    {
      [`${prefixCls}-checkable`]: checkable.value,
      [`${prefixCls}-show-line`]: showLine.value,
    },
    `${prefixCls}-size-${size.value}`,
  ]);
  const resolvedVirtualListProps = computed<VirtualListProps | undefined>(() => {
    if (!virtualListProps!.value) {
      return undefined;
    }

    const nextVirtualListProps: VirtualListProps = {
      ...virtualListProps!.value,
    };

    if (
      nextVirtualListProps.itemSize === undefined &&
      nextVirtualListProps.minItemSize === undefined
    ) {
      nextVirtualListProps.itemSize = TREE_VIRTUAL_ITEM_SIZE[size.value];
    }

    if (nextVirtualListProps.height !== undefined) {
      return nextVirtualListProps;
    }

    return {
      ...nextVirtualListProps,
      height: '100%',
    };
  });
  const enableVirtualExpandAnimation = computed(() => {
    if (!virtualListProps!.value) {
      return animation.value;
    }

    return false;
  });
  const treeStyle = computed(() => {
    if (!virtualListProps!.value || virtualListProps!.value.height !== undefined) {
      return undefined;
    }

    return {
      height: '100%',
      minHeight: 0,
    };
  });
  const virtualListRef = ref<VirtualListRef | null>(null);
  const rootEl = ref<HTMLElement | null>(null);
  const virtualListVersion = ref(0);
  const virtualListKey = computed(() => `tree-virtual-list-${virtualListVersion.value}`);

  const switcherIcon = usePickSlots(slots, 'switcher-icon');
  const loadingIcon = usePickSlots(slots, 'loading-icon');
  const dragIcon = usePickSlots(slots, 'drag-icon');
  const nodeIcon = usePickSlots(slots, 'icon');
  const nodeTitle = usePickSlots(slots, 'title');
  const nodeExtra = usePickSlots(slots, 'extra');

  const { treeData, flattenTreeData, key2TreeNode } = useTreeData(
    reactive({
      treeData: propTreeData,
      selectable,
      showLine,
      blockNode,
      checkable,
      fieldNames,
      loadMore,
      draggable,
    }),
  );

  const {
    checkedKeys: mergedCheckedKeys,
    indeterminateKeys,
    setCheckedState,
  } = useCheckedState(
    reactive({
      defaultCheckedKeys,
      checkedKeys: propCheckedKeys,
      checkStrictly,
      key2TreeNode,
      halfCheckedKeys,
      onlyCheckLeaf,
    }),
  );
  const [mergedSelectedKeys, setMergedSelectedKeys] = useMergeState<TreeNodeKey[]>(
    defaultSelectedKeys?.value || [],
    reactive({
      value: propSelectedKeys,
    }),
  );
  const loadingKeys = ref<TreeNodeKey[]>([]);

  const dragNode = ref<Node>();
  const dragState = reactive({
    sourceKey: undefined as TreeNodeKey | undefined,
    targetKey: undefined as TreeNodeKey | undefined,
    position: 0 as DropPosition,
    allowed: false,
  });
  const treeDrag = createTreeDragFoundation<TreeNodeData, Node, DragEvent>({
    state: dragState,
    dragNode,
    getNodes: () => key2TreeNode.value,
    allowDrop: allowDrop!,
    events: {
      start: (event, node) => emit('dragStart', event, node),
      end: (event, node) => emit('dragEnd', event, node),
      over: (event, node) => emit('dragOver', event, node),
      leave: (event, node) => emit('dragLeave', event, node),
      drop: (data) => emit('drop', data),
    },
  });
  function nodeFromElement(item: HTMLElement) {
    const key = item.dataset.keyType === 'number' ? Number(item.dataset.key) : item.dataset.key!;
    return key2TreeNode.value.get(key);
  }
  useDragSort(rootEl, {
    draggable: '[data-tree-draggable]',
    handle: `.${getPrefixCls('tree-node')}-title-draggable`,
    onStart(item, event) {
      treeDrag.start(nodeFromElement(item), event);
    },
    onOver(item, event) {
      const node = item ? nodeFromElement(item) : undefined;
      treeDrag.over(
        node,
        event,
        item
          ? () => {
              const title = item.querySelector(`.${getPrefixCls('tree-node')}-title`);
              const rect = (title ?? item).getBoundingClientRect();
              return { offset: event.clientY - rect.top, height: rect.height };
            }
          : undefined,
      );
    },
    onEnd(event, cancelled) {
      treeDrag.end(event, cancelled);
    },
  });

  function getDefaultExpandedKeys() {
    return getInitialExpandedKeys({
      nodes: flattenTreeData.value,
      key2TreeNode: key2TreeNode.value,
      defaultExpandedKeys: defaultExpandedKeys?.value,
      autoExpandParent: autoExpandParent.value,
      defaultExpandAll: defaultExpandAll.value,
      defaultExpandSelected: defaultExpandSelected.value,
      defaultExpandChecked: defaultExpandChecked.value,
      selectedKeys: mergedSelectedKeys.value,
      checkedKeys: mergedCheckedKeys.value,
    });
  }

  const [mergedExpandedKeys, setExpandState] = useMergeState<TreeNodeKey[]>(
    getDefaultExpandedKeys(),
    reactive({
      value: propExpandedKeys,
    }),
  );

  watch(
    () => mergedExpandedKeys.value.join(','),
    () => {
      if (!virtualListProps!.value || enableVirtualExpandAnimation.value) {
        return;
      }

      virtualListVersion.value += 1;
    },
  );

  const currentExpandKeys = ref<TreeNodeKey[]>([]);

  const visibleTreeNodeList = computed(() =>
    getVisibleTreeNodes<TreeNodeData, Node>({
      nodes: flattenTreeData.value,
      expandedKeys: mergedExpandedKeys.value,
      expandingKeys: currentExpandKeys.value,
      filter: filterTreeNode?.value,
    }),
  );

  // ============ 键盘导航（WAI-ARIA tree，roving tabindex） ============
  // 活动节点：默认选中节点或首个可见节点；用户用方向键后跟踪当前焦点。
  const activeKey = ref<TreeNodeKey | undefined>(undefined);
  const effectiveActiveKey = computed(() =>
    getActiveTreeKey(activeKey.value, mergedSelectedKeys.value, visibleTreeNodeList.value),
  );

  let pendingFocusKey: TreeNodeKey | undefined;

  function focusPendingNode() {
    if (pendingFocusKey === undefined) return;
    const el = rootEl.value?.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(String(pendingFocusKey))}"][data-key-type="${typeof pendingFocusKey}"]`,
    );
    if (el) {
      el.focus();
      if (el.ownerDocument.activeElement === el) pendingFocusKey = undefined;
    }
  }

  function focusNodeKey(targetKey: TreeNodeKey) {
    activeKey.value = targetKey;
    pendingFocusKey = targetKey;
    scrollIntoView({ key: targetKey, align: 'auto' });
    nextTick(focusPendingNode);
  }

  function onNodeKeydown(key: TreeNodeKey, e: KeyboardEvent) {
    const action = getTreeKeyAction({
      key,
      eventKey: e.key,
      visibleNodes: visibleTreeNodeList.value,
      expandedKeys: mergedExpandedKeys.value,
      canLoadMore: !!onLoadMore.value,
    });
    if (!action) return;
    e.preventDefault();
    switch (action.type) {
      case 'focus':
        focusNodeKey(action.key);
        break;
      case 'load':
        void onLoadMore.value?.(action.key);
        break;
      case 'expand':
        onExpand(action.expanded, action.key, e);
        break;
      case 'check':
        onCheck(!mergedCheckedKeys.value.includes(action.key), action.key, e);
        break;
      case 'select':
        onSelect(action.key, e);
        break;
    }
  }

  const treeFoundation = createTreeFoundation<TreeNodeData, Node, Event>({
    getNodes: () => key2TreeNode.value,
    getSelectedKeys: () => mergedSelectedKeys.value,
    getCheckedKeys: () => mergedCheckedKeys.value,
    getIndeterminateKeys: () => indeterminateKeys.value,
    getExpandedKeys: () => mergedExpandedKeys.value,
    getExpandingKeys: () => currentExpandKeys.value,
    getLoadingKeys: () => loadingKeys.value,
    getMultiple: () => multiple.value,
    getCheckStrictly: () => checkStrictly.value,
    getCheckedStrategy: () => checkedStrategy.value,
    getAnimateExpand: () => enableVirtualExpandAnimation.value,
    getLoadMore: () => loadMore?.value,
    setSelectedKeys: setMergedSelectedKeys,
    setCheckedState,
    setExpandedKeys: setExpandState,
    setExpandingKeys: (keys) => {
      currentExpandKeys.value = keys;
    },
    setLoadingKeys: (keys) => {
      loadingKeys.value = keys;
    },
    onLoadError: (error) => {
      // oxlint-disable-next-line no-console
      console.error('[tree]load data error: ', error);
    },
    events: {
      updateSelected: (keys) => emit('update:selectedKeys', keys),
      select: (keys, data) => emit('select', keys, data),
      updateChecked: (keys) => emit('update:checkedKeys', keys),
      updateHalfChecked: (keys) => emit('update:halfCheckedKeys', keys),
      check: (keys, data) => emit('check', keys, data),
      updateExpanded: (keys) => emit('update:expandedKeys', keys),
      expand: (keys, data) => emit('expand', keys, data),
    },
  });
  const {
    nodes: getNodes,
    publicCheckedKeys: getPublicCheckedKeys,
    check: onCheck,
    select: onSelect,
    expand: onExpand,
    endExpand: onExpandEnd,
  } = treeFoundation;

  function onNodeEvent(eventName: TreeNodeDomEventName, key: TreeNodeKey, event: Event) {
    const node = key2TreeNode.value.get(key);
    if (!node) return;

    const nodeData = node.treeNodeData;
    switch (eventName) {
      case 'click':
        emit('nodeClick', nodeData, event);
        break;
      case 'dblclick':
        emit('nodeDblclick', nodeData, event);
        break;
      case 'contextmenu':
        emit('nodeContextmenu', nodeData, event);
        break;
      case 'mouseover':
        emit('nodeMouseover', nodeData, event);
        break;
      case 'mouseenter':
        emit('nodeMouseenter', nodeData, event);
        break;
      case 'mouseleave':
        emit('nodeMouseleave', nodeData, event);
        break;
      case 'mousemove':
        emit('nodeMousemove', nodeData, event);
        break;
      case 'mouseout':
        emit('nodeMouseout', nodeData, event);
        break;
      case 'mousedown':
        emit('nodeMousedown', nodeData, event);
        break;
      case 'mouseup':
        emit('nodeMouseup', nodeData, event);
        break;
      case 'pointerdown':
        emit('nodePointerdown', nodeData, event);
        break;
      case 'pointermove':
        emit('nodePointermove', nodeData, event);
        break;
      case 'pointerup':
        emit('nodePointerup', nodeData, event);
        break;
      case 'pointerenter':
        emit('nodePointerenter', nodeData, event);
        break;
      case 'pointerleave':
        emit('nodePointerleave', nodeData, event);
        break;
      case 'pointerover':
        emit('nodePointerover', nodeData, event);
        break;
      case 'pointerout':
        emit('nodePointerout', nodeData, event);
        break;
      case 'pointercancel':
        emit('nodePointercancel', nodeData, event);
        break;
      case 'touchstart':
        emit('nodeTouchstart', nodeData, event);
        break;
      case 'touchmove':
        emit('nodeTouchmove', nodeData, event);
        break;
      case 'touchend':
        emit('nodeTouchend', nodeData, event);
        break;
      case 'touchcancel':
        emit('nodeTouchcancel', nodeData, event);
        break;
      case 'keydown':
        emit('nodeKeydown', nodeData, event);
        break;
      case 'keyup':
        emit('nodeKeyup', nodeData, event);
        break;
      case 'keypress':
        emit('nodeKeypress', nodeData, event);
        break;
    }
  }

  function onNodeLongPress(key: TreeNodeKey, event: PointerEvent) {
    const node = key2TreeNode.value.get(key);
    if (!node) return;

    emit('nodeLongPress', node.treeNodeData, event);
  }

  function onNodeSwipe(
    eventName: TreeNodeSwipeEventName,
    key: TreeNodeKey,
    event: TouchEvent,
    swipeData: TreeNodeSwipeEventData,
  ) {
    const node = key2TreeNode.value.get(key);
    if (!node) return;

    if (eventName === 'swipeStart') {
      emit('nodeSwipeStart', node.treeNodeData, event, swipeData);
    } else if (eventName === 'swipe') {
      emit('nodeSwipe', node.treeNodeData, event, swipeData);
    } else {
      emit('nodeSwipeEnd', node.treeNodeData, event, swipeData);
    }
  }

  const onLoadMore = computed(() =>
    loadMore?.value ? (key: TreeNodeKey) => treeFoundation.loadMore(key) : undefined,
  );

  const treeContext = reactive({
    treeProps: props,
    dragState,
    switcherIcon,
    loadingIcon,
    dragIcon,
    nodeIcon,
    nodeTitle,
    nodeExtra,
    treeData,
    flattenTreeData,
    key2TreeNode,
    checkedKeys: mergedCheckedKeys,
    indeterminateKeys,
    selectedKeys: mergedSelectedKeys,
    expandedKeys: mergedExpandedKeys,
    loadingKeys,
    currentExpandKeys,
    activeKey: effectiveActiveKey,
    onLoadMore,
    filterTreeNode,
    onCheck,
    onSelect,
    onExpand,
    onExpandEnd,
    onNodeEvent,
    onNodeKeydown,
    onNodeLongPress,
    onNodeSwipe,
    allowDrop: treeDrag.allowDrop,
    onDragStart: treeDrag.onDragStart,
    onDragEnd: treeDrag.onDragEnd,
    onDragOver: treeDrag.onDragOver,
    onDragLeave: treeDrag.onDragLeave,
    onDrop: treeDrag.onDrop,
  });

  provide(TreeInjectionKey, treeContext as import('./context').TreeContext);

  function toggleCheck(key: TreeNodeKey, e?: Event) {
    treeFoundation.toggleCheck(key, e);
  }
  /**
   * @zh 虚拟列表滚动某个元素
   * @en Virtual list scroll to an element
   * @param {{ index?: number; key?: number | string; align: 'auto' | 'top' | 'bottom'}} options
   * @public
   */
  function scrollIntoView(options: ScrollIntoViewOptions) {
    virtualListRef.value && virtualListRef.value.scrollTo(options);
  }
  /**
   * @zh 获取选中的节点
   * @en Get selected nodes
   * @returns {TreeNodeData[]}
   * @public
   * @version 2.19.0
   */
  function getSelectedNodes() {
    return getNodes(mergedSelectedKeys.value);
  }
  /**
   * @zh 获取选中复选框的节点。支持传入 `checkedStrategy`，没有传则取组件的配置。
   * @en Get checked nodes. Supports passing in `checkedStrategy`, if not passed, the configuration of the component is taken.
   * @param { checkedStrategy?: 'all' | 'parent' | 'child'; includeHalfChecked?: boolean; } options
   * @returns {TreeNodeData[]}
   * @public
   * @version 2.19.0
   */
  function getCheckedNodes(
    options: {
      checkedStrategy?: CheckedStrategy;
      includeHalfChecked?: boolean;
    } = {},
  ) {
    const { checkedStrategy, includeHalfChecked } = options;
    const pubCheckedKeys = getPublicCheckedKeys(mergedCheckedKeys.value, checkedStrategy);
    const checkedNodes = getNodes(pubCheckedKeys);
    return [...checkedNodes, ...(includeHalfChecked ? getHalfCheckedNodes() : [])];
  }
  /**
   * @zh 获取复选框半选的节点
   * @en Get half checked nodes
   * @returns {TreeNodeData[]}
   * @public
   * @version 2.19.0
   */
  function getHalfCheckedNodes() {
    return getNodes(indeterminateKeys.value);
  }
  /**
   * @zh 获取展开的节点
   * @en Get expanded nodes
   * @returns {TreeNodeData[]}
   * @public
   * @version 2.19.0
   */
  function getExpandedNodes() {
    return getNodes(mergedExpandedKeys.value);
  }
  /**
   * @zh 设置全部节点的复选框状态
   * @en Set the checkbox state of all nodes
   * @param { boolean } checked
   * @public
   * @version 2.20.0
   */
  function checkAll(checked = true) {
    treeFoundation.checkAll(checked);
  }
  /**
   * @zh 设置指定节点的复选框状态
   * @en Sets the checkbox state of the specified node
   * @param { TreeNodeKey | TreeNodeKey[] } key
   * @param { boolean } checked
   * @param { boolean } onlyCheckLeaf
   * @public
   * @version 2.20.0，onlyCheckLeaf from 2.21.0
   */
  function checkNode(key: TreeNodeKey | TreeNodeKey[], checked = true, onlyCheckLeaf = false) {
    treeFoundation.checkNode(key, checked, onlyCheckLeaf);
  }
  /**
   * @zh 设置全部节点的选中状态
   * @en Set the selected state of all nodes
   * @param { boolean } selected
   * @public
   * @version 2.20.0
   */
  function selectAll(selected = true) {
    treeFoundation.selectAll(selected);
  }
  /**
   * @zh 设置指定节点的选中状态
   * @en Sets the selected state of the specified node
   * @param { TreeNodeKey | TreeNodeKey[] } key
   * @param { boolean } selected
   * @public
   * @version 2.20.0
   */
  function selectNode(key: TreeNodeKey | TreeNodeKey[], selected = true) {
    treeFoundation.selectNode(key, selected);
  }
  /**
   * @zh 设置全部节点的展开状态
   * @en Set the expanded state of all nodes
   * @param { boolean } expanded
   * @public
   * @version 2.20.0
   */
  function expandAll(expanded = true) {
    treeFoundation.expandAll(expanded);
  }
  /**
   * @zh 设置指定节点的展开状态
   * @en Sets the expanded state of the specified node
   * @param { TreeNodeKey | TreeNodeKey[] } key
   * @param { boolean } expanded
   * @public
   * @version 2.20.0
   */
  function expandNode(key: TreeNodeKey | TreeNodeKey[], expanded = true) {
    treeFoundation.expandNode(key, expanded);
  }

  defineExpose({
    toggleCheck,
    scrollIntoView,
    getSelectedNodes,
    getCheckedNodes,
    getHalfCheckedNodes,
    getExpandedNodes,
    checkAll,
    checkNode,
    selectAll,
    selectNode,
    expandAll,
    expandNode,
  });
</script>
