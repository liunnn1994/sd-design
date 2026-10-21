import * as query from '@sdata/web-core/tree/query';

import type { Key2TreeNode, Node } from '../interface';

export const getFlattenTreeData: (tree: Node[]) => Node[] = query.getFlattenTreeData;
export const getKey2TreeNode: (nodes: Node[]) => Key2TreeNode = query.getKey2TreeNode;
export const isNodeSelectable: (node: Node) => boolean = query.isNodeSelectable;
export const isNodeExpandable: (node: Node) => false | Node[] | undefined = query.isNodeExpandable;
export const isLeafNode: (node: Node) => boolean = query.isLeafNode;
