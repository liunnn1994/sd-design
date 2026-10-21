<template>
  <div :class="prefixCls">
    <TimeColumn
      v-if="columns.includes('H') || columns.includes('h')"
      :value="selectedHour"
      :list="hours"
      :prefix-cls="prefixCls"
      :visible="visible"
      @select="
        (value) => {
          onSelect(value, 'hour');
        }
      "
    />
    <TimeColumn
      v-if="columns.includes('m')"
      :value="selectedMinute"
      :list="minutes"
      :prefix-cls="prefixCls"
      :visible="visible"
      @select="
        (value) => {
          onSelect(value, 'minute');
        }
      "
    />
    <TimeColumn
      v-if="columns.includes('s')"
      :value="selectedSecond"
      :list="seconds"
      :prefix-cls="prefixCls"
      :visible="visible"
      @select="
        (value) => {
          onSelect(value, 'second');
        }
      "
    />
    <TimeColumn
      v-if="computedUse12Hours"
      :value="selectedAmpm"
      :list="ampmList"
      :prefix-cls="prefixCls"
      :visible="visible"
      @select="
        (value) => {
          onSelect(value, 'ampm');
        }
      "
    />
  </div>
  <div v-if="$slots['extra-footer']" :class="`${prefixCls}-footer-extra-wrapper`">
    <slot name="extra-footer"></slot>
  </div>
  <div v-if="!hideFooter" :class="`${prefixCls}-footer-btn-wrapper`">
    <Button v-if="!isRange" size="mini" :disabled="disabled" @click="onSelectNow">
      {{ t('datePicker.now') }}
    </Button>
    <Button
      type="primary"
      size="mini"
      :disabled="disabled || confirmBtnDisabled || !selectedValue"
      @click="onConfirm"
    >
      {{ t('datePicker.ok') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { computed, PropType, reactive, ref, toRefs, watch } from 'vue';

  import {
    getSelectedTimeHour,
    getSelectedTimeAmpm,
    getSelectedTime,
  } from '@sdata/web-core/time-picker/panel';
  import { Dayjs } from 'dayjs';

  import type { PanelProps } from './interface';

  import { dayjs } from '../_utils/date';
  import { getPrefixCls } from '../_utils/global-config';
  import { isUndefined } from '../_utils/is';
  import Button from '../button';
  import { useI18n } from '../locale';
  import useIsDisabledTime from './hooks/use-is-disabled-time';
  import useTimeFormat from './hooks/use-time-format';
  import useTimeList from './hooks/use-time-list';
  import TimeColumn from './time-column.vue';

  defineOptions({ name: 'TimePickerPanel' });

  const props = defineProps({
    value: {
      type: Object as PropType<PanelProps['value']>,
    },
    visible: {
      type: Boolean,
    },
    format: {
      type: String,
      default: 'HH:mm:ss',
    },
    use12Hours: {
      type: Boolean,
    },
    step: {
      type: Object as PropType<PanelProps['step']>,
    },
    disabledHours: {
      type: Function as unknown as PropType<PanelProps['disabledHours']>,
    },
    disabledMinutes: {
      type: Function as unknown as PropType<PanelProps['disabledMinutes']>,
    },
    disabledSeconds: {
      type: Function as unknown as PropType<PanelProps['disabledSeconds']>,
    },
    hideDisabledOptions: {
      type: Boolean,
    },
    hideFooter: {
      type: Boolean,
    },
    isRange: {
      type: Boolean,
    },
    disabled: {
      type: Boolean,
    },
  });

  const emit = defineEmits<{
    // 每点击一个时间就会触发该事件（还没点击确定，时间只能展示但未生效）
    select: [_value: Dayjs];
    // 确认选择之后触发该事件
    confirm: [_value: Dayjs];
  }>();

  const {
    value,
    visible,
    format,
    step,
    use12Hours,
    hideDisabledOptions,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    disabled,
  } = toRefs(props);

  const prefixCls = getPrefixCls('timepicker');
  const { t } = useI18n();

  const {
    columns,
    use12Hours: computedUse12Hours,
    format: computedFormat,
  } = useTimeFormat(
    reactive({
      format,
      use12Hours,
    }),
  );

  const selectedValue = ref<Dayjs | undefined>(value?.value);
  const setSelectedValue = (value: Dayjs | undefined) => {
    selectedValue.value = value;
  };
  // Synchronize selectedValue every time you open or change the value
  watch([visible, value], () => {
    if (!visible.value) return;
    setSelectedValue(value?.value);
  });

  const selectedHour = computed(() =>
    getSelectedTimeHour(selectedValue.value, computedUse12Hours.value),
  );
  const selectedMinute = computed(() => selectedValue.value?.minute());
  const selectedSecond = computed(() => selectedValue.value?.second());
  const selectedAmpm = computed(() => getSelectedTimeAmpm(selectedValue.value));

  const { hours, minutes, seconds, ampmList } = useTimeList(
    reactive({
      format: computedFormat,
      step,
      use12Hours: computedUse12Hours,
      hideDisabledOptions,
      disabledHours,
      disabledMinutes,
      disabledSeconds,
      selectedHour,
      selectedMinute,
      selectedSecond,
      selectedAmpm,
      disabled,
    }),
  );

  const isDisabledTime = useIsDisabledTime(
    reactive({
      disabledHours,
      disabledMinutes,
      disabledSeconds,
    }),
  );
  const confirmBtnDisabled = computed(() => isDisabledTime(selectedValue.value));

  function emitConfirm(value: Dayjs | undefined) {
    if (isUndefined(value)) return;
    emit('confirm', value);
  }

  function emitSelect(value: Dayjs) {
    setSelectedValue(value);
    emit('select', value);
  }

  // 选中谁就更新谁
  function onSelect(value: number | string, type: 'hour' | 'minute' | 'second' | 'ampm' = 'hour') {
    const newValue = getSelectedTime(selectedValue.value, value, type, computedUse12Hours.value);
    emitSelect(newValue);
  }

  const onSelectNow = () => {
    const newValue = dayjs(new Date());
    emitSelect(newValue);
  };

  const onConfirm = () => {
    emitConfirm(selectedValue.value);
  };
</script>
