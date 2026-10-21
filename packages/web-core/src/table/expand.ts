import type { RowKey } from './selection.js';

export function getDefaultExpandedRowKeys(options: {
  defaultExpandedKeys?: RowKey[];
  expandable?: { defaultExpandedRowKeys?: RowKey[]; defaultExpandAllRows?: boolean };
  defaultExpandAllRows: boolean;
  allRowKeys: RowKey[];
}): RowKey[] {
  if (options.defaultExpandedKeys) return options.defaultExpandedKeys;
  if (options.expandable?.defaultExpandedRowKeys) return options.expandable.defaultExpandedRowKeys;
  if (options.defaultExpandAllRows || options.expandable?.defaultExpandAllRows)
    return [...options.allRowKeys];
  return [];
}

export function createExpansionFoundation<Raw>(adapter: {
  getExpandedKeys: () => RowKey[];
  getAllKeys: () => RowKey[];
  setExpandedKeys: (keys: RowKey[]) => void;
  onExpand: (key: RowKey, record: Raw) => void;
  onExpandedChange: (keys: RowKey[]) => void;
  onUpdateExpandedKeys: (keys: RowKey[]) => void;
}) {
  const handleExpand = (key: RowKey, record: Raw) => {
    const previous = adapter.getExpandedKeys();
    const keys = previous.includes(key)
      ? previous.filter((item) => item !== key)
      : previous.concat(key);
    adapter.setExpandedKeys(keys);
    adapter.onExpand(key, record);
    adapter.onExpandedChange(keys);
    adapter.onUpdateExpandedKeys(keys);
  };
  const expand = (key: RowKey | RowKey[], expanded = true) => {
    const requested = ([] as RowKey[]).concat(key);
    const keys = expanded
      ? Array.from(new Set(adapter.getExpandedKeys().concat(requested)))
      : adapter.getExpandedKeys().filter((key) => !requested.includes(key));
    adapter.setExpandedKeys(keys);
    adapter.onExpandedChange(keys);
    adapter.onUpdateExpandedKeys(keys);
  };
  const expandAll = (expanded = true) => {
    const keys = expanded ? [...adapter.getAllKeys()] : [];
    adapter.setExpandedKeys(keys);
    adapter.onExpandedChange(keys);
    adapter.onUpdateExpandedKeys(keys);
  };
  return { handleExpand, expand, expandAll };
}
