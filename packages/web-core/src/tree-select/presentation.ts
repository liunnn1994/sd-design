import type { TreeNodeKey } from '../tree/types.js';
import type { LabelValue } from './types.js';

import { isFunction, isUndefined } from '../_utils/is.js';

export function isTreeSelectSelectable<T, Info extends { isLeaf: boolean }>(
  selectable: { readonly value: boolean | 'leaf' | ((node: T, info: Info) => boolean) | undefined },
  node: T,
  info: Info,
) {
  if (selectable.value === 'leaf') return info.isLeaf;
  if (isFunction(selectable.value)) return selectable.value(node, info);
  return selectable.value ?? false;
}

export function getTreeSelectViewValues<N extends { treeNodeData: unknown }>(state: {
  readonly selectedValues: LabelValue[] | undefined;
  readonly multiple: boolean;
  readonly disabled: boolean;
  readonly nodes: ReadonlyMap<TreeNodeKey, N>;
  isNodeClosable: (node: N) => boolean;
}): Array<LabelValue & { option: N['treeNodeData'] | undefined; closable?: boolean }> {
  if (isUndefined(state.selectedValues)) return [];
  if (state.multiple && !state.disabled) {
    return state.selectedValues.map((item) => {
      const node = state.nodes.get(item.value);
      return { ...item, option: node?.treeNodeData, closable: !node || state.isNodeClosable(node) };
    });
  }
  return state.selectedValues.map((item) => {
    const node = state.nodes.get(item.value);
    return { ...item, option: node?.treeNodeData };
  });
}

export function getTreeSelectTriggerValue(state: {
  readonly labelInValue: boolean;
  readonly selectedValues: LabelValue[] | undefined;
  readonly selectedKeys: TreeNodeKey[] | undefined;
  readonly multiple: boolean;
}) {
  const values = state.labelInValue ? state.selectedValues : state.selectedKeys;
  return state.multiple ? values : values?.[0];
}

export function getTreeSelectDisplayValue(state: {
  readonly values: readonly { label?: unknown }[];
  readonly multiple: boolean;
}) {
  const labels = state.values.map((item) => String(item.label));
  return state.multiple ? labels : (labels[0] ?? '');
}

export function getTreeSelectSelectedOptions<T>(
  values: readonly { option?: T | undefined }[],
): T[] {
  return values.map((item) => item.option).filter((option): option is T => Boolean(option));
}
