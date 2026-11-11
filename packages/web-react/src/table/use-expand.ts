import type { RowKey } from '@sdata/web-core/table/selection';

import { createExpansionFoundation, getDefaultExpandedRowKeys } from '@sdata/web-core/table/expand';
import { useReducer, useRef, useState } from 'react';

export interface TableExpansionOptions {
  expandedRowKeys?: RowKey[];
  defaultExpandedRowKeys?: RowKey[];
  defaultExpandAllRows?: boolean;
}
export interface TableExpansionStateProps<Raw> {
  expandedKeys?: RowKey[];
  defaultExpandedKeys?: RowKey[];
  defaultExpandAllRows?: boolean;
  expandable?: TableExpansionOptions;
  allRowKeys: RowKey[];
  onExpand?(key: RowKey, record: Raw): void;
  onExpandedChange?(keys: RowKey[]): void;
  onExpandedKeysChange?(keys: RowKey[]): void;
}
export function useTableExpand<Raw>(props: TableExpansionStateProps<Raw>) {
  const current = useRef(props);
  current.current = props;
  const [initial] = useState(() =>
    getDefaultExpandedRowKeys({
      ...props,
      defaultExpandAllRows: props.defaultExpandAllRows ?? false,
    }),
  );
  const local = useRef(initial);
  const [, render] = useReducer((version: number) => version + 1, 0);
  const getExpandedKeys = () =>
    current.current.expandedKeys ?? current.current.expandable?.expandedRowKeys ?? local.current;
  const [foundation] = useState(() =>
    createExpansionFoundation<Raw>({
      getExpandedKeys,
      getAllKeys: () => current.current.allRowKeys,
      setExpandedKeys: (keys) => {
        local.current = keys;
        render();
      },
      onExpand: (key, record) => current.current.onExpand?.(key, record),
      onExpandedChange: (keys) => current.current.onExpandedChange?.(keys),
      onUpdateExpandedKeys: (keys) => current.current.onExpandedKeysChange?.(keys),
    }),
  );
  return { ...foundation, expandedRowKeys: getExpandedKeys() };
}
