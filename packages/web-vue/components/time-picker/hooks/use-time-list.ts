// 生成时分秒的列数据，用于展示选项

import { toRefs, computed, ComputedRef } from 'vue';

import { padStart } from '../../_utils/pad';
import { PanelProps, TimeList } from '../interface';
import { getColumnsFromFormat } from '../utils';

interface TimeListProps extends Pick<
  PanelProps,
  | 'format'
  | 'step'
  | 'use12Hours'
  | 'disabledHours'
  | 'disabledMinutes'
  | 'disabledSeconds'
  | 'hideDisabledOptions'
> {
  selectedHour: number | undefined;
  selectedMinute: number | undefined;
  selectedSecond: number | undefined;
  selectedAmpm: string;
  disabled?: boolean;
}

export default function useTimeList(props: TimeListProps): {
  hours: ComputedRef<TimeList>;
  minutes: ComputedRef<TimeList>;
  seconds: ComputedRef<TimeList>;
  ampmList: ComputedRef<TimeList>;
} {
  const {
    format,
    step,
    use12Hours,
    hideDisabledOptions,
    disabledHours,
    disabledMinutes,
    disabledSeconds,
    selectedHour,
    selectedMinute,
    selectedSecond,
    selectedAmpm,
    disabled,
  } = toRefs(props);

  const getHour = (hour: number) =>
    use12Hours.value ? (hour % 12) + (selectedAmpm.value === 'pm' ? 12 : 0) : hour;
  const selectedHour24 = computed(() =>
    selectedHour.value === undefined ? undefined : getHour(selectedHour.value),
  );

  const getStep = (value = 1) => (Number.isInteger(value) && value > 0 ? value : 1);

  // 小时
  const hours = computed(() => {
    const { hour: hourStep = 1 } = step?.value || {};
    const disabledList = disabledHours?.value?.() || [];
    let list = [];
    for (let i = 0; i < (use12Hours.value ? 12 : 24); i += getStep(hourStep)) {
      list.push(i);
    }
    if (use12Hours.value) {
      list[0] = 12;
    }
    if (hideDisabledOptions.value && disabledList.length) {
      list = list.filter((h) => disabledList.indexOf(getHour(h)) < 0);
    }
    return list.map((h) => ({
      label: padStart(h, 2, '0'),
      value: h,
      selected: selectedHour.value === h,
      disabled: disabled?.value || disabledList.includes(getHour(h)),
    }));
  });

  // 分钟
  const minutes = computed(() => {
    const { minute: minuteStep = 1 } = step?.value || {};
    const disabledList = disabledMinutes?.value?.(selectedHour24.value) || [];
    let list = [];
    for (let i = 0; i < 60; i += getStep(minuteStep)) {
      list.push(i);
    }
    if (hideDisabledOptions.value && disabledList.length) {
      list = list.filter((m) => disabledList.indexOf(m) < 0);
    }
    return list.map((m) => ({
      label: padStart(m, 2, '0'),
      value: m,
      selected: selectedMinute.value === m,
      disabled: disabled?.value || disabledList.includes(m),
    }));
  });

  // 秒
  const seconds = computed(() => {
    const { second: secondStep = 1 } = step?.value || {};
    const disabledList = disabledSeconds?.value?.(selectedHour24.value, selectedMinute.value) || [];
    let list = [];
    for (let i = 0; i < 60; i += getStep(secondStep)) {
      list.push(i);
    }
    if (hideDisabledOptions.value && disabledList.length) {
      list = list.filter((s) => disabledList.indexOf(s) < 0);
    }
    return list.map((s) => ({
      label: padStart(s, 2, '0'),
      value: s,
      selected: selectedSecond.value === s,
      disabled: disabled?.value || disabledList.includes(s),
    }));
  });

  // ampm
  const AMPM = ['am', 'pm'];
  const ampmList = computed(() => {
    const isUpperCase = getColumnsFromFormat(format.value).list.includes('A');
    return AMPM.map((a) => ({
      label: isUpperCase ? a.toUpperCase() : a,
      value: a,
      selected: selectedAmpm.value === a,
      disabled: disabled?.value,
    }));
  });

  return {
    hours,
    minutes,
    seconds,
    ampmList,
  };
}
