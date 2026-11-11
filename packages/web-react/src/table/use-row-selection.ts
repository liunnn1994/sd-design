import type { RowKey } from '@sdata/web-core/table/selection';

import { createRowSelectionFoundation } from '@sdata/web-core/table/selection';
import { useReducer, useRef, useState } from 'react';

export interface TableSelectionOptions {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: RowKey[];
  defaultSelectedRowKeys?: RowKey[];
}
export interface TableSelectionStateProps<Raw> {
  selectedKeys?: RowKey[];
  defaultSelectedKeys?: RowKey[];
  rowSelection?: TableSelectionOptions;
  currentAllRowKeys: RowKey[];
  currentAllEnabledRowKeys: RowKey[];
  onSelectAll?(checked: boolean): void;
  onSelect?(keys: RowKey[], key: RowKey, record: Raw): void;
  onSelectionChange?(keys: RowKey[]): void;
  onSelectedKeysChange?(keys: RowKey[]): void;
}
export function useTableRowSelection<Raw>(props: TableSelectionStateProps<Raw>) {
  const current = useRef(props);
  current.current = props;
  const local = useRef(
    props.defaultSelectedKeys ?? props.rowSelection?.defaultSelectedRowKeys ?? [],
  );
  const [, render] = useReducer((version: number) => version + 1, 0);
  const getSelectedKeys = () =>
    current.current.selectedKeys ?? current.current.rowSelection?.selectedRowKeys ?? local.current;
  const [foundation] = useState(() =>
    createRowSelectionFoundation<Raw>({
      getSelectedKeys,
      getEnabledKeys: () => current.current.currentAllEnabledRowKeys,
      isRadio: () => current.current.rowSelection?.type === 'radio',
      setSelectedKeys: (keys) => {
        local.current = keys;
        render();
      },
      onSelectAll: (checked) => current.current.onSelectAll?.(checked),
      onSelect: (keys, key, record) => current.current.onSelect?.(keys, key, record),
      onSelectionChange: (keys) => current.current.onSelectionChange?.(keys),
      onUpdateSelectedKeys: (keys) => current.current.onSelectedKeysChange?.(keys),
    }),
  );
  const selectedRowKeys = getSelectedKeys();
  return {
    ...foundation,
    isRadio: props.rowSelection?.type === 'radio',
    selectedRowKeys,
    currentSelectedRowKeys: selectedRowKeys.filter((key) => props.currentAllRowKeys.includes(key)),
  };
}
