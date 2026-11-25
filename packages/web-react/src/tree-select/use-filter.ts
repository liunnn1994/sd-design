import type { TreeFieldNames, TreeModelNode, TreeNodeKey } from '@sdata/web-core/tree/types';

import { getFilteredTreeKeys, matchTreeNodeKey } from '@sdata/web-core/tree-select/filter';
import { useEffect, useState } from 'react';

import type { TreeNodeData } from '../tree/node.js';

export function useTreeSelectFilter<T extends TreeNodeData>(props: {
  searchValue: string;
  nodes: TreeModelNode<T>[];
  fieldNames?: TreeFieldNames | undefined;
  filterMethod?: ((keyword: string, node: T) => boolean) | undefined;
  disableFilter?: boolean | undefined;
}) {
  const [keys, setKeys] = useState<Set<TreeNodeKey>>();
  const keyField = props.fieldNames?.key ?? 'key';
  useEffect(() => {
    if (props.disableFilter) {
      setKeys(undefined);
      return;
    }
    const timer = setTimeout(() => {
      const next = getFilteredTreeKeys(
        props.nodes,
        props.searchValue,
        props.filterMethod ?? ((keyword, node) => matchTreeNodeKey(node, keyword, keyField)),
      );
      setKeys((old) =>
        old?.size === next.size && [...next].every((key) => old.has(key)) ? old : next,
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [props.searchValue, props.nodes, props.disableFilter, props.filterMethod, keyField]);
  return {
    isEmptyFilterResult: !props.disableFilter && !!props.searchValue && keys?.size === 0,
    filterTreeNode: props.disableFilter
      ? undefined
      : (node: T) => !props.searchValue || (keys?.has(node[keyField] as TreeNodeKey) ?? false),
  };
}
