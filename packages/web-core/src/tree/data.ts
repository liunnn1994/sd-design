import type {
  TreeData,
  TreeNodeKey,
  TreeModelNode,
  TreeModelOptions,
  TreeCheckable,
  TreeNodeProps,
  TreeFieldNames,
} from './types.js';

import { isFunction, isUndefined } from '../_utils/is.js';
import { omit } from '../_utils/omit.js';

interface NodeOptions<T extends TreeData> {
  treeNodeData: T;
  treeProps: TreeModelOptions<T>;
  keyCache: WeakMap<T, TreeNodeKey[]>;
  keyIndex: number;
  parentNode?: TreeModelNode<T>;
  isTail?: boolean;
}

export const generateKey = (() => {
  let i = 0;

  return () => {
    i += 1;
    return `__sd_tree${i}`;
  };
})();

function getBoolean(val1: boolean | undefined, val2: boolean | undefined) {
  return !!(isUndefined(val1) ? val2 : val1);
}

function mapObject<T extends TreeData>(obj: T, nameMap?: TreeFieldNames): T {
  const _obj: Record<string, unknown> = { ...obj };

  if (nameMap) {
    const names = Object.keys(nameMap);
    names.forEach((name) => {
      const sourceName = nameMap[name as keyof typeof nameMap] as keyof T;

      if (sourceName !== name) {
        _obj[name] = obj[sourceName];
        delete _obj[sourceName as string];
      }
    });
  }

  return _obj as T;
}

function getEnableResult<T extends TreeData>({
  subEnable,
  superEnable,
  isLeaf,
  treeNodeData,
  level,
}: {
  subEnable: boolean | undefined;
  superEnable: TreeCheckable<T> | undefined;
  isLeaf: boolean;
  level: number;
  treeNodeData: T;
}) {
  if (!isUndefined(subEnable)) return subEnable;
  if (isFunction(superEnable)) {
    return superEnable(treeNodeData, { isLeaf, level });
  }
  return superEnable ?? false;
}

function generateNode<T extends TreeData>(options: NodeOptions<T>): TreeModelNode<T> {
  const { treeNodeData, parentNode, isTail = true, treeProps, keyCache, keyIndex } = options;
  const { fieldNames } = treeProps || {};

  const mappedData = mapObject(treeNodeData, fieldNames);
  const isLeaf = treeProps.loadMore ? !!mappedData.isLeaf : !mappedData.children?.length;
  const level = parentNode ? parentNode.level + 1 : 0;

  const cachedKeys = keyCache.get(treeNodeData) ?? [];
  const key = mappedData.key ?? cachedKeys[keyIndex] ?? generateKey();
  if (isUndefined(mappedData.key)) {
    cachedKeys[keyIndex] = key;
    keyCache.set(treeNodeData, cachedKeys);
  }

  const treeNodeProps = {
    ...omit(mappedData, ['children']),
    key,
    selectable: getEnableResult({
      subEnable: mappedData.selectable,
      superEnable: treeProps?.selectable,
      isLeaf,
      level,
      treeNodeData,
    }),
    disabled: !!mappedData.disabled,
    disableCheckbox: !!mappedData.disableCheckbox,
    checkable: getEnableResult({
      subEnable: mappedData.checkable,
      superEnable: treeProps?.checkable,
      isLeaf,
      level,
      treeNodeData,
    }),
    isLeaf,
    isTail,
    blockNode: !!treeProps?.blockNode,
    showLine: !!treeProps?.showLine,
    level,
    // showLine 模式下是否显示缩进线。
    // 如果父节点是其所在层级的最后一个节点，那么所有的子节点（包括孙子节点等）在父节点所在层级的缩进格都不显示缩进线。
    lineless: parentNode ? [...parentNode.lineless, parentNode.isTail] : [],
    draggable: getBoolean(mappedData.draggable, treeProps?.draggable),
  } as TreeNodeProps<T>;

  const node = {
    ...treeNodeProps,
    treeNodeProps,
    treeNodeData,
    parent: parentNode,
    parentKey: parentNode?.key,
    pathParentKeys: parentNode ? [...parentNode.pathParentKeys, parentNode.key] : [],
  };

  return node;
}

export function generateTreeData<T extends TreeData>(
  treeData: T[],
  treeProps: TreeModelOptions<T>,
  keyCache = new WeakMap<T, TreeNodeKey[]>(),
) {
  const nodeOccurrences = new WeakMap<T, number>();
  function preOrder(tree: T[] | undefined, parentNode?: TreeModelNode<T>) {
    if (!tree) return undefined;

    const { fieldNames } = treeProps;
    const nodes: TreeModelNode<T>[] = [];
    tree.forEach((treeNodeData, index) => {
      const keyIndex = nodeOccurrences.get(treeNodeData) ?? 0;
      nodeOccurrences.set(treeNodeData, keyIndex + 1);
      const node = generateNode({
        treeNodeData,
        treeProps,
        keyCache,
        keyIndex,
        parentNode,
        isTail: index === tree.length - 1,
      });

      node.children = preOrder(
        treeNodeData[(fieldNames?.children || 'children') as keyof T] as T[] | undefined,
        node,
      );
      nodes.push(node);
    });

    return nodes;
  }

  return preOrder(treeData) as TreeModelNode<T>[];
}
