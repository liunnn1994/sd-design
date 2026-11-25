import type { TreeAdapter } from '@sdata/web-core/tree/foundation';
import type { TreeData, TreeModelNode, TreeNodeKey } from '@sdata/web-core/tree/types';

import { createTreeFoundation } from '@sdata/web-core/tree/foundation';
import { getDefaultExpandedKeys } from '@sdata/web-core/tree/query';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { TreeCheckedStateProps } from './use-checked-state.js';

import { useTreeCheckedState } from './use-checked-state.js';

export interface TreeStateProps<T extends TreeData, E> extends Omit<
  TreeCheckedStateProps,
  'key2TreeNode' | 'checkStrictly' | 'onlyCheckLeaf'
> {
  selectedKeys?: TreeNodeKey[] | undefined;
  defaultSelectedKeys?: TreeNodeKey[] | undefined;
  expandedKeys?: TreeNodeKey[] | undefined;
  defaultExpandedKeys?: TreeNodeKey[] | undefined;
  autoExpandParent?: boolean | undefined;
  defaultExpandAll?: boolean;
  defaultExpandSelected?: boolean | undefined;
  defaultExpandChecked?: boolean | undefined;
  multiple?: boolean | undefined;
  checkStrictly?: boolean | undefined;
  onlyCheckLeaf?: boolean | undefined;
  checkedStrategy?: 'all' | 'parent' | 'child' | undefined;
  animateExpand?: boolean;
  loadMore?: ((node: T) => Promise<void>) | undefined;
  onLoadError?: ((error: unknown) => void) | undefined;
  events?: Partial<TreeAdapter<T, TreeModelNode<T>, E>['events']>;
}

export function useTreeState<T extends TreeData, E>(
  props: TreeStateProps<T, E>,
  data: { flattenTreeData: TreeModelNode<T>[]; key2TreeNode: Map<TreeNodeKey, TreeModelNode<T>> },
) {
  const checked = useTreeCheckedState({
    ...props,
    key2TreeNode: data.key2TreeNode,
    checkStrictly: !!props.checkStrictly,
    onlyCheckLeaf: !!props.onlyCheckLeaf,
  });
  const current = useRef({ props, data, checked });
  current.current = { props, data, checked };
  const [, render] = useReducer((version: number) => version + 1, 0);
  const commits = useRef<(() => void)[]>([]);
  useLayoutEffect(() => {
    commits.current.splice(0).forEach((resolve) => resolve());
  });
  const [local] = useState(() => ({
    selected: props.selectedKeys ?? props.defaultSelectedKeys ?? [],
    expanded:
      props.expandedKeys ??
      getDefaultExpandedKeys({
        nodes: data.flattenTreeData,
        key2TreeNode: data.key2TreeNode,
        defaultExpandedKeys: props.defaultExpandedKeys,
        autoExpandParent: props.autoExpandParent ?? true,
        defaultExpandAll: !!props.defaultExpandAll,
        defaultExpandSelected: !!props.defaultExpandSelected,
        defaultExpandChecked: !!props.defaultExpandChecked,
        selectedKeys: props.selectedKeys ?? props.defaultSelectedKeys ?? [],
        get checkedKeys() {
          return current.current.checked.checkedKeys;
        },
      }),
    expanding: [] as TreeNodeKey[],
    loading: [] as TreeNodeKey[],
  }));
  const previous = useRef({ selected: props.selectedKeys, expanded: props.expandedKeys });
  if (previous.current.selected !== undefined && props.selectedKeys === undefined)
    local.selected = [];
  if (previous.current.expanded !== undefined && props.expandedKeys === undefined)
    local.expanded = [];
  previous.current = { selected: props.selectedKeys, expanded: props.expandedKeys };
  const [foundation] = useState(() =>
    createTreeFoundation<T, TreeModelNode<T>, E>({
      getNodes: () => current.current.data.key2TreeNode,
      getSelectedKeys: () => current.current.props.selectedKeys ?? local.selected,
      getCheckedKeys: () => current.current.checked.checkedKeys,
      getIndeterminateKeys: () => current.current.checked.indeterminateKeys,
      getExpandedKeys: () => current.current.props.expandedKeys ?? local.expanded,
      getExpandingKeys: () => local.expanding,
      getLoadingKeys: () => local.loading,
      getMultiple: () => !!current.current.props.multiple,
      getCheckStrictly: () => !!current.current.props.checkStrictly,
      getCheckedStrategy: () => current.current.props.checkedStrategy ?? 'all',
      getAnimateExpand: () => !!current.current.props.animateExpand,
      getLoadMore: () => current.current.props.loadMore,
      afterLoad: () =>
        new Promise<void>((resolve) => {
          commits.current.push(resolve);
          render();
        }),
      setSelectedKeys: (keys) => {
        local.selected = keys;
        render();
      },
      setCheckedState: (...args) => current.current.checked.setCheckedState(...args),
      setExpandedKeys: (keys) => {
        local.expanded = keys;
        render();
      },
      setExpandingKeys: (keys) => {
        local.expanding = keys;
        render();
      },
      setLoadingKeys: (keys) => {
        local.loading = keys;
        render();
      },
      onLoadError: (error) => {
        if (current.current.props.onLoadError) current.current.props.onLoadError(error);
        // oxlint-disable-next-line no-console
        else console.error('[tree]load data error: ', error);
      },
      events: {
        updateSelected: (...args) => current.current.props.events?.updateSelected?.(...args),
        select: (...args) => current.current.props.events?.select?.(...args),
        updateChecked: (...args) => current.current.props.events?.updateChecked?.(...args),
        updateHalfChecked: (...args) => current.current.props.events?.updateHalfChecked?.(...args),
        check: (...args) => current.current.props.events?.check?.(...args),
        updateExpanded: (...args) => current.current.props.events?.updateExpanded?.(...args),
        expand: (...args) => current.current.props.events?.expand?.(...args),
      },
    }),
  );
  useLayoutEffect(
    () => () => {
      foundation.cancelPendingLoads();
      commits.current.splice(0).forEach((resolve) => resolve());
    },
    [foundation],
  );
  return {
    foundation,
    get selectedKeys() {
      return current.current.props.selectedKeys ?? local.selected;
    },
    get expandedKeys() {
      return current.current.props.expandedKeys ?? local.expanded;
    },
    get expandingKeys() {
      return local.expanding;
    },
    get loadingKeys() {
      return local.loading;
    },
    get checkedKeys() {
      return current.current.checked.checkedKeys;
    },
    get indeterminateKeys() {
      return current.current.checked.indeterminateKeys;
    },
  };
}
