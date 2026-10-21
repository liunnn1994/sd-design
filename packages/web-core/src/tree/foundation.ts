import type { TreeQueryNode } from './query.js';
import type { CheckNode, TreeNodeKey } from './types.js';

import { isArray } from '../_utils/is.js';
import { getCheckedStateByCheck, isNodeCheckable } from './check.js';
import { getPublicCheckedKeys, isLeafNode, isNodeExpandable, isNodeSelectable } from './query.js';

export interface TreeStateNode<T> extends CheckNode, TreeQueryNode<T> {
  selectable: boolean;
  isLeaf: boolean;
  children?: TreeStateNode<T>[];
}
interface TargetState<T, E> {
  node?: T;
  e?: E;
}
interface SelectState<T, E> extends TargetState<T, E> {
  selected?: boolean;
  selectedNodes: T[];
}
interface ExpandState<T, E> extends TargetState<T, E> {
  expanded?: boolean;
  expandedNodes: T[];
}
interface CheckState<T, E> extends TargetState<T, E> {
  checked?: boolean;
  checkedNodes: T[];
  halfCheckedKeys: TreeNodeKey[];
  halfCheckedNodes: T[];
}
export interface TreeAdapter<T, N extends TreeStateNode<T>, E> {
  getNodes: () => ReadonlyMap<TreeNodeKey, N>;
  getSelectedKeys: () => TreeNodeKey[];
  getCheckedKeys: () => TreeNodeKey[];
  getIndeterminateKeys: () => TreeNodeKey[];
  getExpandedKeys: () => TreeNodeKey[];
  getExpandingKeys: () => TreeNodeKey[];
  getLoadingKeys: () => TreeNodeKey[];
  getMultiple: () => boolean;
  getCheckStrictly: () => boolean;
  getCheckedStrategy: () => 'all' | 'parent' | 'child';
  getAnimateExpand: () => boolean;
  getLoadMore: () => ((node: T) => Promise<void>) | undefined;
  setSelectedKeys: (keys: TreeNodeKey[]) => void;
  setCheckedState: (
    keys: TreeNodeKey[],
    halfKeys: TreeNodeKey[],
    reinitialize?: boolean,
  ) => TreeNodeKey[][];
  setExpandedKeys: (keys: TreeNodeKey[]) => void;
  setExpandingKeys: (keys: TreeNodeKey[]) => void;
  setLoadingKeys: (keys: TreeNodeKey[]) => void;
  onLoadError: (error: unknown) => void;
  events: {
    updateSelected: (keys: TreeNodeKey[]) => void;
    select: (keys: TreeNodeKey[], data: SelectState<T, E>) => void;
    updateChecked: (keys: TreeNodeKey[]) => void;
    updateHalfChecked: (keys: TreeNodeKey[]) => void;
    check: (keys: TreeNodeKey[], data: CheckState<T, E>) => void;
    updateExpanded: (keys: TreeNodeKey[]) => void;
    expand: (keys: TreeNodeKey[], data: ExpandState<T, E>) => void;
  };
}

/** Adapters own controlled state; every action reads its current authoritative values. */
export function createTreeFoundation<T, N extends TreeStateNode<T>, E = unknown>(
  adapter: TreeAdapter<T, N, E>,
) {
  function nodes(keys: TreeNodeKey[]): T[] {
    return keys
      .map((key) => adapter.getNodes().get(key)?.treeNodeData || undefined)
      .filter((node): node is NonNullable<T> => Boolean(node));
  }
  function publicCheckedKeys(keys: TreeNodeKey[], strategy = adapter.getCheckedStrategy()) {
    return getPublicCheckedKeys(keys, strategy, adapter.getNodes());
  }
  function emitCheck(options: {
    targetKey?: TreeNodeKey;
    targetChecked?: boolean;
    newCheckedKeys: TreeNodeKey[];
    newIndeterminateKeys: TreeNodeKey[];
    event?: E;
  }) {
    const targetNode =
      options.targetKey === undefined ? undefined : adapter.getNodes().get(options.targetKey);
    const publicKeys = publicCheckedKeys(options.newCheckedKeys);
    adapter.events.updateChecked(publicKeys);
    adapter.events.updateHalfChecked(options.newIndeterminateKeys);
    adapter.events.check(publicKeys, {
      checked: options.targetChecked,
      node: targetNode?.treeNodeData,
      checkedNodes: nodes(publicKeys),
      halfCheckedKeys: options.newIndeterminateKeys,
      halfCheckedNodes: nodes(options.newIndeterminateKeys),
      e: options.event,
    });
  }
  function emitSelect(options: {
    targetKey?: TreeNodeKey;
    targetSelected?: boolean;
    newSelectedKeys: TreeNodeKey[];
    event?: E;
  }) {
    const targetNode =
      options.targetKey === undefined ? undefined : adapter.getNodes().get(options.targetKey);
    adapter.events.updateSelected(options.newSelectedKeys);
    adapter.events.select(options.newSelectedKeys, {
      selected: options.targetSelected,
      node: targetNode?.treeNodeData,
      selectedNodes: nodes(options.newSelectedKeys),
      e: options.event,
    });
  }
  function emitExpand(options: {
    targetKey?: TreeNodeKey;
    targetExpanded?: boolean;
    newExpandedKeys: TreeNodeKey[];
    event?: E;
  }) {
    const targetNode =
      options.targetKey === undefined ? undefined : adapter.getNodes().get(options.targetKey);
    adapter.events.expand(options.newExpandedKeys, {
      expanded: options.targetExpanded,
      node: targetNode?.treeNodeData,
      expandedNodes: nodes(options.newExpandedKeys),
      e: options.event,
    });
    adapter.events.updateExpanded(options.newExpandedKeys);
  }
  function setCheckedKeys(keys: TreeNodeKey[]) {
    const [newCheckedKeys, newIndeterminateKeys] = adapter.setCheckedState(keys, [], true);
    emitCheck({ newCheckedKeys, newIndeterminateKeys });
  }
  function setSelectedKeys(keys: TreeNodeKey[]) {
    const nextKeys = !adapter.getMultiple() && keys.length > 1 ? [keys[0]] : keys;
    adapter.setSelectedKeys(nextKeys);
    emitSelect({ newSelectedKeys: nextKeys });
  }
  function setExpandedKeys(keys: TreeNodeKey[]) {
    adapter.setExpandingKeys([]);
    adapter.setExpandedKeys(keys);
    emitExpand({ newExpandedKeys: keys });
  }
  function checkNodes(keys: TreeNodeKey[], checked: boolean, targetKey?: TreeNodeKey) {
    if (!keys.length) return;
    let nextKeys = [...adapter.getCheckedKeys()];
    let nextHalfKeys = [...adapter.getIndeterminateKeys()];
    keys.forEach((key) => {
      const node = adapter.getNodes().get(key);
      if (node)
        [nextKeys, nextHalfKeys] = getCheckedStateByCheck({
          node,
          checked,
          checkedKeys: [...nextKeys],
          indeterminateKeys: [...nextHalfKeys],
          checkStrictly: adapter.getCheckStrictly(),
        });
    });
    adapter.setCheckedState(nextKeys, nextHalfKeys);
    emitCheck({
      targetKey,
      targetChecked: targetKey === undefined ? undefined : checked,
      newCheckedKeys: nextKeys,
      newIndeterminateKeys: nextHalfKeys,
    });
  }
  function selectNodes(keys: TreeNodeKey[], selected: boolean, targetKey?: TreeNodeKey) {
    if (!keys.length) return;
    let nextKeys: TreeNodeKey[];
    if (adapter.getMultiple()) {
      const nextSet = new Set(adapter.getSelectedKeys());
      keys.forEach((key) => {
        if (selected) nextSet.add(key);
        else nextSet.delete(key);
      });
      nextKeys = [...nextSet];
    } else nextKeys = selected ? [keys[0]] : [];
    adapter.setSelectedKeys(nextKeys);
    emitSelect({
      targetKey,
      targetSelected: targetKey === undefined ? undefined : selected,
      newSelectedKeys: nextKeys,
    });
  }
  function endExpand(key: TreeNodeKey) {
    const keys = adapter.getExpandingKeys();
    const index = keys.indexOf(key);
    if (index > -1) {
      const nextKeys = [...keys];
      nextKeys.splice(index, 1);
      adapter.setExpandingKeys(nextKeys);
    }
  }
  function expandNodes(keys: TreeNodeKey[], expanded: boolean, targetKey?: TreeNodeKey) {
    const nextSet = new Set(adapter.getExpandedKeys());
    keys.forEach((key) => {
      if (expanded) nextSet.add(key);
      else nextSet.delete(key);
      endExpand(key);
    });
    const nextKeys = [...nextSet];
    adapter.setExpandedKeys(nextKeys);
    emitExpand({
      targetKey,
      targetExpanded: targetKey === undefined ? undefined : expanded,
      newExpandedKeys: nextKeys,
    });
  }
  function check(checked: boolean, key: TreeNodeKey, event?: E) {
    const node = adapter.getNodes().get(key);
    if (!node) return;
    const [newCheckedKeys, newIndeterminateKeys] = getCheckedStateByCheck({
      node,
      checked,
      checkedKeys: adapter.getCheckedKeys(),
      indeterminateKeys: adapter.getIndeterminateKeys(),
      checkStrictly: adapter.getCheckStrictly(),
    });
    adapter.setCheckedState(newCheckedKeys, newIndeterminateKeys);
    emitCheck({
      targetKey: key,
      targetChecked: checked,
      newCheckedKeys,
      newIndeterminateKeys,
      event,
    });
  }
  function select(key: TreeNodeKey, event: E) {
    if (!adapter.getNodes().get(key)) return;
    let nextKeys: TreeNodeKey[];
    let selected: boolean;
    if (adapter.getMultiple()) {
      const nextSet = new Set(adapter.getSelectedKeys());
      selected = !nextSet.has(key);
      if (selected) nextSet.add(key);
      else nextSet.delete(key);
      nextKeys = [...nextSet];
    } else {
      selected = true;
      nextKeys = [key];
    }
    adapter.setSelectedKeys(nextKeys);
    emitSelect({ targetKey: key, targetSelected: selected, newSelectedKeys: nextKeys, event });
  }
  function expand(expanded: boolean, key: TreeNodeKey, event?: E) {
    if (adapter.getExpandingKeys().includes(key) || !adapter.getNodes().get(key)) return;
    const nextSet = new Set(adapter.getExpandedKeys());
    if (expanded) nextSet.add(key);
    else nextSet.delete(key);
    const nextKeys = [...nextSet];
    adapter.setExpandedKeys(nextKeys);
    if (adapter.getAnimateExpand()) adapter.setExpandingKeys([...adapter.getExpandingKeys(), key]);
    emitExpand({ targetKey: key, targetExpanded: expanded, newExpandedKeys: nextKeys, event });
  }
  async function loadMore(key: TreeNodeKey) {
    if (typeof adapter.getLoadMore() !== 'function' || adapter.getLoadingKeys().includes(key))
      return;
    const node = adapter.getNodes().get(key);
    if (!node) return;
    adapter.setLoadingKeys([...new Set([...adapter.getLoadingKeys(), key])]);
    try {
      await adapter.getLoadMore()!(node.treeNodeData);
      adapter.setLoadingKeys(adapter.getLoadingKeys().filter((value) => value !== key));
      expand(true, key);
      if (adapter.getCheckedKeys().includes(key)) check(true, key);
    } catch (error) {
      adapter.setLoadingKeys(adapter.getLoadingKeys().filter((value) => value !== key));
      adapter.onLoadError(error);
    }
  }
  function checkAll(checked = true) {
    setCheckedKeys(
      checked
        ? [...adapter.getNodes()].filter(([, node]) => isNodeCheckable(node)).map(([key]) => key)
        : [],
    );
  }
  function checkNode(key: TreeNodeKey | TreeNodeKey[], checked = true, onlyCheckLeaf = false) {
    const batch = isArray(key);
    const keys = (batch ? key : [key]).filter((key) => {
      const node = adapter.getNodes().get(key);
      return (
        node &&
        isNodeCheckable(node) &&
        (adapter.getCheckStrictly() || !onlyCheckLeaf || isLeafNode(node))
      );
    });
    checkNodes(keys, checked, batch ? undefined : key);
  }
  function selectAll(selected = true) {
    setSelectedKeys(
      selected
        ? [...adapter.getNodes()].filter(([, node]) => isNodeSelectable(node)).map(([key]) => key)
        : [],
    );
  }
  function selectNode(key: TreeNodeKey | TreeNodeKey[], selected = true) {
    const batch = isArray(key);
    const keys = (batch ? key : [key]).filter((key) => {
      const node = adapter.getNodes().get(key);
      return node && isNodeSelectable(node);
    });
    selectNodes(keys, selected, batch ? undefined : key);
  }
  function expandAll(expanded = true) {
    setExpandedKeys(
      expanded
        ? [...adapter.getNodes()].filter(([, node]) => isNodeExpandable(node)).map(([key]) => key)
        : [],
    );
  }
  function expandNode(key: TreeNodeKey | TreeNodeKey[], expanded = true) {
    const batch = isArray(key);
    const keys = (batch ? key : [key]).filter((key) => {
      const node = adapter.getNodes().get(key);
      return node && isNodeExpandable(node);
    });
    expandNodes(keys, expanded, batch ? undefined : key);
  }
  function toggleCheck(key: TreeNodeKey, event?: E) {
    const checked = !adapter.getCheckedKeys().includes(key);
    const node = adapter.getNodes().get(key);
    if (node && isNodeCheckable(node)) check(checked, key, event);
  }
  return {
    nodes,
    publicCheckedKeys,
    setCheckedKeys,
    setSelectedKeys,
    setExpandedKeys,
    checkNodes,
    selectNodes,
    expandNodes,
    check,
    select,
    expand,
    endExpand,
    loadMore,
    checkAll,
    checkNode,
    selectAll,
    selectNode,
    expandAll,
    expandNode,
    toggleCheck,
  };
}
