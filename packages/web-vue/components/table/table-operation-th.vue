<template>
  <DefineTitle>
    <component :is="getSlotFunction(operationColumn.title)" />
  </DefineTitle>

  <div :class="cls" :style="style" v-bind="$attrs">
    <span :class="`${prefixCls}-cell`">
      <Checkbox
        v-if="selectAll"
        :model-value="checkboxStatus.checked"
        :indeterminate="checkboxStatus.indeterminate"
        uninject-group-context
        @change="handleSelectAll"
      >
        <ReuseTitle />
      </Checkbox>
      <ReuseTitle v-else-if="operationColumn.title" />
    </span>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, type PropType } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { TableContext } from './context';
  import type { TableOperationColumn } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { getSlotFunction } from '../_utils/vue-utils';
  import Checkbox from '../checkbox';
  import { tableInjectionKey } from './context';
  import { getGridSpanStyle, getOperationFixedCls, getOperationStyle } from './utils';

  defineOptions({
    name: 'OperationTh',
    inheritAttrs: false,
  });

  const props = defineProps({
    operationColumn: {
      type: Object as PropType<TableOperationColumn>,
      required: true,
    },
    operations: {
      type: Array as PropType<TableOperationColumn[]>,
      required: true,
    },
    rowSpan: {
      type: Number,
      default: 1,
    },
    selectAll: {
      type: Boolean,
      default: false,
    },
  });

  const prefixCls = getPrefixCls('table');
  const tableCtx = inject<Partial<TableContext>>(tableInjectionKey, {});
  const [DefineTitle, ReuseTitle] = createReusableTemplate();

  const checkboxStatus = computed(() => {
    let checked = false;
    let indeterminate = false;

    const currentSelectedEnabledRowKeys =
      tableCtx.currentSelectedRowKeys?.filter(
        (key) => tableCtx.currentAllEnabledRowKeys?.includes(key) ?? true,
      ) ?? [];

    const selectedNumber = currentSelectedEnabledRowKeys.length;
    const totalEnabledNumber = tableCtx.currentAllEnabledRowKeys?.length ?? 0;
    if (selectedNumber > 0) {
      if (selectedNumber >= totalEnabledNumber) {
        checked = true;
      } else {
        indeterminate = true;
      }
    }
    return {
      checked,
      indeterminate,
    };
  });

  const style = computed(() => ({
    ...getOperationStyle(props.operationColumn, props.operations),
    ...getGridSpanStyle(props.rowSpan),
  }));

  const cls = computed(() => [
    `${prefixCls}-th`,
    `${prefixCls}-operation`,
    {
      [`${prefixCls}-checkbox`]: props.selectAll,
    },
    ...getOperationFixedCls(prefixCls, props.operationColumn),
  ]);

  const handleSelectAll = (checked: unknown) => {
    tableCtx.onSelectAll?.(checked as boolean);
  };
</script>
