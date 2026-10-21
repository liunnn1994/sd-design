import type { TreeQueryNode } from '../tree/query.js';
import type { TreeNodeKey } from '../tree/types.js';

export function matchTreeNodeKey<T extends Record<string, unknown>>(
  node: T,
  keyword: string,
  keyField: keyof T,
) {
  const key = node[keyField];
  return key !== undefined && String(key).indexOf(keyword) > -1;
}

export function getFilteredTreeKeys<T, N extends TreeQueryNode<T>>(
  nodes: N[],
  keyword: string,
  method: (keyword: string, node: T) => boolean,
) {
  const hits = nodes.filter((node) => method(keyword, node.treeNodeData));
  const keys = new Set<TreeNodeKey>();
  hits.forEach((node) => {
    keys.add(node.key);
    node.pathParentKeys.forEach((key) => keys.add(key));
  });
  return keys;
}
