import { onBeforeUnmount, reactive, ref, Ref } from 'vue';

import { createColumnResizeFoundation } from '@sdata/web-core/table/column-resize';

import { EmitFn2 } from '../../_utils/types';

export const useColumnResize = (
  thRefs: Ref<Record<string, HTMLElement>>,
  emit: EmitFn2<{ columnResize: (dataIndex: string, width: number) => true }>,
) => {
  const resizingColumn = ref('');
  const columnWidth = reactive<Record<string, number>>(Object.create(null));

  const foundation = createColumnResizeFoundation(
    {
      get thElements() {
        return thRefs.value;
      },
      get resizingColumn() {
        return resizingColumn.value;
      },
      set resizingColumn(value) {
        resizingColumn.value = value;
      },
      get columnWidth() {
        return columnWidth;
      },
    },
    emit,
  );
  const { handleThMouseDown, handleThMouseUp } = foundation;
  onBeforeUnmount(foundation.dispose);

  return {
    resizingColumn,
    columnWidth,
    handleThMouseDown,
    handleThMouseUp,
  };
};
