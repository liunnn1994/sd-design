import { computed, Ref, ref } from 'vue';

import { createExpansionFoundation, getDefaultExpandedRowKeys } from '@sdata/web-core/table/expand';

import type { BaseType, EmitFn2 } from '../../_utils/types';
import type { TableData, TableExpandable } from '../interface';

export const useExpand = ({
  expandedKeys,
  defaultExpandedKeys,
  defaultExpandAllRows,
  expandable,
  allRowKeys,
  emit,
}: {
  expandedKeys: Ref<BaseType[] | undefined>;
  defaultExpandedKeys: Ref<BaseType[] | undefined>;
  defaultExpandAllRows: Ref<boolean>;
  expandable: Ref<TableExpandable | undefined>;
  allRowKeys: Ref<BaseType[]>;
  emit: EmitFn2<{
    'update:expandedKeys': (rowKeys: BaseType[]) => true;
    'expand': (rowKey: BaseType, record: TableData) => true;
    'expandedChange': (rowKeys: BaseType[]) => true;
  }>;
}) => {
  const _expandedRowKeys = ref(
    getDefaultExpandedRowKeys({
      defaultExpandedKeys: defaultExpandedKeys.value,
      expandable: expandable.value,
      defaultExpandAllRows: defaultExpandAllRows.value,
      allRowKeys: allRowKeys.value,
    }),
  );
  const expandedRowKeys = computed(
    () => expandedKeys.value ?? expandable.value?.expandedRowKeys ?? _expandedRowKeys.value,
  );
  const foundation = createExpansionFoundation<TableData>({
    getExpandedKeys: () => expandedRowKeys.value,
    getAllKeys: () => allRowKeys.value,
    setExpandedKeys: (keys) => {
      _expandedRowKeys.value = keys;
    },
    onExpand: (key, record) => emit('expand', key, record),
    onExpandedChange: (keys) => emit('expandedChange', keys),
    onUpdateExpandedKeys: (keys) => emit('update:expandedKeys', keys),
  });
  return { expandedRowKeys, ...foundation };
};
