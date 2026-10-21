<template>
  <div :class="`${prefixCls}-body`" role="grid">
    <div
      v-for="(row, rowIndex) in rows"
      :key="rowIndex"
      role="row"
      :class="[
        `${prefixCls}-row`,
        {
          [`${prefixCls}-row-week`]: isWeek,
        },
      ]"
    >
      <template v-for="(cell, colIndex) in row">
        <!-- 一年中的第几周，只在 week 模式下显示 -->
        <template v-if="isWeek && colIndex === 0">
          <div :key="colIndex" :class="[`${prefixCls}-cell`, `${prefixCls}-cell-week`]">
            <div :class="`${prefixCls}-date`">
              <div :class="`${prefixCls}-date-value`">{{ cell.label }}</div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            :key="colIndex"
            :class="getCellClassNameFn(cell)"
            role="gridcell"
            :aria-label="cell.value?.format('YYYY-MM-DD')"
            :aria-selected="isCellSelected(cell) ? 'true' : undefined"
            :aria-disabled="isCellDisabled(cell) || isHiddenNotInViewCell(cell) || undefined"
            @mouseenter="
              () => {
                onCellMouseEnter(cell);
              }
            "
            @mouseleave="
              () => {
                onCellMouseLeave(cell);
              }
            "
            @click="
              () => {
                onCellClick(cell);
              }
            "
          >
            <slot v-if="!isHiddenNotInViewCell(cell)" name="cell" :date="getDateValue(cell.value)">
              <div :class="`${prefixCls}-date`">
                <div :class="`${prefixCls}-date-value`">
                  {{ cell.label }}
                </div>
              </div>
            </slot>
            <div v-else :class="`${prefixCls}-date`">
              <div :class="`${prefixCls}-date-value`" />
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType, reactive, toRefs } from 'vue';

  import { createDatePanelBodyFoundation } from '@sdata/web-core/date-picker/panel-body';
  import { Dayjs } from 'dayjs';

  import type { Cell, DisabledDate, IsSameTime, Mode } from '../interface';

  import { getDateValue } from '../../_utils/date';
  import useCellClassName from '../hooks/use-cell-class-name';

  defineOptions({ name: 'PanelBody' });

  const props = defineProps({
    prefixCls: {
      type: String,
      required: true,
    },
    rows: {
      type: Array as PropType<Cell[][]>,
      default: () => [],
    },
    value: {
      type: Object as PropType<Dayjs>,
    },
    disabledDate: {
      type: Function as PropType<DisabledDate>,
    },
    isSameTime: {
      type: Function as PropType<IsSameTime>,
      required: true,
    },
    mode: {
      type: String as PropType<Mode>,
    },
    hideNotInViewDates: {
      type: Boolean,
    },
    rangeValues: {
      type: Array as PropType<Array<Dayjs | undefined>>,
    },
    now: {
      type: Object as PropType<Dayjs>,
    },
  });

  const emit = defineEmits<{
    'cell-click': [_cellData: Cell];
    'cell-mouse-enter': [_cellData: Cell];
  }>();

  const { prefixCls, value, disabledDate, isSameTime, mode, rangeValues, now } = toRefs(props);

  const { getCellClassName } = useCellClassName(
    reactive({
      prefixCls,
      value,
      isSameTime,
      mode,
      rangeValues,
      now,
    }),
  );

  const foundation = createDatePanelBodyFoundation(
    {
      get value() {
        return value?.value;
      },
      get disabledDate() {
        return disabledDate?.value;
      },
      get mode() {
        return mode?.value;
      },
      get hideNotInViewDates() {
        return props.hideNotInViewDates;
      },
    },
    isSameTime,
    getCellClassName,
    (cell) => emit('cell-click', cell),
    (cell) => emit('cell-mouse-enter', cell),
  );
  const {
    isCellDisabled,
    isCellSelected,
    isHiddenNotInViewCell,
    getCellClassNameFn,
    onCellClick,
    onCellMouseEnter,
    onCellMouseLeave,
  } = foundation;
  const isWeek = computed(foundation.getIsWeek);
</script>
