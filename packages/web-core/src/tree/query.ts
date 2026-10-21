import type { TreeNodeKey } from './types.js';

export function getFlattenTreeData<N extends { children?: N[] }>(tree: N[]): N[] {
  const flattened: N[] = [];
  function visit(nodes: N[] | undefined) {
    nodes?.forEach((node) => {
      flattened.push(node);
      visit(node.children);
    });
  }
  visit(tree);
  return flattened;
}

export function getKey2TreeNode<N extends { key: TreeNodeKey }>(nodes: N[]) {
  const result = new Map<TreeNodeKey, N>();
  nodes.forEach((node) => result.set(node.key, node));
  return result;
}

export function isNodeSelectable(node: { selectable: boolean; disabled?: boolean }) {
  return node.selectable && !node.disabled;
}

export function isNodeExpandable<N>(node: { isLeaf?: boolean; children?: N[] }) {
  return !node.isLeaf && node.children;
}

export function isLeafNode(node: { isLeaf?: boolean; children?: unknown[] }) {
  return typeof node.isLeaf === 'boolean' ? node.isLeaf : !node.children;
}

export interface TreeQueryNode<T> {
  key: TreeNodeKey;
  treeNodeData: T;
  parentKey?: TreeNodeKey;
  pathParentKeys: TreeNodeKey[];
  children?: TreeQueryNode<T>[];
}

export function getDefaultExpandedKeys<N extends TreeQueryNode<unknown>>(options: {
  nodes: N[];
  key2TreeNode: ReadonlyMap<TreeNodeKey, N>;
  defaultExpandedKeys?: TreeNodeKey[];
  autoExpandParent: boolean;
  defaultExpandAll: boolean;
  defaultExpandSelected: boolean;
  defaultExpandChecked: boolean;
  selectedKeys: TreeNodeKey[];
  checkedKeys: TreeNodeKey[];
}): TreeNodeKey[] {
  const { key2TreeNode } = options;
  if (options.defaultExpandedKeys) {
    const result = new Set<TreeNodeKey>();
    options.defaultExpandedKeys.forEach((key) => {
      if (result.has(key)) return;
      const node = key2TreeNode.get(key);
      if (!node) return;
      [...(options.autoExpandParent ? node.pathParentKeys : []), key].forEach((key) =>
        result.add(key),
      );
    });
    return [...result];
  }
  if (options.defaultExpandAll)
    return options.nodes.filter((node) => node.children?.length).map((node) => node.key);
  const result = new Set<TreeNodeKey>();
  const addAncestors = (keys: TreeNodeKey[]) =>
    keys.forEach((key) => {
      key2TreeNode.get(key)?.pathParentKeys.forEach((parent) => result.add(parent));
    });
  if (options.defaultExpandSelected) addAncestors(options.selectedKeys);
  if (options.defaultExpandChecked) addAncestors(options.checkedKeys);
  return [...result];
}

export function getVisibleTreeNodes<T, N extends TreeQueryNode<T>>(options: {
  nodes: N[];
  expandedKeys: TreeNodeKey[];
  expandingKeys: TreeNodeKey[];
  filter?: (node: T) => boolean;
}): N[] {
  const expanded = new Set(options.expandedKeys);
  const expanding = new Set(options.expandingKeys);
  const filtered = options.nodes.filter((node) => {
    if (options.filter && !options.filter(node.treeNodeData)) return false;
    const visible =
      node.parentKey === undefined ||
      node.pathParentKeys?.every((key) => expanded.has(key) && !expanding.has(key));
    return visible;
  });
  const seen = new Set<TreeNodeKey>();
  return filtered.filter((node) => {
    if (seen.has(node.key)) return false;
    seen.add(node.key);
    return true;
  });
}

export function getPublicCheckedKeys<
  N extends { parentKey?: TreeNodeKey; children?: readonly unknown[] },
>(keys: TreeNodeKey[], strategy: 'all' | 'parent' | 'child', nodes: ReadonlyMap<TreeNodeKey, N>) {
  if (strategy === 'parent')
    return keys.filter((key) => {
      const node = nodes.get(key);
      return node && !(node.parentKey !== undefined && keys.includes(node.parentKey));
    });
  if (strategy === 'child') return keys.filter((key) => !nodes.get(key)?.children?.length);
  return [...keys];
}

export function getTransitionTreeNodes<T, N extends TreeQueryNode<T>>(options: {
  nodes?: N[];
  nodeKey: TreeNodeKey;
  expandedKeys: TreeNodeKey[];
  expanded: boolean | undefined;
  filter?: (node: T) => boolean;
}) {
  const expandedKeys = new Set(options.expandedKeys);
  const descendants = options.nodes?.filter(
    (node) =>
      node.pathParentKeys?.includes(options.nodeKey) &&
      (!options.filter || options.filter(node.treeNodeData)),
  );
  return descendants?.filter((node) => {
    if (options.expanded) return node.pathParentKeys?.every((key) => expandedKeys.has(key));
    const index = node.pathParentKeys.indexOf(options.nodeKey);
    return node.pathParentKeys.slice(index + 1).every((key) => expandedKeys.has(key));
  });
}
