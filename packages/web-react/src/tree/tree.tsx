import type { TreeDragAdapter } from '@sdata/web-core/tree/drag';
import type { TreeSwipeDirection } from '@sdata/web-core/tree/gestures';
import type { TreeNodeDomEventName } from '@sdata/web-core/tree/node';
import type { TreeModelNode, TreeModelOptions } from '@sdata/web-core/tree/types';
import type { ComponentPropsWithoutRef, Ref } from 'react';

import { getVisibleTreeNodes, getTransitionTreeNodes } from '@sdata/web-core/tree/query';
import { Fragment, useImperativeHandle, useRef, useState } from 'react';

import type { VirtualListProps, VirtualListRef } from '../_shared/virtual-list.js';
import type { TreeNodeData, TreeNodeViewProps } from './node.js';
import type { TreeStateProps } from './use-tree-state.js';

import { VirtualList } from '../_shared/virtual-list.js';
import { usePrefix } from '../config-provider/index.js';
import { TreeNodeView } from './node.js';
import { TreeTransitionList } from './transition-list.js';
import { useTreeDrag } from './use-drag.js';
import { useTreeKeyboard } from './use-keyboard.js';
import { useTreeData } from './use-tree-data.js';
import { useTreeState } from './use-tree-state.js';

type StateEvents<T extends TreeNodeData> = NonNullable<TreeStateProps<T, Event>['events']>;
type NodeEvents<T> = {
  [K in TreeNodeDomEventName as `onNode${Capitalize<K>}`]?: (node: T, event: Event) => void;
};
type DragEvents<T extends TreeNodeData> = TreeDragAdapter<T, TreeModelNode<T>, DragEvent>['events'];
type SwipeHandler<T> = (
  node: T,
  event: TouchEvent,
  data: { direction: TreeSwipeDirection },
) => void;
export interface TreeProps<T extends TreeNodeData = TreeNodeData>
  extends
    Partial<Omit<TreeStateProps<T, Event>, 'events' | 'animateExpand'>>,
    Partial<Omit<TreeModelOptions<T>, 'loadMore'>>,
    Omit<
      ComponentPropsWithoutRef<'div'>,
      | 'onSelect'
      | 'onCheck'
      | 'draggable'
      | 'onDragStart'
      | 'onDragEnd'
      | 'onDragOver'
      | 'onDragLeave'
      | 'onDrop'
    >,
    NodeEvents<T>,
    Pick<
      TreeNodeViewProps<T>,
      | 'renderTitle'
      | 'renderIcon'
      | 'renderSwitcherIcon'
      | 'renderLoadingIcon'
      | 'renderDragIcon'
      | 'renderExtra'
      | 'ellipsis'
      | 'switcher'
      | 'disableSelectActionOnly'
    > {
  ref?: Ref<TreeInstance<T>>;
  data?: T[];
  treeData?: T[];
  filterTreeNode?(node: T): boolean;
  actionOnNodeClick?: 'expand' | 'expand'[];
  animation?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large';
  searchValue?: string;
  virtualListProps?: Omit<VirtualListProps<TreeModelNode<T>>, 'items' | 'children' | 'ref'>;
  onSelectedKeysChange?: StateEvents<T>['updateSelected'];
  onCheckedKeysChange?: StateEvents<T>['updateChecked'];
  onHalfCheckedKeysChange?: StateEvents<T>['updateHalfChecked'];
  onExpandedKeysChange?: StateEvents<T>['updateExpanded'];
  onSelect?: StateEvents<T>['select'];
  onCheck?: StateEvents<T>['check'];
  onExpand?: StateEvents<T>['expand'];
  allowDrop?: TreeDragAdapter<T, TreeModelNode<T>, DragEvent>['allowDrop']['value'];
  onDragStart?: DragEvents<T>['start'];
  onDragEnd?: DragEvents<T>['end'];
  onDragOver?: DragEvents<T>['over'];
  onDragLeave?: DragEvents<T>['leave'];
  onDrop?: DragEvents<T>['drop'];
  onNodeLongPress?(node: T, event: PointerEvent): void;
  onNodeSwipeStart?: SwipeHandler<T>;
  onNodeSwipe?: SwipeHandler<T>;
  onNodeSwipeEnd?: SwipeHandler<T>;
}
export type TreeInstance<T extends TreeNodeData = TreeNodeData> = Pick<
  ReturnType<typeof useTreeState<T, Event>>['foundation'],
  'checkAll' | 'checkNode' | 'selectAll' | 'selectNode' | 'expandAll' | 'expandNode' | 'toggleCheck'
> & {
  getSelectedNodes(): T[];
  getExpandedNodes(): T[];
  getHalfCheckedNodes(): T[];
  getCheckedNodes(options?: {
    checkedStrategy?: 'all' | 'parent' | 'child';
    includeHalfChecked?: boolean;
  }): T[];
  scrollIntoView(options: Parameters<VirtualListRef['scrollTo']>[0]): void;
};

export function Tree<T extends TreeNodeData = TreeNodeData>({
  ref,
  data,
  treeData,
  fieldNames,
  selectable = true,
  checkable = false,
  blockNode = false,
  showLine = false,
  draggable = false,
  allowDrop,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onNodeLongPress,
  onNodeSwipeStart,
  onNodeSwipe,
  onNodeSwipeEnd,
  loadMore,
  filterTreeNode,
  actionOnNodeClick,
  virtualListProps,
  animation = true,
  size = 'medium',
  searchValue = '',
  selectedKeys,
  defaultSelectedKeys,
  checkedKeys,
  defaultCheckedKeys,
  halfCheckedKeys,
  expandedKeys,
  defaultExpandedKeys,
  autoExpandParent,
  defaultExpandAll = true,
  defaultExpandSelected,
  defaultExpandChecked,
  multiple,
  checkStrictly,
  onlyCheckLeaf,
  checkedStrategy,
  onLoadError,
  onSelectedKeysChange,
  onCheckedKeysChange,
  onHalfCheckedKeysChange,
  onExpandedKeysChange,
  onSelect,
  onCheck,
  onExpand,
  renderTitle,
  renderIcon,
  renderSwitcherIcon,
  renderLoadingIcon,
  renderDragIcon,
  renderExtra,
  ellipsis,
  switcher,
  disableSelectActionOnly,
  className,
  style,
  ...attrs
}: TreeProps<T>) {
  const prefix = usePrefix('tree');
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  rootRef.current = root;
  const virtual = useRef<VirtualListRef>(null);
  const model = useTreeData({
    treeData: treeData ?? data,
    fieldNames,
    selectable,
    checkable,
    blockNode,
    showLine,
    draggable,
    loadMore: !!loadMore,
  });
  const state = useTreeState<T, Event>(
    {
      animateExpand: animation && !virtualListProps,
      selectedKeys,
      defaultSelectedKeys,
      checkedKeys,
      defaultCheckedKeys,
      halfCheckedKeys,
      expandedKeys,
      defaultExpandedKeys,
      autoExpandParent,
      defaultExpandAll,
      defaultExpandSelected,
      defaultExpandChecked,
      multiple,
      checkStrictly,
      onlyCheckLeaf,
      checkedStrategy,
      loadMore,
      onLoadError,
      events: {
        updateSelected: onSelectedKeysChange,
        updateChecked: onCheckedKeysChange,
        updateHalfChecked: onHalfCheckedKeysChange,
        updateExpanded: onExpandedKeysChange,
        select: onSelect,
        check: onCheck,
        expand: onExpand,
      },
    },
    model,
  );
  const visibleNodes = getVisibleTreeNodes({
    nodes: model.flattenTreeData,
    expandedKeys: state.expandedKeys,
    expandingKeys: state.expandingKeys,
    filter: filterTreeNode,
  });
  const keyboard = useTreeKeyboard({
    root: rootRef,
    state,
    visibleNodes,
    canLoadMore: !!loadMore,
    scrollToKey: (key) => virtual.current?.scrollTo({ key, align: 'auto' }),
  });
  const dragState = useTreeDrag({
    root,
    nodes: model.key2TreeNode,
    allowDrop,
    events: {
      start: onDragStart,
      end: onDragEnd,
      over: onDragOver,
      leave: onDragLeave,
      drop: onDrop,
    },
  });
  useImperativeHandle(ref, () => ({
    ...state.foundation,
    getSelectedNodes: () => state.foundation.nodes(state.selectedKeys),
    getExpandedNodes: () => state.foundation.nodes(state.expandedKeys),
    getHalfCheckedNodes: () => state.foundation.nodes(state.indeterminateKeys),
    getCheckedNodes: (options = {}) =>
      state.foundation.nodes([
        ...state.foundation.publicCheckedKeys(state.checkedKeys, options.checkedStrategy),
        ...(options.includeHalfChecked ? state.indeterminateKeys : []),
      ]),
    scrollIntoView: (options) => virtual.current?.scrollTo(options),
  }));
  const renderNode = (node: TreeModelNode<T>) => (
    <TreeNodeView
      key={`${searchValue}:${typeof node.key}:${node.key}`}
      node={node}
      activeKey={keyboard.activeKey}
      dragState={dragState}
      context={{
        ...state,
        treeProps: { actionOnNodeClick },
        onCheck: state.foundation.check,
        onSelect: state.foundation.select,
        onExpand: state.foundation.expand,
        onLoadMore: state.foundation.loadMore,
        onNodeKeydown: keyboard.onNodeKeydown,
        onNodeEvent: (name, key, event) => {
          const raw = model.key2TreeNode.get(key)?.treeNodeData;
          const handler =
            attrs[`onNode${name[0].toUpperCase()}${name.slice(1)}` as keyof NodeEvents<T>];
          if (raw) handler?.(raw, event);
        },
      }}
      gestures={{
        longPress: (event) => onNodeLongPress?.(node.treeNodeData, event),
        swipeStart: (event, direction) =>
          onNodeSwipeStart?.(node.treeNodeData, event, { direction }),
        swipe: (event, direction) => onNodeSwipe?.(node.treeNodeData, event, { direction }),
        swipeEnd: (event, direction) => onNodeSwipeEnd?.(node.treeNodeData, event, { direction }),
      }}
      {...{
        renderTitle,
        renderIcon,
        renderSwitcherIcon,
        renderLoadingIcon,
        renderDragIcon,
        renderExtra,
        ellipsis,
        switcher,
        disableSelectActionOnly,
      }}
      virtual={!!virtualListProps}
    />
  );
  return (
    <div
      {...Object.fromEntries(Object.entries(attrs).filter(([name]) => !name.startsWith('onNode')))}
      ref={setRoot}
      role="tree"
      style={{
        ...(virtualListProps && virtualListProps.height === undefined
          ? { height: '100%', minHeight: 0 }
          : {}),
        ...style,
      }}
      className={[
        prefix,
        `${prefix}-size-${size}`,
        checkable && `${prefix}-checkable`,
        showLine && `${prefix}-show-line`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {virtualListProps ? (
        <VirtualList
          {...virtualListProps}
          height={virtualListProps.height ?? '100%'}
          itemSize={
            virtualListProps.itemSize ??
            (virtualListProps.minItemSize === undefined
              ? { mini: 24, small: 28, medium: 32, large: 36 }[size]
              : undefined)
          }
          ref={virtual}
          items={visibleNodes}
          keyField="key"
          onScrollEnd={() => {
            virtualListProps.onScrollEnd?.();
            keyboard.focusPendingNode();
          }}
        >
          {({ item }) => renderNode(item)}
        </VirtualList>
      ) : (
        visibleNodes.map((node) => {
          const transitioning = state.expandingKeys.includes(node.key);
          const expanded = state.expandedKeys.includes(node.key);
          const children = transitioning
            ? (getTransitionTreeNodes({
                nodes: model.flattenTreeData,
                nodeKey: node.key,
                expandedKeys: state.expandedKeys,
                expanded,
                filter: filterTreeNode,
              }) ?? [])
            : [];
          return (
            <Fragment key={`${typeof node.key}:${node.key}`}>
              {renderNode(node)}
              {transitioning && (
                <TreeTransitionList
                  expanded={expanded}
                  empty={!children.length}
                  className={`${prefix}-node-list`}
                  onEnd={() => state.foundation.endExpand(node.key)}
                >
                  {children.map(renderNode)}
                </TreeTransitionList>
              )}
            </Fragment>
          );
        })
      )}
    </div>
  );
}
