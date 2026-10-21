import type { TreeQueryNode } from '../tree/query.js';
import type { TreeNodeKey, TreeFieldNames } from '../tree/types.js';
import type { LabelValue, TreeSelectValue, FallbackOption } from './types.js';

import { isArray, isObject } from '../_utils/is.js';

function isLabelValue(value: TreeNodeKey | LabelValue): value is LabelValue {
  return isObject(value);
}

function isValidKey(key: TreeNodeKey) {
  return key !== undefined && key !== null && key !== '';
}

function getKey(value: TreeNodeKey | LabelValue) {
  return isLabelValue(value) ? value.value : value;
}

function getLabel(value: TreeNodeKey | LabelValue) {
  return isLabelValue(value) ? value.label : undefined;
}

function isValidValue(value: TreeNodeKey | LabelValue) {
  const key = getKey(value);
  return isValidKey(key);
}

function getKeys(value: (TreeNodeKey | LabelValue)[]) {
  return value.map(getKey).filter(isValidKey);
}

export { getKeys };
export interface TreeSelectValueAdapter<T, N extends TreeQueryNode<T>> {
  getNodes: () => ReadonlyMap<TreeNodeKey, N>;
  getShowPath: () => boolean | undefined;
  getFieldNames: () => TreeFieldNames | undefined;
  getSeparator: () => string | undefined;
  getMultiple: () => boolean | undefined;
  getCheckable: () => boolean | undefined;
  getFallbackOption: () => FallbackOption<T> | undefined;
}
export function createTreeSelectValues<
  T extends Record<string, unknown>,
  N extends TreeQueryNode<T> & { title?: unknown },
>(adapter: TreeSelectValueAdapter<T, N>) {
  function getPathLabel(key: TreeNodeKey, node: N | undefined) {
    if (!adapter.getShowPath() || !node) {
      return undefined;
    }

    const nodeDataTitle = (adapter.getFieldNames()?.title || 'title') as keyof T;
    const pathNodes = [...node.pathParentKeys, key]
      .map((pathKey) => adapter.getNodes().get(pathKey))
      .filter((pathNode): pathNode is NonNullable<typeof pathNode> => Boolean(pathNode));

    return pathNodes
      .map((pathNode) => {
        const pathLabel = pathNode.treeNodeData[nodeDataTitle];

        if (typeof pathLabel === 'string' || typeof pathLabel === 'number') {
          return String(pathLabel);
        }

        if (typeof pathNode.title === 'string' || typeof pathNode.title === 'number') {
          return String(pathNode.title);
        }

        return String(pathNode.key);
      })
      .join(adapter.getSeparator() ?? ' / ');
  }

  function normalizeValue(value: TreeSelectValue) {
    const validValue = (isArray(value) ? value : [value]).filter(isValidValue);

    return adapter.getMultiple() || adapter.getCheckable() ? validValue : validValue.slice(0, 1);
  }

  function getLabelValues(value: (TreeNodeKey | LabelValue)[], originValue?: LabelValue[]) {
    const res: LabelValue[] = [];
    const validValue = value ? value.filter(isValidValue) : [];

    if (validValue.length) {
      const originValueMap = new Map<TreeNodeKey, LabelValue>();
      originValue?.forEach((item) => {
        originValueMap.set(item.value, item);
      });

      validValue.forEach((item) => {
        const key = getKey(item);
        const originValueItem = originValueMap.get(key);
        const node = adapter.getNodes().get(key);
        let fallbackNodeData: T | null = null;
        const nodeDataTitle = (adapter.getFieldNames()?.title || 'title') as 'title';

        if (!node) {
          const fallback = adapter.getFallbackOption();
          const fallbackResult = typeof fallback === 'function' ? fallback(key) : fallback;

          if (fallbackResult === false) {
            return;
          }

          if (isObject(fallbackResult)) {
            fallbackNodeData = fallbackResult;
          }
        }

        const fallbackLabel = fallbackNodeData?.[nodeDataTitle];
        const label: LabelValue['label'] =
          getLabel(item) ??
          getPathLabel(key, node) ??
          (typeof node?.title === 'string' || typeof node?.title === 'number'
            ? node.title
            : undefined) ??
          originValueItem?.label ??
          (typeof fallbackLabel === 'string' || typeof fallbackLabel === 'number'
            ? fallbackLabel
            : undefined) ??
          key;

        res.push({
          ...(isLabelValue(item) ? item : {}),
          ...originValueItem,
          value: key,
          label,
        });
      });
    }

    return res;
  }

  return { normalizeValue, getLabelValues };
}
