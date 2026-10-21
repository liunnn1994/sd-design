import type { TreeQueryNode } from './query.js';
import type { TreeNodeKey } from './types.js';

import { isFunction } from '../_utils/is.js';

export type TreeDropPosition = -1 | 0 | 1;
export interface TreeDragState {
  sourceKey: TreeNodeKey | undefined;
  targetKey: TreeNodeKey | undefined;
  position: TreeDropPosition;
  allowed: boolean;
}
export interface TreeDragAdapter<T, N extends TreeQueryNode<T>, E> {
  state: TreeDragState;
  dragNode: { value: N | undefined };
  getNodes: () => ReadonlyMap<TreeNodeKey, N>;
  allowDrop: {
    readonly value:
      | ((options: { dropNode: T; dropPosition: TreeDropPosition }) => boolean)
      | undefined;
  };
  events: {
    start: (event: E, node: T) => void;
    end: (event: E, node: T) => void;
    over: (event: E, node: T) => void;
    leave: (event: E, node: T) => void;
    drop: (data: { e: E; dragNode: T; dropNode: T; dropPosition: number }) => void;
  };
}

export function createTreeDragFoundation<T, N extends TreeQueryNode<T>, E>(
  adapter: TreeDragAdapter<T, N, E>,
) {
  const { state, dragNode } = adapter;
  function allowDrop(key: TreeNodeKey, dropPosition: TreeDropPosition) {
    const node = adapter.getNodes().get(key);
    if (node && isFunction(adapter.allowDrop.value)) {
      return !!adapter.allowDrop.value({ dropNode: node.treeNodeData, dropPosition });
    }
    return true;
  }
  function onDragStart(key: TreeNodeKey, event: E) {
    const node = adapter.getNodes().get(key);
    dragNode.value = node;
    if (node) adapter.events.start(event, node.treeNodeData);
  }
  function onDragEnd(key: TreeNodeKey, event: E) {
    const node = adapter.getNodes().get(key);
    dragNode.value = undefined;
    if (node) adapter.events.end(event, node.treeNodeData);
  }
  function onDragOver(key: TreeNodeKey, event: E) {
    const node = adapter.getNodes().get(key);
    if (node) adapter.events.over(event, node.treeNodeData);
  }
  function onDragLeave(key: TreeNodeKey, event: E) {
    const node = adapter.getNodes().get(key);
    if (node) adapter.events.leave(event, node.treeNodeData);
  }
  function onDrop(key: TreeNodeKey, dropPosition: number, event: E) {
    const node = adapter.getNodes().get(key);
    if (
      dragNode.value &&
      node &&
      !(node.key === dragNode.value.key || node.pathParentKeys.includes(dragNode.value.key))
    ) {
      adapter.events.drop({
        e: event,
        dragNode: dragNode.value.treeNodeData,
        dropNode: node.treeNodeData,
        dropPosition,
      });
    }
  }
  function start(node: N | undefined, event: E) {
    if (!node) return;
    state.sourceKey = node.key;
    onDragStart(node.key, event);
  }
  function over(
    node: N | undefined,
    event: E,
    getGeometry: (() => { offset: number; height: number }) | undefined,
  ) {
    if (state.targetKey !== undefined && state.targetKey !== node?.key) {
      onDragLeave(state.targetKey, event);
    }
    state.targetKey = node?.key;
    state.allowed = false;
    if (!node || !dragNode.value || !getGeometry) return;
    const { offset, height } = getGeometry();
    state.position = offset < height / 4 ? -1 : offset > (height * 3) / 4 ? 1 : 0;
    state.allowed =
      node.key !== dragNode.value.key &&
      !node.pathParentKeys.includes(dragNode.value.key) &&
      allowDrop(node.key, state.position);
    onDragOver(node.key, event);
  }
  function end(event: E, cancelled: boolean) {
    if (!cancelled && state.allowed && state.targetKey !== undefined) {
      onDrop(state.targetKey, state.position, event);
    }
    if (state.targetKey !== undefined) onDragLeave(state.targetKey, event);
    if (state.sourceKey !== undefined) onDragEnd(state.sourceKey, event);
    state.sourceKey = undefined;
    state.targetKey = undefined;
    state.allowed = false;
    state.position = 0;
  }
  return { allowDrop, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, start, over, end };
}
