import type { Ref } from 'vue';
import { computed, ref } from 'vue';

import { createRowSelectionFoundation } from '@sdata/web-core/table/selection';

import type { BaseType, EmitFn2 } from '../../_utils/types';
import type { TableDataWithRaw, TableRowSelection } from '../interface';

import { TableData } from '../interface';

export const useRowSelection = ({
  selectedKeys,
  defaultSelectedKeys,
  rowSelection,
  currentAllRowKeys,
  currentAllEnabledRowKeys,
  emit,
}: {
  selectedKeys: Ref<BaseType[] | undefined>;
  defaultSelectedKeys: Ref<BaseType[] | undefined>;
  rowSelection: Ref<TableRowSelection | undefined>;
  currentAllRowKeys: Ref<BaseType[]>;
  currentAllEnabledRowKeys: Ref<BaseType[]>;
  emit: EmitFn2<{
    'update:selectedKeys': (rowKeys: BaseType[]) => true;
    'select': (rowKeys: BaseType[], rowKey: BaseType, record: TableData) => true;
    'selectAll': (checked: boolean) => true;
    'selectionChange': (rowKeys: BaseType[]) => true;
  }>;
}) => {
  const isRadio = computed(() => rowSelection.value?.type === 'radio');
  const _selectedRowKeys = ref(
    defaultSelectedKeys.value ?? rowSelection.value?.defaultSelectedRowKeys ?? [],
  );
  const selectedRowKeys = computed(
    () => selectedKeys.value ?? rowSelection.value?.selectedRowKeys ?? _selectedRowKeys.value,
  );
  const currentSelectedRowKeys = computed(() =>
    selectedRowKeys.value.filter((key) => currentAllRowKeys.value.includes(key)),
  );

  const foundation = createRowSelectionFoundation<TableData>({
    getSelectedKeys: () => selectedRowKeys.value,
    getEnabledKeys: () => currentAllEnabledRowKeys.value,
    isRadio: () => isRadio.value,
    setSelectedKeys: (keys) => {
      _selectedRowKeys.value = keys;
    },
    onSelectAll: (checked) => emit('selectAll', checked),
    onSelect: (keys, key, record) => emit('select', keys, key, record),
    onSelectionChange: (keys) => emit('selectionChange', keys),
    onUpdateSelectedKeys: (keys) => emit('update:selectedKeys', keys),
  });

  return {
    isRadio,
    selectedRowKeys,
    currentSelectedRowKeys,
    ...foundation,
    handleSelect: (checked: boolean, record: TableDataWithRaw) =>
      foundation.handleSelect(checked, record),
    handleSelectAllLeafs: (record: TableDataWithRaw, checked: boolean) =>
      foundation.handleSelectAllLeafs(record, checked),
  };
};
