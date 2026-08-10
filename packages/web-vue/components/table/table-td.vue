<template>
  <component :is="getTdComponent()" :class="cls" :style="style" role="cell">
    <span :class="cellCls" :style="cellStyle">
      <span v-if="indentSize > 0" :style="{ paddingLeft: `${indentSize}px` }" />
      <span v-if="showExpandBtn" :class="`${prefixCls}-cell-inline-icon`" @click="handleClick">
        <IconLoading v-if="isLoading" />
        <VNodeRenderer v-else-if="expandButton" :content="expandButton" />
      </span>
      <AutoTooltip
        v-if="column?.ellipsis && column?.tooltip"
        :class="`${prefixCls}-td-content`"
        :tooltip-props="tooltipProps"
      >
        <VNodeRenderer :content="getCellContent()" />
      </AutoTooltip>
      <span
        v-else
        :class="[
          `${prefixCls}-td-content`,
          {
            [`${prefixCls}-text-ellipsis`]: column?.ellipsis,
          },
        ]"
      >
        <VNodeRenderer :content="getCellContent()" />
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
  import { computed, inject, ref, type PropType, type VNode, type VNodeChild } from 'vue';

  import type { TableContext } from './context';
  import type {
    TableColumnData,
    TableData,
    TableDataWithRaw,
    TableOperationColumn,
  } from './interface';

  import AutoTooltip from '../_components/auto-tooltip/auto-tooltip.vue';
  import { getValueByPath } from '../_utils/get-value-by-path';
  import { getPrefixCls } from '../_utils/global-config';
  import { isFunction, isObject } from '../_utils/is';
  import IconLoading from '../icon/icon-loading';
  import { tableInjectionKey } from './context';
  import { getFixedCls, getGridSpanStyle, getStyle } from './utils';

  const TD_TYPES = ['normal', 'operation', 'checkbox', 'radio', 'expand'] as const;
  type TdTypes = (typeof TD_TYPES)[number];

  defineOptions({
    name: 'Td',
    inheritAttrs: false,
  });

  const props = defineProps({
    rowIndex: Number,
    record: {
      type: Object as PropType<TableDataWithRaw>,
      default: () => ({}),
    },
    column: {
      type: Object as PropType<TableColumnData>,
      default: () => ({}),
    },
    type: {
      type: String as PropType<TdTypes>,
      default: 'normal',
    },
    operations: {
      type: Array as PropType<TableOperationColumn[]>,
      default: () => [],
    },
    dataColumns: {
      type: Array as PropType<TableColumnData[]>,
      default: () => [],
    },
    colSpan: {
      type: Number,
      default: 1,
    },
    rowSpan: {
      type: Number,
      default: 1,
    },
    isFixedExpand: {
      type: Boolean,
      default: false,
    },
    containerWidth: Number,
    showExpandBtn: {
      type: Boolean,
      default: false,
    },
    indentSize: {
      type: Number,
      default: 0,
    },
    renderExpandBtn: {
      type: Function as PropType<(record: TableDataWithRaw, stopPropagation?: boolean) => VNode>,
    },
    summary: {
      type: Boolean,
      default: false,
    },
  });

  const slots = defineSlots<{
    default?: () => VNode[];
    cell?: (data: { record: TableData; column: TableColumnData; rowIndex: number }) => VNode[];
    td?: (data: { record: TableData; column: TableColumnData; rowIndex: number }) => VNode[];
  }>();
  const prefixCls = getPrefixCls('table');
  const tableCtx = inject<Partial<TableContext>>(tableInjectionKey, {});
  const isLoading = ref(false);
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
  const cellData = computed(() => ({
    record: props.record?.raw,
    column: props.column,
    rowIndex: props.rowIndex ?? -1,
  }));
  const tooltipProps = computed(() =>
    isObject(props.column?.tooltip) ? props.column.tooltip : undefined,
  );
  const isSorted = computed(
    () => props.column?.dataIndex && tableCtx.sorter?.field === props.column.dataIndex,
  );
  const resizing = computed(
    () => props.column?.dataIndex && tableCtx.resizingColumn === props.column.dataIndex,
  );
  const cls = computed(() => [
    `${prefixCls}-td`,
    {
      [`${prefixCls}-col-sorted`]: isSorted.value,
      [`${prefixCls}-td-resizing`]: resizing.value,
    },
    ...getFixedCls(prefixCls, props.column),
    props.column?.cellClass,
    getCustomClass(),
  ]);
  const style = computed(() => ({
    ...getStyle(props.column, {
      dataColumns: props.dataColumns,
      operations: props.operations,
    }),
    ...getGridSpanStyle(props.rowSpan, props.colSpan),
    ...props.column?.cellStyle,
    ...getCustomStyle(),
  }));
  const cellStyle = computed(() =>
    props.isFixedExpand && props.containerWidth
      ? { width: `${props.containerWidth}px` }
      : undefined,
  );
  const cellCls = computed(() => [
    `${prefixCls}-cell`,
    `${prefixCls}-cell-align-${props.column?.align ?? 'left'}`,
    {
      [`${prefixCls}-cell-fixed-expand`]: props.isFixedExpand,
      [`${prefixCls}-cell-expand-icon`]: props.showExpandBtn,
    },
  ]);
  const expandButton = computed(() => props.renderExpandBtn?.(props.record, false));

  function getCustomClass() {
    if (props.summary) {
      return isFunction(props.column?.summaryCellClass)
        ? props.column.summaryCellClass(props.record?.raw)
        : props.column?.summaryCellClass;
    }
    return isFunction(props.column?.bodyCellClass)
      ? props.column.bodyCellClass(props.record?.raw)
      : props.column?.bodyCellClass;
  }

  function getCustomStyle() {
    if (props.summary) {
      return isFunction(props.column?.summaryCellStyle)
        ? props.column.summaryCellStyle(props.record?.raw)
        : props.column?.summaryCellStyle;
    }
    return isFunction(props.column?.bodyCellStyle)
      ? props.column.bodyCellStyle(props.record?.raw)
      : props.column?.bodyCellStyle;
  }

  function getCellContent(): VNodeChild {
    if (slots.default) return slots.default();
    if (slots.cell) return slots.cell(cellData.value);
    if (props.column.slots?.cell) return props.column.slots.cell(cellData.value);
    if (props.column.render) return props.column.render(cellData.value);
    if (props.column.slotName && tableCtx.slots?.[props.column.slotName]) {
      return tableCtx.slots[props.column.slotName]?.(cellData.value);
    }
    return String(getValueByPath(props.record?.raw, props.column.dataIndex) ?? '');
  }

  function getTdComponent() {
    return slots.td?.(cellData.value)[0] ?? 'div';
  }

  function handleClick(event: Event) {
    if (isFunction(tableCtx.loadMore) && !props.record?.isLeaf && !props.record?.children) {
      isLoading.value = true;
      new Promise<TableData[] | undefined>((resolve) => {
        tableCtx.loadMore?.(props.record.raw, resolve);
      }).then((children) => {
        tableCtx.addLazyLoadData?.(children, props.record);
        isLoading.value = false;
      });
    }
    event.stopPropagation();
  }
</script>
