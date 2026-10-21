import { union } from '../_utils/array.js';

export type RowKey = string | number;
export interface SelectionNode {
  key: RowKey;
  isLeaf?: boolean;
  children?: SelectionNode[];
}
export interface SelectionRecord<Raw> extends SelectionNode {
  raw: Raw;
  children?: SelectionRecord<Raw>[];
}

export const getLeafKeys = (record: SelectionNode) => {
  const keys: RowKey[] = [];
  if (record.children) {
    for (const item of record.children) {
      if (item.isLeaf) {
        keys.push(item.key);
      } else {
        keys.push(...getLeafKeys(item));
      }
    }
  }
  return keys;
};

export const getSelectionStatus = (selectedRowKeys: RowKey[], leafKeys: RowKey[]) => {
  let checked = false;
  let indeterminate = false;
  const selectedLeafKeys = leafKeys.filter((key) => selectedRowKeys.includes(key));
  if (selectedLeafKeys.length > 0) {
    if (selectedLeafKeys.length >= leafKeys.length) {
      checked = true;
    } else {
      indeterminate = true;
    }
  }

  return {
    checked,
    indeterminate,
  };
};

export function createRowSelectionFoundation<Raw>(adapter: {
  getSelectedKeys: () => RowKey[];
  getEnabledKeys: () => RowKey[];
  isRadio: () => boolean;
  setSelectedKeys: (keys: RowKey[]) => void;
  onSelectAll: (checked: boolean) => void;
  onSelect: (keys: RowKey[], key: RowKey, record: Raw) => void;
  onSelectionChange: (keys: RowKey[]) => void;
  onUpdateSelectedKeys: (keys: RowKey[]) => void;
}) {
  const handleSelectAll = (checked: boolean) => {
    const newKeys = union(adapter.getSelectedKeys(), adapter.getEnabledKeys(), !checked);
    adapter.setSelectedKeys(newKeys);

    adapter.onSelectAll(checked);
    adapter.onSelectionChange(newKeys);
    adapter.onUpdateSelectedKeys(newKeys);
  };

  const handleSelect = (checked: boolean, record: SelectionRecord<Raw>) => {
    const selectedAllRowKeys = adapter.isRadio()
      ? [record.key]
      : union(adapter.getSelectedKeys(), [record.key], !checked);
    adapter.setSelectedKeys(selectedAllRowKeys);
    adapter.onSelect(selectedAllRowKeys, record.key, record.raw);
    adapter.onSelectionChange(selectedAllRowKeys);
    adapter.onUpdateSelectedKeys(selectedAllRowKeys);
  };

  const handleSelectAllLeafs = (record: SelectionRecord<Raw>, checked: boolean) => {
    const newKeys = union(
      adapter.getSelectedKeys(),
      getLeafKeys(record).filter((key) => adapter.getEnabledKeys().includes(key)),
      !checked,
    );
    adapter.setSelectedKeys(newKeys);
    adapter.onSelect(newKeys, record.key, record.raw);
    adapter.onSelectionChange(newKeys);
    adapter.onUpdateSelectedKeys(newKeys);
  };

  const select = (rowKey: RowKey | RowKey[], checked = true) => {
    const _rowKeys = ([] as RowKey[]).concat(rowKey);
    const newSelectedRowKeys = adapter.isRadio()
      ? checked
        ? _rowKeys
        : adapter.getSelectedKeys().filter((key) => !_rowKeys.includes(key))
      : union(adapter.getSelectedKeys(), _rowKeys, !checked);
    adapter.setSelectedKeys(newSelectedRowKeys);
    adapter.onSelectionChange(newSelectedRowKeys);
    adapter.onUpdateSelectedKeys(newSelectedRowKeys);
  };

  const selectAll = (checked = true) => {
    const newKeys = union(adapter.getSelectedKeys(), adapter.getEnabledKeys(), !checked);
    adapter.setSelectedKeys(newKeys);

    adapter.onSelectionChange(newKeys);
    adapter.onUpdateSelectedKeys(newKeys);
  };

  const clearSelected = () => {
    adapter.setSelectedKeys([]);

    adapter.onSelectionChange([]);
    adapter.onUpdateSelectedKeys([]);
  };

  return { handleSelectAll, handleSelect, handleSelectAllLeafs, select, selectAll, clearSelected };
}
