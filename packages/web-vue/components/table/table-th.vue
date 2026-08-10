<template>
  <DefineFilter>
    <Trigger
      v-if="column.filterable"
      :popup-visible="filterPopupVisible"
      trigger="click"
      auto-fit-position
      :popup-offset="filterIconAlignLeft ? 4 : 0"
      v-bind="column.filterable.triggerProps"
      :floating-options="
        column.filterable.floatingOptions ?? column.filterable.triggerProps?.floatingOptions
      "
      @popup-visible-change="handleFilterPopupVisibleChange"
    >
      <IconHover :class="filterCls" :disabled="!filterIconAlignLeft" @click.stop>
        <VNodeRenderer v-if="filterIconContent" :content="filterIconContent" />
        <IconFilter v-else />
      </IconHover>
      <template #content>
        <VNodeRenderer v-if="customFilterContent" :content="customFilterContent" />
        <div v-else :class="`${prefixCls}-filters-content`">
          <ul :class="`${prefixCls}-filters-list`">
            <li
              v-for="(item, index) in column.filterable.filters"
              :key="index"
              :class="`${prefixCls}-filters-item`"
            >
              <Checkbox
                v-if="isMultipleFilter"
                :value="item.value"
                :model-value="columnFilterValue"
                uninject-group-context
                @change="handleCheckboxChange"
              >
                {{ item.text }}
              </Checkbox>
              <Radio
                v-else
                :value="item.value"
                :model-value="columnFilterValue[0] ?? ''"
                uninject-group-context
                @change="handleRadioChange"
              >
                {{ item.text }}
              </Radio>
            </li>
          </ul>
          <div :class="`${prefixCls}-filters-bottom`">
            <Button size="mini" @click="handleFilterReset">{{ t('table.resetText') }}</Button>
            <Button type="primary" size="mini" @click="handleFilterConfirm">
              {{ t('table.okText') }}
            </Button>
          </div>
        </div>
      </template>
    </Trigger>
  </DefineFilter>

  <component
    :is="getThComponent()"
    :class="cls"
    :style="style"
    role="columnheader"
    :aria-sort="ariaSort"
  >
    <span :class="cellCls" @click="hasSorter ? handleClickSorter($event) : undefined">
      <AutoTooltip
        v-if="column.ellipsis && column.tooltip"
        :class="`${prefixCls}-th-title`"
        :tooltip-props="tooltipProps"
      >
        <VNodeRenderer :content="getTitle()" />
      </AutoTooltip>
      <span
        v-else
        :class="[`${prefixCls}-th-title`, { [`${prefixCls}-text-ellipsis`]: column.ellipsis }]"
      >
        <VNodeRenderer :content="getTitle()" />
      </span>
      <span v-if="hasSorter" :class="`${prefixCls}-sorter`">
        <div
          v-if="hasAscendBtn"
          :class="[
            `${prefixCls}-sorter-icon`,
            { [`${prefixCls}-sorter-icon-active`]: sortOrder === 'ascend' },
          ]"
        >
          <IconCaretUp />
        </div>
        <div
          v-if="hasDescendBtn"
          :class="[
            `${prefixCls}-sorter-icon`,
            { [`${prefixCls}-sorter-icon-active`]: sortOrder === 'descend' },
          ]"
        >
          <IconCaretDown />
        </div>
      </span>
      <ReuseFilter v-if="filterIconAlignLeft" />
    </span>
    <ReuseFilter v-if="!filterIconAlignLeft" />
    <span v-if="resizable" :class="`${prefixCls}-column-handle`" @mousedown="handleMouseDown" />
  </component>
</template>

<script setup lang="ts">
  import { computed, inject, toRef, type PropType, type VNodeChild } from 'vue';

  import { createReusableTemplate } from '@vueuse/core';

  import type { TableContext } from './context';
  import type { TableColumnData, TableOperationColumn } from './interface';

  import AutoTooltip from '../_components/auto-tooltip/auto-tooltip.vue';
  import IconHover from '../_components/icon-hover.vue';
  import { getPrefixCls } from '../_utils/global-config';
  import { isBoolean, isFunction, isObject } from '../_utils/is';
  import Button from '../button';
  import Checkbox from '../checkbox';
  import IconCaretDown from '../icon/icon-caret-down';
  import IconCaretUp from '../icon/icon-caret-up';
  import IconFilter from '../icon/icon-filter';
  import { useI18n } from '../locale';
  import Radio from '../radio';
  import Trigger from '../trigger';
  import { tableInjectionKey } from './context';
  import { useColumnFilter } from './hooks/use-column-filter';
  import { useColumnSorter } from './hooks/use-column-sorter';
  import { getFixedCls, getGridSpanStyle, getStyle } from './utils';

  defineOptions({ name: 'Th', inheritAttrs: false });

  const props = defineProps({
    column: {
      type: Object as PropType<TableColumnData>,
      default: () => ({}),
    },
    operations: {
      type: Array as PropType<TableOperationColumn[]>,
      default: () => [],
    },
    dataColumns: {
      type: Array as PropType<TableColumnData[]>,
      default: () => [],
    },
    resizable: Boolean,
  });

  const slots = defineSlots<{
    default?: () => VNodeChild;
    th?: (data: { column: TableColumnData }) => VNodeChild[];
  }>();
  const column = toRef(props, 'column');
  const prefixCls = getPrefixCls('table');
  const { t } = useI18n();
  const tableCtx = inject<Partial<TableContext>>(tableInjectionKey, {});
  const VNodeRenderer = ({ content }: { content: VNodeChild }) => content;
  const [DefineFilter, ReuseFilter] = createReusableTemplate();
  const resizing = computed(
    () => props.column.dataIndex && tableCtx.resizingColumn === props.column.dataIndex,
  );
  const tooltipProps = computed(() =>
    isObject(props.column.tooltip) ? props.column.tooltip : undefined,
  );
  const filterIconAlignLeft = computed(() => {
    if (props.column.filterable && isBoolean(props.column.filterable.alignLeft)) {
      return props.column.filterable.alignLeft;
    }
    return tableCtx.filterIconAlignLeft;
  });
  const { sortOrder, hasSorter, hasAscendBtn, hasDescendBtn, nextSortOrder, handleClickSorter } =
    useColumnSorter({ column, tableCtx });
  const {
    filterPopupVisible,
    isFilterActive,
    isMultipleFilter,
    columnFilterValue,
    handleFilterPopupVisibleChange,
    setFilterValue,
    handleCheckboxFilterChange,
    handleRadioFilterChange,
    handleFilterConfirm,
    handleFilterReset,
  } = useColumnFilter({ column, tableCtx });
  const filterData = computed(() => ({
    filterValue: columnFilterValue.value,
    setFilterValue,
    handleFilterConfirm,
    handleFilterReset,
  }));
  const customFilterContent = computed(() => {
    const filterable = props.column.filterable;
    if (props.column.slots?.['filter-content']) {
      return props.column.slots['filter-content'](filterData.value);
    }
    if (filterable?.slotName) {
      return tableCtx.slots?.[filterable.slotName]?.(filterData.value);
    }
    return filterable?.renderContent?.(filterData.value);
  });
  const filterIconContent = computed(
    () => props.column.slots?.['filter-icon']?.() ?? props.column.filterable?.icon?.(),
  );
  const filterCls = computed(() => [
    `${prefixCls}-filters`,
    {
      [`${prefixCls}-filters-active`]: isFilterActive.value,
      [`${prefixCls}-filters-open`]: filterPopupVisible.value,
      [`${prefixCls}-filters-align-left`]: filterIconAlignLeft.value,
    },
  ]);
  const cellCls = computed(() => {
    const result: unknown[] = [
      `${prefixCls}-cell`,
      `${prefixCls}-cell-align-${props.column.align ?? (props.column.children ? 'center' : 'left')}`,
    ];
    if (hasSorter.value) {
      result.push(`${prefixCls}-cell-with-sorter`, {
        [`${prefixCls}-cell-next-ascend`]: nextSortOrder.value === 'ascend',
        [`${prefixCls}-cell-next-descend`]: nextSortOrder.value === 'descend',
      });
    }
    if (filterIconAlignLeft.value) result.push(`${prefixCls}-cell-with-filter`);
    return result;
  });
  const style = computed(() => ({
    ...getStyle(props.column, { dataColumns: props.dataColumns, operations: props.operations }),
    ...getGridSpanStyle(props.column.rowSpan, props.column.colSpan),
    ...props.column.cellStyle,
    ...props.column.headerCellStyle,
  }));
  const cls = computed(() => [
    `${prefixCls}-th`,
    {
      [`${prefixCls}-col-sorted`]: Boolean(sortOrder.value),
      [`${prefixCls}-th-resizing`]: resizing.value,
    },
    ...getFixedCls(prefixCls, props.column),
    props.column.cellClass,
    props.column.headerCellClass,
  ]);
  const ariaSort = computed(() =>
    hasSorter.value
      ? sortOrder.value === 'ascend'
        ? 'ascending'
        : sortOrder.value === 'descend'
          ? 'descending'
          : 'none'
      : undefined,
  );

  function getTitle(): VNodeChild {
    if (slots.default) return slots.default();
    if (props.column.titleSlotName && tableCtx.slots?.[props.column.titleSlotName]) {
      return tableCtx.slots[props.column.titleSlotName]?.({ column: props.column });
    }
    if (props.column.slots?.title) return props.column.slots.title();
    if (isFunction(props.column.title)) return props.column.title();
    return props.column.title;
  }

  function getThComponent() {
    return slots.th?.({ column: props.column })[0] ?? 'div';
  }

  function handleCheckboxChange(value: unknown) {
    handleCheckboxFilterChange(value as string[]);
  }

  function handleRadioChange(value: unknown) {
    handleRadioFilterChange(value as string);
  }

  function handleMouseDown(event: MouseEvent) {
    if (props.column.dataIndex) tableCtx.onThMouseDown?.(props.column.dataIndex, event);
  }
</script>
