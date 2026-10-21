<template>
  <div :class="cls" :style="style">
    <span :class="`${prefixCls}-cell`">
      <component
        :is="getRenderFunction(operationColumn.render(record.raw))"
        v-if="!summary && operationColumn.render"
      />
      <Checkbox
        v-else-if="!summary && operationColumn.name === 'selection-checkbox'"
        :model-value="checkboxValue"
        :indeterminate="isTreeSelection ? selectionStatus.indeterminate : undefined"
        :disabled="Boolean(record.disabled)"
        uninject-group-context
        @change="handleCheckboxChange"
        @click.stop
      />
      <Radio
        v-else-if="!summary && operationColumn.name === 'selection-radio'"
        :model-value="selectedRowKeys?.includes(record.key) ?? false"
        :disabled="Boolean(record.disabled)"
        uninject-group-context
        @change="handleRadioChange"
        @click.stop
      />
      <component
        :is="getRenderFunction(renderExpandBtn(record))"
        v-else-if="!summary && operationColumn.name === 'expand' && hasExpand && renderExpandBtn"
      />
      <slot v-else-if="!summary && operationColumn.name === 'drag-handle'" name="drag-handle-icon">
        <IconDragDotVertical />
      </slot>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, type PropType, type VNode, type VNodeChild } from 'vue';

  import { createTableOperationFoundation } from '@sdata/web-core/table/cell';

  import type { BaseType } from '../_utils/types';
  import type { TableContext } from './context';
  import type { TableDataWithRaw, TableOperationColumn } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import Checkbox from '../checkbox';
  import IconDragDotVertical from '../icon/icon-drag-dot-vertical';
  import Radio from '../radio';
  import { tableInjectionKey } from './context';
  import { getGridSpanStyle, getOperationFixedCls, getOperationStyle } from './utils';

  defineOptions({ name: 'OperationTd' });

  const props = defineProps({
    operationColumn: {
      type: Object as PropType<TableOperationColumn>,
      required: true,
    },
    operations: {
      type: Array as PropType<TableOperationColumn[]>,
      required: true,
    },
    record: {
      type: Object as PropType<TableDataWithRaw>,
      required: true,
    },
    hasExpand: {
      type: Boolean,
      default: false,
    },
    selectedRowKeys: Array as PropType<BaseType[]>,
    renderExpandBtn: Function as PropType<
      (record: TableDataWithRaw, stopPropagation?: boolean) => VNode
    >,
    colSpan: {
      type: Number,
      default: 1,
    },
    rowSpan: {
      type: Number,
      default: 1,
    },
    summary: {
      type: Boolean,
      default: false,
    },
  });

  defineEmits(['select']);

  const prefixCls = getPrefixCls('table');
  const tableCtx = inject<Partial<TableContext>>(tableInjectionKey, {});

  const getRenderFunction = (content: VNodeChild) =>
    content === null || content === undefined ? undefined : () => content;

  const style = computed(() => ({
    ...getOperationStyle(props.operationColumn, props.operations),
    ...getGridSpanStyle(props.rowSpan, props.colSpan),
  }));

  const cls = computed(() => [
    `${prefixCls}-td`,
    `${prefixCls}-operation`,
    {
      [`${prefixCls}-checkbox`]: props.operationColumn.name === 'selection-checkbox',
      [`${prefixCls}-radio`]: props.operationColumn.name === 'selection-radio',
      [`${prefixCls}-expand`]: props.operationColumn.name === 'expand',
      [`${prefixCls}-drag-handle`]: props.operationColumn.name === 'drag-handle',
    },
    ...getOperationFixedCls(prefixCls, props.operationColumn),
  ]);

  const foundation = createTableOperationFoundation(props, tableCtx, {
    get leafKeys(): Array<string | number> {
      return leafKeys.value;
    },
    get selectionStatus(): { checked: boolean; indeterminate: boolean } {
      return selectionStatus.value;
    },
    get isTreeSelection(): boolean {
      return isTreeSelection.value;
    },
  });
  const leafKeys = computed(foundation.getEnabledLeafKeys);
  const selectionStatus = computed(foundation.getCurrentSelectionStatus);
  const isTreeSelection = computed(foundation.getIsTreeSelection);
  const checkboxValue = computed(foundation.getCheckboxValue);

  const handleCheckboxChange = foundation.handleCheckboxChange;

  const handleRadioChange = foundation.handleRadioChange;
</script>
