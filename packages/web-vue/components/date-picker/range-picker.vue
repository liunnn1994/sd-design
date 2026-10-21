<template>
  <Trigger
    v-if="!hideTrigger"
    trigger="click"
    animation-name="slide-dynamic-origin"
    auto-fit-transform-origin
    :click-to-close="false"
    :popup-offset="4"
    v-bind="triggerProps"
    :floating-options="floatingOptions ?? triggerProps?.floatingOptions"
    :unmount-on-close="unmountOnClose"
    :position="position"
    :disabled="triggerDisabled || !!readonly"
    :popup-visible="panelVisible"
    :popup-container="popupContainer"
    @popupVisibleChange="onPanelVisibleChange"
  >
    <slot
      name="trigger"
      :value="triggerValue"
      :date="triggerDate"
      :display-value="triggerDisplayValue"
      :input-value="inputValue"
      :popup-visible="panelVisible"
      :disabled="triggerDisabled"
      :disabled-inputs="disabledArray"
      :readonly="Boolean(readonly)"
    >
      <slot>
        <DateRangeInput
          ref="refInput"
          v-bind="$attrs"
          v-model:focusedIndex="focusedIndex"
          :size="size"
          :focused="panelVisible"
          :visible="panelVisible"
          :error="error"
          :disabled="disabled"
          :readonly="readonly || disabledInput"
          :allow-clear="mergedAllowClear && !readonly"
          :placeholder="computedPlaceholder"
          :fit-width="fitWidth"
          :max-w-full="maxWFull"
          :fit-width-fallback="fitWidthFallback"
          :fit-width-fallback-text="fitWidthFallbackText"
          :input-props="inputProps"
          :input-value="inputValue"
          :value="panelValue"
          :format="computedFormat"
          @clear="onInputClear"
          @change="onInputChange"
          @pressEnter="onInputPressEnter"
        >
          <template v-if="$slots.prefix" #prefix>
            <slot name="prefix" />
          </template>
          <template #suffix-icon>
            <slot name="suffix-icon">
              <IconCalendar />
            </slot>
          </template>
          <template #separator>
            <slot name="separator">
              {{ separator || '-' }}
            </slot>
          </template>
        </DateRangeInput>
      </slot>
    </slot>
    <template #content>
      <slot name="panelRender" :component="RangePickerPanel" :props="rangePanelProps">
        <component :is="RangePickerPanel" v-bind="rangePanelProps">
          <template v-if="$slots.extra" #extra><slot name="extra" /></template>
          <template v-if="$slots.cell" #cell="scope"><slot name="cell" v-bind="scope" /></template>
        </component>
      </slot>
    </template>
  </Trigger>
  <slot v-else name="panelRender" :component="RangePickerPanel" :props="rangePanelProps">
    <component :is="RangePickerPanel" v-bind="{ ...rangePanelProps, ...$attrs }">
      <template v-if="$slots.extra" #extra><slot name="extra" /></template>
      <template v-if="$slots.cell" #cell="scope"><slot name="cell" v-bind="scope" /></template>
    </component>
  </slot>
</template>
<script setup lang="ts">
  import {
    computed,
    inject,
    nextTick,
    onUnmounted,
    PropType,
    reactive,
    ref,
    toRefs,
    watch,
    watchEffect,
    useSlots,
    shallowRef,
    onBeforeUpdate,
  } from 'vue';

  import { getSelectedHeaderValue } from '@sdata/web-core/date-picker/header';
  import {
    createDateRangeFoundation,
    getDateRangeDisabled,
    getDateRangeFocusedIndex,
    getDateRangeNextIndex,
  } from '@sdata/web-core/date-picker/range-foundation';
  import { Dayjs } from 'dayjs';

  import type { FloatingOptions } from '../_utils/floating';

  import DateRangeInput from '../_components/picker/input-range.vue';
  import { useAllowClear } from '../_hooks/use-allow-clear';
  import { useConfigProviderProp } from '../_hooks/use-config-provider-prop';
  import { useFormItem } from '../_hooks/use-form-item';
  import useMergeState from '../_hooks/use-merge-state';
  import useState from '../_hooks/use-state';
  import { Size } from '../_utils/constant';
  import { dayjs, getNow, getDateValue, initializeDateLocale, toLocal } from '../_utils/date';
  import { getPrefixCls } from '../_utils/global-config';
  import { omit } from '../_utils/omit';
  import pick from '../_utils/pick';
  import { configProviderInjectionKey } from '../config-provider/context';
  import IconCalendar from '../icon/icon-calendar';
  import { useI18n } from '../locale';
  import { TimePickerProps } from '../time-picker/interface';
  import { getFormattedValue } from '../time-picker/utils';
  import Trigger, { TriggerProps } from '../trigger';
  import useFormat from './hooks/use-format';
  import useIsDisabledDate from './hooks/use-is-disabled-date';
  import useProvideDatePickerTransform from './hooks/use-provide-datepicker-transform';
  import useRangeHeaderValue from './hooks/use-range-header-value';
  import useRangePickerState from './hooks/use-range-picker-state';
  import useRangeTimePickerValue from './hooks/use-range-time-picker-value';
  import { getReturnRangeValue } from './hooks/use-value-format';
  import { DisabledTimeProps, ShortcutType, CalendarValue, WeekStart } from './interface';
  import RangePickerPanel from './range-picker-panel.vue';
  import { isCompleteRangeValue } from './utils';

  defineOptions({ name: 'RangePicker', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 范围选择器的类型
     * @en Type of range selector
     * */
    mode: {
      type: String as PropType<'date' | 'year' | 'quarter' | 'month' | 'week'>,
      default: 'date',
    },
    /**
     * @zh 绑定值
     * @en Value
     */
    modelValue: {
      type: Array as PropType<CalendarValue[]>,
    },
    /**
     * @zh 默认值
     * @en Default value
     */
    defaultValue: {
      type: Array as PropType<CalendarValue[]>,
    },
    /**
     * @zh 默认面板显示的日期
     * @en The date displayed in the default panel
     * */
    pickerValue: {
      type: Array as PropType<CalendarValue[]>,
    },
    /**
     * @zh 面板显示的日期
     * @en Date displayed on the panel
     * */
    defaultPickerValue: {
      type: Array as PropType<CalendarValue[]>,
    },
    /**
     * @zh 是否禁用
     * @en Whether to disable
     * */
    disabled: {
      type: [Boolean, Array] as PropType<boolean | boolean[]>,
      default: false,
    },
    /**
     * @zh 每周的第一天开始于周几，0 - 周日，1 - 周一，以此类推。
     * @en The first day of the week starts on the day of the week, 0-Sunday, 1-Monday, and so on.
     * @type 0 | 1 | 2 | 3 | 4 | 5 | 6
     * @version 2-6 from 2.21.0
     */
    dayStartOfWeek: {
      type: Number as PropType<WeekStart>,
      default: 0,
    },
    /**
     * @zh 展示日期的格式，参考[字符串解析格式](#字符串解析格式)
     * @en Display the format of the date, refer to [String Parsing Format](#string-parsing-format)
     * */
    format: {
      type: String,
    },
    /**
     * @zh 值的格式，对 `value` `defaultValue` `pickerValue` `defaultPickerValue` 以及事件中的返回值生效，支持设置为时间戳，Date 和字符串（参考[字符串解析格式](#字符串解析格式)）。如果没有指定，将格式化为字符串，格式同 `format`。
     * @en The format of the value, valid for `value` `defaultValue` `pickerValue` `defaultPickerValue` and the return value in the event, supports setting as timestamp, Date and string (refer to [String parsing format](#string-parsing-format) ). If not specified, it will be formatted as a string, in the same format as `format`.
     * @version 2.16.0
     */
    valueFormat: {
      type: String as PropType<'timestamp' | 'Date' | string>,
    },
    /**
     * @zh 是否增加时间选择
     * @en Whether to increase time selection
     * */
    showTime: {
      type: Boolean,
    },
    /**
     * @zh 时间显示的参数，参考 [TimePickerProps](/vue/component/time-picker)
     * @en Time display parameters, refer to [TimePickerProps](/vue/component/time-picker)
     * */
    timePickerProps: {
      type: Object as PropType<Partial<TimePickerProps>>,
    },
    /**
     * @zh 原生输入框属性
     * @en Native input attributes
     */
    inputProps: {
      type: Array as PropType<Record<string, unknown>[]>,
      default: () => [],
    },
    /**
     * @zh 提示文案
     * @en Prompt copy
     * */
    placeholder: {
      type: Array as PropType<string[]>,
    },
    /**
     * @zh 宽度是否适应文字内容
     * @en Whether the width adapts to the text content
     */
    fitWidth: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 最大宽度是否限制为父容器宽度
     * @en Whether the maximum width is limited to the parent container width
     */
    maxWFull: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 不可选的日期
     * @en Non-selectable date
     * */
    disabledDate: {
      type: Function as PropType<(current: Date, type: 'start' | 'end') => boolean>,
    },
    /**
     * @zh 不可选取的时间
     * @en Unselectable time
     * */
    disabledTime: {
      type: Function as PropType<(current: Date, type: 'start' | 'end') => DisabledTimeProps>,
    },
    /**
     * @zh 范围选择器输入框内的分割符号
     * @en The segmentation symbol in the input box of the range selector
     * */
    separator: {
      type: String,
    },
    /**
     * @zh 时间是否会交换，默认情况下时间会影响和参与开始和结束值的排序，如果要固定时间顺序，可将其关闭。
     * @en Whether the time will be exchanged, by default time will affect and participate in the ordering of start and end values, if you want to fix the time order, you can turn it off.
     * @version 2.25.0
     * */
    exchangeTime: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否固定时间
     * @en Is it a fixed time?
     */
    fixedTime: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 当重新选择范围的时候，会清空之前的范围重新进行选择
     * @en When reselecting the range, the previous range will be cleared for next selection
     */
    clearRangeOnReselect: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 浮层挂载的容器
     * @en Container the popup is mounted into
     */
    popupContainer: {
      type: [String, Object] as PropType<string | HTMLElement>,
    },
    /**
     * @zh 该选择器的语言包覆盖
     * @en Locale override for this picker
     */
    locale: {
      type: Object as PropType<Record<string, unknown>>,
    },
    /**
     * @zh 是否隐藏触发器，仅展示浮层
     * @en Whether to hide the trigger and only show the popup
     */
    hideTrigger: {
      type: Boolean,
    },
    /**
     * @zh 是否允许清除
     * @en Whether the value can be cleared
     */
    allowClear: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否只读，传入字符串时作为提示文案
     * @en Whether the picker is readonly; a string is shown as a tip
     */
    readonly: {
      type: [Boolean, String],
    },
    /**
     * @zh 是否为错误状态
     * @en Whether the picker is in error state
     */
    error: {
      type: Boolean,
    },
    /**
     * @zh 尺寸
     * @en Size of the picker
     */
    size: {
      type: String as PropType<Size>,
    },
    /**
     * @zh 快捷时间范围列表
     * @en List of shortcut time ranges
     */
    shortcuts: {
      type: Array as PropType<ShortcutType[]>,
      default: () => [],
    },
    /**
     * @zh 快捷选项的位置
     * @en Position of the shortcuts panel
     */
    shortcutsPosition: {
      type: String as PropType<'left' | 'bottom' | 'right'>,
      default: 'bottom',
    },
    /**
     * @zh 浮层相对触发器的位置
     * @en Position of the popup relative to the trigger
     */
    position: {
      type: String as PropType<'top' | 'tl' | 'tr' | 'bottom' | 'bl' | 'br'>,
      default: 'bl',
    },
    /**
     * @zh 浮层是否显示（受控）
     * @en Whether the popup is visible (controlled)
     */
    popupVisible: {
      type: Boolean,
      default: undefined,
    },
    /**
     * @zh 浮层是否默认显示（非受控状态）
     * @en Whether the popup is visible by default (uncontrolled state)
     */
    defaultPopupVisible: {
      type: Boolean,
    },
    /**
     * @zh 触发器的组件属性
     * @en Props forwarded to the trigger
     */
    triggerProps: {
      type: Object as PropType<TriggerProps>,
    },
    /**
     * @zh 浮层的定位配置
     * @en Floating options of the popup
     */
    floatingOptions: {
      type: Object as PropType<FloatingOptions>,
    },
    /**
     * @zh 关闭时是否卸载浮层内容
     * @en Whether the popup content is unmounted when closed
     */
    unmountOnClose: {
      type: Boolean,
    },
    /**
     * @zh 面板隐藏不在当前时间范围的灰色日期
     * @en Hide gray dates that are not in the current time range in the panel
     */
    hideNotInViewDates: {
      type: Boolean,
    },
    /**
     * @zh 是否在选择过程中预览快捷范围
     * @en Whether shortcut ranges are previewed while selecting
     */
    previewShortcut: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否显示确定按钮
     * @en Whether the confirm button is shown
     */
    showConfirmBtn: {
      type: Boolean,
    },
    /**
     * @zh 设置时区偏移，如果需要 utc 时间则设置为 0。
     * @en Set the timezone offset. Set to 0 for UTC time.
     */
    utcOffset: {
      type: Number,
    },
    /**
     * @zh 设置时区，如果设置了 `utcOffset`，则以 `utcOffset` 为准。
     * @en Set timezone. If `utcOffset` is set, `utcOffset` takes precedence.
     */
    timezone: {
      type: String,
    },
    /**
     * @zh 是否禁止键盘输入日期
     * @en Whether input is disabled with the keyboard.
     * @version 2.43.0
     */
    disabledInput: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否启用缩写
     * @en Whether to enable abbreviation
     */
    abbreviation: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 组件值发生改变
     * @en The component value changes
     * @param {(Date | string | number | undefined)[] | undefined} value
     * @param {(Date | undefined)[] | undefined} date
     * @param {(string | undefined)[] | undefined} dateString
     */
    'change': [
      value: (CalendarValue | undefined)[] | undefined,
      date: (Date | undefined)[] | undefined,
      dateString: (string | undefined)[] | undefined,
    ];
    'update:modelValue': [value: (CalendarValue | undefined)[] | undefined];
    /**
     * @zh 选中日期发生改变但组件值未改变
     * @en The selected date has changed but the component value has not changed
     * @param {(Date | string | number | undefined)[]} value
     * @param {(Date | undefined)[]} date
     * @param {(string | undefined)[]} dateString
     */
    'select': [
      value: (CalendarValue | undefined)[],
      date: (Date | undefined)[],
      dateString: (string | undefined)[],
    ];
    /**
     * @zh 打开或关闭弹出框
     * @en Open or close the pop-up box
     * @param {boolean} visible
     */
    'popup-visible-change': [visible: boolean];
    'update:popupVisible': [visible: boolean];
    /**
     * @zh 点击确认按钮
     * @en Click the confirm button
     * @param {Date | string | number[]} value
     * @param {Date[]} date
     * @param {string[]} dateString
     */
    'ok': [value: CalendarValue[], date: Date[], dateString: string[]];
    /**
     * @zh 点击清除按钮
     * @en Click the clear button
     */
    'clear': [];
    /**
     * @zh 点击快捷选项
     * @en Click on the shortcut option
     * @param {ShortcutType} shortcut
     */
    'select-shortcut': [shortcut: ShortcutType];
    /**
     * @zh 面板日期改变
     * @en Panel date change
     * @param {Date | string | number[]} value
     * @param {Date[]} date
     * @param {string[]} dateString
     */
    'picker-value-change': [value: CalendarValue[], date: Date[], dateString: string[]];
    'update:pickerValue': [value: CalendarValue[]];
  }>();

  /**
   * @zh 自定义渲染面板
   * @en Customize panel rendering
   * @slot panelRender
   * @binding {Component} component
   * @binding {object} props
   */

  const rawSlots = useSlots();
  const slots = shallowRef({ ...rawSlots });
  onBeforeUpdate(() => {
    slots.value = { ...rawSlots };
  });

  const {
    mode,
    showTime,
    format,
    modelValue,
    defaultValue,
    popupVisible,
    defaultPopupVisible,
    placeholder,
    timePickerProps,
    disabled,
    disabledDate,
    disabledTime,
    locale,
    pickerValue,
    defaultPickerValue,
    valueFormat,
    size,
    error,
    dayStartOfWeek,
    shortcuts,
    shortcutsPosition,
    exchangeTime,
    fixedTime,
    previewShortcut,
    showConfirmBtn,
    allowClear,
    abbreviation,
    utcOffset,
    timezone,
    clearRangeOnReselect,
  } = toRefs(props);

  const { mergedValue: mergedDayStartOfWeek } = useConfigProviderProp(dayStartOfWeek, {
    propNames: ['dayStartOfWeek', 'day-start-of-week'],
    getGlobalValue: (configProviderCtx) => configProviderCtx?.datePicker?.dayStartOfWeek,
  });
  const { mergedValue: mergedShortcuts } = useConfigProviderProp(shortcuts, {
    propNames: ['shortcuts'],
    getGlobalValue: (configProviderCtx) => configProviderCtx?.datePicker?.shortcuts,
  });
  const { mergedValue: mergedShortcutsPosition } = useConfigProviderProp(shortcutsPosition, {
    propNames: ['shortcutsPosition', 'shortcuts-position'],
    getGlobalValue: (configProviderCtx) => configProviderCtx?.datePicker?.shortcutsPosition,
  });
  const { mergedValue: mergedPreviewShortcut } = useConfigProviderProp(previewShortcut, {
    propNames: ['previewShortcut', 'preview-shortcut'],
    getGlobalValue: (configProviderCtx) => configProviderCtx?.datePicker?.previewShortcut,
  });
  const { mergedValue: mergedShowConfirmBtn } = useConfigProviderProp(showConfirmBtn, {
    propNames: ['showConfirmBtn', 'show-confirm-btn'],
    getGlobalValue: (configProviderCtx) => configProviderCtx?.datePicker?.showConfirmBtn,
  });
  const { mergedValue: mergedAbbreviation } = useConfigProviderProp(abbreviation, {
    propNames: ['abbreviation'],
    getGlobalValue: (configProviderCtx) => configProviderCtx?.datePicker?.abbreviation,
  });

  const { locale: globalLocal } = useI18n();
  const configCtx = inject(configProviderInjectionKey, undefined);
  watchEffect(() => {
    initializeDateLocale(globalLocal.value, mergedDayStartOfWeek.value ?? 0);
  });

  const mergedExchangeTime = computed(() => {
    return !(!exchangeTime.value || !(configCtx?.exchangeTime ?? true));
  });
  const { mergedAllowClear } = useAllowClear(allowClear);

  const { mergedDisabled: formDisabled, eventHandlers } = useFormItem({
    size,
    error,
  });

  const datePickerT = useProvideDatePickerTransform(
    reactive({
      locale,
    }),
  );

  const prefixCls = getPrefixCls('picker');
  const emitRangeEvent = emit as {
    (event: 'ok', value: CalendarValue[], date: Date[], dateString: string[]): void;
    (
      event: 'select',
      value: (CalendarValue | undefined)[],
      date: (Date | undefined)[],
      dateString: (string | undefined)[],
    ): void;
  };

  const computedPlaceholder = computed<string[] | undefined>(() => {
    if (placeholder?.value) {
      return placeholder.value.filter((item): item is string => typeof item === 'string');
    }

    return [
      datePickerT(`datePicker.rangePlaceholder.${mode.value}.0`),
      datePickerT(`datePicker.rangePlaceholder.${mode.value}.1`),
    ];
  });

  const {
    format: computedFormat,
    valueFormat: returnValueFormat,
    parseValueFormat,
  } = useFormat(
    reactive({
      mode,
      format,
      showTime,
      valueFormat,
    }),
  );
  const fitWidthFallbackText = computed(() =>
    dayjs(new Date(2000, 0, 1, 0, 0, 0)).format(computedFormat.value),
  );
  const fitWidthFallback = computed(() => `${Array.from(fitWidthFallbackText.value).length}ch`);

  const disabledArray = computed(() => getDateRangeDisabled(disabled.value, formDisabled.value));

  const triggerDisabled = computed(() => disabledArray.value[0] && disabledArray.value[1]);

  const getFocusedIndex = (current = 0) => getDateRangeFocusedIndex(disabledArray.value, current);

  const refInput = ref();
  const focusedIndex = ref(getFocusedIndex());
  watch(disabledArray, () => {
    if (!triggerDisabled.value) {
      focusedIndex.value = getFocusedIndex(focusedIndex.value);
    }
  });
  const nextFocusedIndex = computed(() =>
    getDateRangeNextIndex(disabledArray.value, focusedIndex.value),
  );
  const isNextDisabled = computed(() => disabledArray.value[focusedIndex.value ^ 1]);
  // 选中值
  const { value: selectedValue, setValue: setSelectedValue } = useRangePickerState(
    reactive({
      modelValue,
      defaultValue,
      format: parseValueFormat,
      utcOffset,
      timezone,
    }),
  );
  // 操作值
  const [processValue, setProcessValue] = useState<Array<Dayjs | undefined> | undefined>();
  // 预览值
  const [previewValue, setPreviewValue] = useState<Array<Dayjs | undefined> | undefined>();
  // 待确认的选中值
  const forSelectedValue = computed(() => processValue.value ?? selectedValue.value);
  // 面板显示的值
  const panelValue = computed(
    () => previewValue.value ?? processValue.value ?? selectedValue.value,
  );

  // input 操作的值
  const [inputValue, setInputValue] = useState<Array<string | undefined> | undefined>();
  const triggerLocalValue = computed(() =>
    selectedValue.value?.map((item) =>
      item ? toLocal(item, utcOffset?.value, timezone?.value) : undefined,
    ),
  );
  const triggerValue = computed(() =>
    selectedValue.value
      ? getReturnRangeValue(
          selectedValue.value,
          returnValueFormat.value,
          utcOffset?.value,
          timezone?.value,
        )
      : undefined,
  );
  const triggerDate = computed(
    () => getDateValue(triggerLocalValue.value) as Array<Date | undefined> | undefined,
  );
  const triggerDisplayValue = computed(
    () =>
      (getFormattedValue(triggerLocalValue.value, computedFormat.value) as
        | Array<string | undefined>
        | undefined) ?? [],
  );

  const startHeaderMode = ref<'year' | 'month' | undefined>();

  const endHeaderMode = ref<'year' | 'month' | undefined>();

  const [panelVisible, setLocalPanelVisible] = useMergeState(
    defaultPopupVisible.value,
    reactive({ value: popupVisible }),
  );

  // headerValue is used to generate the content displayed on the panel
  const {
    startHeaderValue,
    endHeaderValue,
    startHeaderOperations,
    endHeaderOperations,
    resetHeaderValue,
    setHeaderValue,
  } = useRangeHeaderValue(
    reactive({
      mode,
      startHeaderMode,
      endHeaderMode,
      value: pickerValue,
      defaultValue: defaultPickerValue,
      selectedValue: panelValue,
      format: parseValueFormat,
      utcOffset,
      timezone,
      onChange: (newVal: Dayjs[]) => {
        const returnValue = getReturnRangeValue(
          newVal,
          returnValueFormat.value,
          utcOffset?.value,
          timezone?.value,
        );
        const localValue = newVal.map((item) => toLocal(item, utcOffset?.value, timezone?.value));
        const formattedValue = getFormattedValue(localValue, parseValueFormat.value) as string[];
        const dateValue = getDateValue(localValue);
        emit('picker-value-change', returnValue, dateValue, formattedValue);
        emit('update:pickerValue', returnValue);
      },
    }),
  );

  function onStartPanelHeaderLabelClick(type: 'year' | 'month') {
    startHeaderMode.value = type;
  }

  function onEndPanelHeaderLabelClick(type: 'year' | 'month') {
    endHeaderMode.value = type;
  }

  function onStartPanelHeaderSelect(date: Dayjs) {
    const newStartValue = getSelectedHeaderValue(
      startHeaderValue.value,
      date,
      startHeaderMode.value,
    );
    setHeaderValue([newStartValue, endHeaderValue.value]);
    startHeaderMode.value = undefined;
  }

  function onEndPanelHeaderSelect(date: Dayjs) {
    const newEndValue = getSelectedHeaderValue(endHeaderValue.value, date, endHeaderMode.value);
    setHeaderValue([startHeaderValue.value, newEndValue]);
    endHeaderMode.value = undefined;
  }

  const footerValue = ref([
    panelValue.value[0] || getNow(utcOffset?.value, timezone?.value),
    panelValue.value[1] || getNow(utcOffset?.value, timezone?.value),
  ]);
  watch(panelValue, () => {
    const [value0, value1] = panelValue.value;
    footerValue.value[0] = value0 || footerValue.value[0];
    footerValue.value[1] = value1 || footerValue.value[1];
  });

  const [timePickerValue, setTimePickerValue, resetTimePickerValue] = useRangeTimePickerValue(
    reactive({
      timePickerProps,
      selectedValue: panelValue,
    }),
  );

  const isDateTime = computed(() => mode.value === 'date' && showTime.value);
  const hasTime = computed(() => isDateTime.value || timePickerProps?.value);

  const isDisabledDate = useIsDisabledDate(
    reactive({
      mode,
      isRange: true,
      showTime,
      disabledDate,
      disabledTime,
    }),
  );

  // needConfirm logic
  const needConfirm = computed(() => isDateTime.value || mergedShowConfirmBtn.value);
  const confirmBtnDisabled = computed(
    () =>
      needConfirm.value &&
      (!isCompleteRangeValue(forSelectedValue.value) ||
        isDisabledDate(forSelectedValue.value[0], 'start') ||
        isDisabledDate(forSelectedValue.value[1], 'end')),
  );

  watch(
    () => props.modelValue,
    () => foundation.onModelChange(),
    { deep: true },
  );
  watch(panelVisible, (visible) => foundation.onVisibilityChange(visible));

  watch(focusedIndex, () => {
    if (props.disabledInput) {
      focusInput(focusedIndex.value);
      setInputValue(undefined);
    }
  });

  let clearShortcutPreviewTimer: ReturnType<typeof setTimeout> | undefined;
  onUnmounted(() => {
    clearTimeout(clearShortcutPreviewTimer);
  });

  function focusInput(index?: number) {
    refInput.value && refInput.value.focus && refInput.value.focus(index);
  }

  const foundation = createDateRangeFoundation<ShortcutType>({
    get selectedValue() {
      return selectedValue.value;
    },
    get processValue() {
      return processValue.value;
    },
    get panelValue() {
      return panelValue.value;
    },
    get inputValue() {
      return inputValue.value;
    },
    get timeValue() {
      return timePickerValue.value;
    },
    get focusedIndex() {
      return focusedIndex.value;
    },
    get nextFocusedIndex() {
      return nextFocusedIndex.value;
    },
    get isNextDisabled() {
      return isNextDisabled.value;
    },
    get disabled() {
      return triggerDisabled.value;
    },
    get disabledInputs() {
      return disabledArray.value;
    },
    get needConfirm() {
      return !!needConfirm.value;
    },
    get hasTime() {
      return !!hasTime.value;
    },
    get exchangeTime() {
      return mergedExchangeTime.value;
    },
    get fixedTime() {
      return fixedTime.value;
    },
    get clearRangeOnReselect() {
      return clearRangeOnReselect.value;
    },
    get returnFormat() {
      return returnValueFormat.value;
    },
    get parseFormat() {
      return parseValueFormat.value;
    },
    get format() {
      return computedFormat.value;
    },
    get utcOffset() {
      return utcOffset?.value;
    },
    get timezone() {
      return timezone?.value;
    },
    get readonly() {
      return !!props.readonly;
    },
    get visible() {
      return panelVisible.value;
    },
    setSelectedValue,
    setProcessValue,
    setPreviewValue,
    setInputValue,
    setTimePickerValue,
    setFocusedIndex: (index) => {
      focusedIndex.value = index;
    },
    resetHeaderModes: () => {
      startHeaderMode.value = undefined;
      endHeaderMode.value = undefined;
    },
    resetHeaderValue,
    isDisabledDate,
    resetTimeValue: resetTimePickerValue,
    focusInput,
    afterRender: (task) => {
      nextTick(task);
    },
    setVisible: setLocalPanelVisible,
    onUpdateValue: (value) => emit('update:modelValue', value),
    onChange: (value, date, formatted) => emit('change', value, date, formatted),
    onOk: (value, date, formatted) => emitRangeEvent('ok', value, date, formatted),
    onSelect: (value, date, formatted) => emitRangeEvent('select', value, date, formatted),
    onShortcut: (shortcut) => emit('select-shortcut', shortcut),
    onClear: () => emit('clear'),
    onFormChange: () => eventHandlers.value?.onChange?.(),
    onPopupChange: (visible) => emit('popup-visible-change', visible),
    onUpdatePopup: (visible) => emit('update:popupVisible', visible),
    cancelPreviewClear: () => clearTimeout(clearShortcutPreviewTimer),
    schedulePreviewClear: (task) => {
      clearShortcutPreviewTimer = setTimeout(task, 100);
    },
  });
  const {
    onPanelVisibleChange,
    onPanelCellMouseEnter,
    onPanelCellClick,
    onTimePickerSelect,
    onPanelShortcutMouseEnter,
    onPanelShortcutMouseLeave,
    onPanelShortcutClick,
    onPanelConfirm,
    onInputPressEnter,
  } = foundation;
  const onInputChange = (event: Event) =>
    foundation.onInputChange((event.target as HTMLInputElement).value);
  const onInputClear = (event: Event) => {
    event.stopPropagation();
    foundation.onInputClear();
  };

  const computedTimePickerProps = computed(() => ({
    format: computedFormat.value,
    ...omit(timePickerProps?.value || {}, ['defaultValue']),
    visible: panelVisible.value,
  }));

  const headerIcons = computed(() => ({
    prev: slots.value['icon-prev'],
    prevDouble: slots.value['icon-prev-double'],
    next: slots.value['icon-next'],
    nextDouble: slots.value['icon-next-double'],
  }));

  const startHeaderProps = reactive({
    headerValue: startHeaderValue,
    headerOperations: startHeaderOperations,
    headerIcons,
  });

  const endHeaderProps = reactive({
    headerValue: endHeaderValue,
    headerOperations: endHeaderOperations,
    headerIcons,
  });

  const rangePanelProps = computed(() => ({
    ...pick(props, [
      'mode',
      'showTime',
      'disabledDate',
      'disabledTime',
      'hideTrigger',
      'hideNotInViewDates',
      'utcOffset',
      'timezone',
    ]),
    shortcuts: mergedShortcuts.value,
    shortcutsPosition: mergedShortcutsPosition.value,
    dayStartOfWeek: mergedDayStartOfWeek.value,
    abbreviation: mergedAbbreviation.value,
    prefixCls,
    now: getNow(utcOffset?.value, timezone?.value),
    format: parseValueFormat.value,
    value: panelValue.value,
    showConfirmBtn: needConfirm.value,
    confirmBtnDisabled: confirmBtnDisabled.value,
    timePickerValue: timePickerValue.value,
    timePickerProps: computedTimePickerProps.value,
    startHeaderProps,
    endHeaderProps,
    footerValue: footerValue.value,
    disabled: disabledArray.value,
    visible: panelVisible.value,
    onCellClick: onPanelCellClick,
    onCellMouseEnter: onPanelCellMouseEnter,
    onShortcutClick: onPanelShortcutClick,
    onShortcutMouseEnter: mergedPreviewShortcut.value ? onPanelShortcutMouseEnter : undefined,
    onShortcutMouseLeave: mergedPreviewShortcut.value ? onPanelShortcutMouseLeave : undefined,
    onConfirm: onPanelConfirm,
    onTimePickerSelect,
    startHeaderMode: startHeaderMode.value,
    endHeaderMode: endHeaderMode.value,
    onStartHeaderLabelClick: onStartPanelHeaderLabelClick,
    onEndHeaderLabelClick: onEndPanelHeaderLabelClick,
    onStartHeaderSelect: onStartPanelHeaderSelect,
    onEndHeaderSelect: onEndPanelHeaderSelect,
  }));
</script>
