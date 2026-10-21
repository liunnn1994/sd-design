import type { TreeNodeKey } from './types.js';

type NavigationNode = {
  key: TreeNodeKey;
  isLeaf: boolean;
  children?: { key: TreeNodeKey }[];
  pathParentKeys: TreeNodeKey[];
  checkable?: boolean;
  disableCheckbox?: boolean;
  disabled?: boolean;
  selectable: boolean;
};
export type TreeKeyAction =
  | { type: 'prevent' }
  | { type: 'focus' | 'load' | 'check' | 'select'; key: TreeNodeKey }
  | { type: 'expand'; key: TreeNodeKey; expanded: boolean };

export function getActiveTreeKey(
  activeKey: TreeNodeKey | undefined,
  selectedKeys: TreeNodeKey[],
  nodes: { key: TreeNodeKey }[],
) {
  if (activeKey !== undefined && nodes.some((node) => node.key === activeKey)) return activeKey;
  const selected = selectedKeys.find((key) => nodes.some((node) => node.key === key));
  return selected !== undefined ? selected : nodes[0]?.key;
}

/** Plan tree navigation; the view adapter performs focus, scrolling and preventDefault. */
export function getTreeKeyAction(options: {
  key: TreeNodeKey;
  eventKey: string;
  visibleNodes: NavigationNode[];
  expandedKeys: TreeNodeKey[];
  canLoadMore: boolean;
}): TreeKeyAction | undefined {
  const { key, eventKey, visibleNodes: nodes } = options;
  const index = nodes.findIndex((node) => node.key === key);
  if (index === -1) return;
  const node = nodes[index];
  const expanded = options.expandedKeys.includes(key);
  const hasChildren = !node.isLeaf && Boolean(node.children?.length);
  const focus = (target: { key: TreeNodeKey } | undefined): TreeKeyAction =>
    target ? { type: 'focus', key: target.key } : { type: 'prevent' };
  switch (eventKey) {
    case 'ArrowDown':
      return focus(nodes[index + 1]);
    case 'ArrowUp':
      return focus(nodes[index - 1]);
    case 'Home':
      return focus(nodes[0]);
    case 'End':
      return focus(nodes.at(-1));
    case 'ArrowRight':
      if (!node.isLeaf && !expanded) {
        return !node.children?.length && options.canLoadMore
          ? { type: 'load', key }
          : { type: 'expand', key, expanded: true };
      }
      if (hasChildren && expanded) return focus(node.children?.[0]);
      return { type: 'prevent' };
    case 'ArrowLeft':
      if (hasChildren && expanded) return { type: 'expand', key, expanded: false };
      return node.pathParentKeys.length
        ? { type: 'focus', key: node.pathParentKeys.at(-1)! }
        : { type: 'prevent' };
    case 'Enter':
    case ' ':
      if (node.checkable && !node.disableCheckbox && !node.disabled) return { type: 'check', key };
      if (node.selectable && !node.disabled) return { type: 'select', key };
      return;
    default:
      return;
  }
}
