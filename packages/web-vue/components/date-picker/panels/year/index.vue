<template>
  <div :class="prefixCls">
    <div :class="`${prefixCls}-inner`">
      <PanelHeader
        v-bind="{
          ...headerOperations,
          icons: headerIcons,
        }"
        :prefix-cls="pickerPrefixCls"
        :title="headerTitle"
      />
      <PanelBody
        mode="year"
        :prefix-cls="pickerPrefixCls"
        :rows="rows"
        :value="value"
        :range-values="rangeValues"
        :disabled-date="disabledDate"
        :is-same-time="isSameTime"
        @cellClick="onCellClick"
        @cellMouseEnter="onCellMouseEnter"
      >
        <template #cell="scope"><slot name="cell" v-bind="scope" /></template>
      </PanelBody>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType, toRefs } from 'vue';

  import { getYearRows, getYearHeaderTitle } from '@sdata/web-core/date-picker/calendar';
  import { Dayjs } from 'dayjs';

  import type {
    Cell,
    DisabledDate,
    HeaderIcons,
    HeaderOperations,
    IsSameTime,
  } from '../../interface';

  import { getPrefixCls } from '../../../_utils/global-config';
  import PanelBody from '../body.vue';
  import PanelHeader from '../header.vue';

  defineOptions({ name: 'YearPanel' });

  const props = defineProps({
    headerValue: {
      type: Object as PropType<Dayjs>,
      required: true,
    },
    headerOperations: {
      type: Object as PropType<HeaderOperations>,
      default: () => ({}),
    },
    headerIcons: {
      type: Object as PropType<HeaderIcons>,
      default: () => ({}),
    },
    value: {
      type: Object as PropType<Dayjs>,
    },
    disabledDate: {
      type: Function as PropType<DisabledDate>,
    },
    rangeValues: {
      type: Array as PropType<Array<Dayjs | undefined>>,
    },
  });

  const emit = defineEmits<{
    'select': [_value: Dayjs];
    'cell-mouse-enter': [_value: Dayjs];
  }>();

  const { headerValue } = toRefs(props);
  const prefixCls = computed(() => getPrefixCls('panel-year'));
  const pickerPrefixCls = getPrefixCls('picker');

  const rows = computed(() => getYearRows(headerValue.value));

  const headerTitle = computed(() => getYearHeaderTitle(headerValue.value));

  const isSameTime: IsSameTime = (current, target) => current.isSame(target, 'year');

  function onCellClick(cellData: Cell) {
    emit('select', cellData.value);
  }

  function onCellMouseEnter(cellData: Cell) {
    emit('cell-mouse-enter', cellData.value);
  }
</script>
