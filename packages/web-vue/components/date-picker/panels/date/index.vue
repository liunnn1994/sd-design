<template>
  <div :class="classNames">
    <div v-if="showDateView" :class="`${prefixCls}-inner`">
      <PanelHeader
        v-bind="{
          ...headerOperations,
          icons: headerIcons,
        }"
        :prefix-cls="pickerPrefixCls"
        :title="headerTitle"
        :mode="mode"
        :value="headerValue"
        :on-label-click="onHeaderLabelClick"
      />
      <PanelWeekList :prefix-cls="pickerPrefixCls" :week-list="mergedWeekList" />
      <PanelBody
        :mode="mode"
        :prefix-cls="pickerPrefixCls"
        :rows="rows"
        :value="isRange ? undefined : value"
        :range-values="rangeValues"
        :hide-not-in-view-dates="hideNotInViewDates"
        :disabled-date="disabledDate"
        :is-same-time="mergedIsSameTime"
        :now="panelNow"
        @cellClick="onCellClick"
        @cellMouseEnter="onCellMouseEnter"
      >
        <template #cell="scope"><slot name="cell" v-bind="scope" /></template>
      </PanelBody>
    </div>
    <div v-if="showTimeView" :class="`${prefixCls}-timepicker`">
      <header :class="`${prefixCls}-timepicker-title`">{{
        datePickerT('datePicker.selectTime')
      }}</header>
      <TimePanel
        v-bind="mergedTimePanelProps"
        hide-footer
        :value="value || isRange ? timePickerValue : undefined"
        :disabled="disabled"
        @select="onTimePanelSelect"
      />
    </div>
    <div v-if="showViewTabs" :class="`${prefixCls}-footer`">
      <div :class="`${prefixCls}-view-tabs`">
        <div
          :class="[
            `${prefixCls}-view-tab-pane`,
            { [`${prefixCls}-view-tab-pane-active`]: showDateView },
          ]"
          @click="() => changeViewTo('date')"
        >
          <IconCalendar />
          <span :class="`${prefixCls}-view-tab-pane-text`">
            {{ footerValue && footerValue.format('YYYY-MM-DD') }}
          </span>
        </div>
        <div
          :class="[
            `${prefixCls}-view-tab-pane`,
            { [`${prefixCls}-view-tab-pane-active`]: showTimeView },
          ]"
          @click="() => changeViewTo('time')"
        >
          <IconClockCircle />
          <span :class="`${prefixCls}-view-tab-pane-text`">
            {{ timePickerValue && timePickerValue.format('HH:mm:ss') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType, reactive, toRefs } from 'vue';

  import { getDateRows, getDateWeekList } from '@sdata/web-core/date-picker/calendar';
  import { Dayjs } from 'dayjs';

  import type { PanelProps, TimePickerProps } from '../../../time-picker/interface';
  import type {
    Cell,
    DisabledDate,
    DisabledTime,
    HeaderIcons,
    HeaderOperations,
    IsSameTime,
    Mode,
    WeekStart,
  } from '../../interface';

  import useMergeState from '../../../_hooks/use-merge-state';
  import { getDateValue, getNow } from '../../../_utils/date';
  import { getPrefixCls } from '../../../_utils/global-config';
  import IconCalendar from '../../../icon/icon-calendar';
  import IconClockCircle from '../../../icon/icon-clock-circle';
  import TimePanel from '../../../time-picker/panel.vue';
  import useDatePickerTransform from '../../hooks/use-inject-datepicker-transform';
  import PanelBody from '../body.vue';
  import PanelHeader, { HeaderLabelClickFunc } from '../header.vue';
  import PanelWeekList from '../week-list.vue';

  defineOptions({ name: 'DatePanel' });

  const props = defineProps({
    isRange: {
      type: Boolean,
    },
    value: {
      type: Object as PropType<Dayjs>,
    },
    rangeValues: {
      type: Array as PropType<Array<Dayjs | undefined>>,
    },
    headerValue: {
      type: Object as PropType<Dayjs>,
      required: true,
    },
    footerValue: {
      type: Object as PropType<Dayjs>,
    },
    timePickerValue: {
      type: Object as PropType<Dayjs>,
    },
    headerOperations: {
      type: Object as PropType<HeaderOperations>,
      default: () => ({}),
    },
    headerIcons: {
      type: Object as PropType<HeaderIcons>,
      default: () => ({}),
    },
    dayStartOfWeek: {
      type: Number as PropType<WeekStart>,
      default: 0,
    },
    disabledDate: {
      type: Function as PropType<DisabledDate>,
    },
    disabledTime: {
      type: Function as PropType<DisabledTime>,
    },
    isSameTime: {
      type: Function as PropType<IsSameTime>,
    },
    mode: {
      type: String as PropType<Mode>,
      default: 'date',
    },
    showTime: {
      type: Boolean,
    },
    timePickerProps: {
      type: Object as PropType<Partial<TimePickerProps>>,
    },
    currentView: {
      type: String as PropType<'date' | 'time'>,
    },
    disabled: {
      type: Boolean,
    },
    hideNotInViewDates: {
      type: Boolean,
    },
    now: {
      type: Object as PropType<Dayjs>,
    },
    onHeaderLabelClick: {
      type: Function as PropType<HeaderLabelClickFunc>,
    },
  });

  const emit = defineEmits<{
    'select': [_value: Dayjs];
    'time-picker-select': [_time: Dayjs];
    'cell-mouse-enter': [_value: Dayjs];
    'current-view-change': [_newView: 'date' | 'time'];
    'update:currentView': [_newView: 'date' | 'time'];
  }>();

  const {
    isRange,
    headerValue,
    footerValue,
    dayStartOfWeek,
    isSameTime,
    mode,
    showTime,
    currentView,
    disabledTime,
    timePickerProps,
    hideNotInViewDates,
    now,
  } = toRefs(props);

  const datePickerT = useDatePickerTransform();

  const isWeek = computed(() => mode?.value === 'week');

  const prefixCls = computed(() => getPrefixCls(isWeek.value ? 'panel-week' : 'panel-date'));

  const pickerPrefixCls = getPrefixCls('picker');

  const [localCurrentView, setLocalCurrentView] = useMergeState(
    'date',
    reactive({ value: currentView }),
  );

  const showViewTabs = computed(() => showTime.value && isRange.value);

  const showDateView = computed(
    () => !showTime.value || !showViewTabs.value || localCurrentView.value === 'date',
  );

  const showTimeView = computed(
    () => showTime.value && (!showViewTabs.value || localCurrentView.value === 'time'),
  );

  const panelNow = computed(() => now?.value || getNow());

  const classNames = computed(() => [
    prefixCls.value,
    {
      [`${prefixCls.value}-with-view-tabs`]: showViewTabs.value,
    },
  ]);

  const headerTitle = computed(() => headerValue.value.format('YYYY-MM'));

  const disabledTimeProps = computed(
    () =>
      (showTime.value &&
        disabledTime?.value?.(getDateValue(footerValue?.value || panelNow.value))) ||
      {},
  );
  const mergedTimePanelProps = computed<Partial<PanelProps>>(() => ({
    format: timePickerProps?.value?.format,
    use12Hours: timePickerProps?.value?.use12Hours,
    step: timePickerProps?.value?.step,
    hideDisabledOptions: timePickerProps?.value?.hideDisabledOptions,
    disabledHours: timePickerProps?.value?.disabledHours,
    disabledMinutes: timePickerProps?.value?.disabledMinutes,
    disabledSeconds: timePickerProps?.value?.disabledSeconds,
    ...disabledTimeProps.value,
  }));

  const weekList = computed(() => getDateWeekList(dayStartOfWeek.value));

  const mergedWeekList = computed(() => (isWeek.value ? [-1, ...weekList.value] : weekList.value));

  const rows = computed(() =>
    getDateRows({
      headerValue: headerValue.value,
      weekList: weekList.value,
      isWeek: isWeek.value,
      hideNotInViewDates: hideNotInViewDates.value,
      prefixCls: pickerPrefixCls,
    }),
  );

  const mergedIsSameTime = computed(
    () =>
      isSameTime?.value ||
      ((current: Dayjs, target: Dayjs) => {
        return current.isSame(target, 'day');
      }),
  );

  function onCellClick(cellData: Cell) {
    emit('select', cellData.value);
  }

  function onTimePanelSelect(time: Dayjs) {
    emit('time-picker-select', time);
  }

  function onCellMouseEnter(cellData: Cell) {
    emit('cell-mouse-enter', cellData.value);
  }

  const changeViewTo = (newView: 'date' | 'time') => {
    emit('current-view-change', newView);
    emit('update:currentView', newView);
    setLocalCurrentView(newView);
  };
</script>
