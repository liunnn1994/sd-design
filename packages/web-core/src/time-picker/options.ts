import type { PanelProps, TimeList } from './types.js';

import { padStart } from '../_utils/pad.js';
import { getColumnsFromFormat } from './values.js';

export interface TimeListProps extends Pick<
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

export function getTimeHours(props: TimeListProps): TimeList {
  const getStep = (value = 1) => (Number.isInteger(value) && value > 0 ? value : 1);
  const getHour = (hour: number) =>
    props.use12Hours ? (hour % 12) + (props.selectedAmpm === 'pm' ? 12 : 0) : hour;

  const { hour: hourStep = 1 } = props.step || {};
  const disabledList = props.disabledHours?.() || [];
  let list = [];
  for (let i = 0; i < (props.use12Hours ? 12 : 24); i += getStep(hourStep)) {
    list.push(i);
  }
  if (props.use12Hours) {
    list[0] = 12;
  }
  if (props.hideDisabledOptions && disabledList.length) {
    list = list.filter((h) => disabledList.indexOf(getHour(h)) < 0);
  }
  return list.map((h) => ({
    label: padStart(h, 2, '0'),
    value: h,
    selected: props.selectedHour === h,
    disabled: props.disabled || disabledList.includes(getHour(h)),
  }));
}
export function getTimeMinutes(props: TimeListProps): TimeList {
  const getStep = (value = 1) => (Number.isInteger(value) && value > 0 ? value : 1);
  const getHour = (hour: number) =>
    props.use12Hours ? (hour % 12) + (props.selectedAmpm === 'pm' ? 12 : 0) : hour;
  const selectedHour24 = props.selectedHour === undefined ? undefined : getHour(props.selectedHour);

  const { minute: minuteStep = 1 } = props.step || {};
  const disabledList = props.disabledMinutes?.(selectedHour24) || [];
  let list = [];
  for (let i = 0; i < 60; i += getStep(minuteStep)) {
    list.push(i);
  }
  if (props.hideDisabledOptions && disabledList.length) {
    list = list.filter((m) => disabledList.indexOf(m) < 0);
  }
  return list.map((m) => ({
    label: padStart(m, 2, '0'),
    value: m,
    selected: props.selectedMinute === m,
    disabled: props.disabled || disabledList.includes(m),
  }));
}
export function getTimeSeconds(props: TimeListProps): TimeList {
  const getStep = (value = 1) => (Number.isInteger(value) && value > 0 ? value : 1);
  const getHour = (hour: number) =>
    props.use12Hours ? (hour % 12) + (props.selectedAmpm === 'pm' ? 12 : 0) : hour;
  const selectedHour24 = props.selectedHour === undefined ? undefined : getHour(props.selectedHour);

  const { second: secondStep = 1 } = props.step || {};
  const disabledList = props.disabledSeconds?.(selectedHour24, props.selectedMinute) || [];
  let list = [];
  for (let i = 0; i < 60; i += getStep(secondStep)) {
    list.push(i);
  }
  if (props.hideDisabledOptions && disabledList.length) {
    list = list.filter((s) => disabledList.indexOf(s) < 0);
  }
  return list.map((s) => ({
    label: padStart(s, 2, '0'),
    value: s,
    selected: props.selectedSecond === s,
    disabled: props.disabled || disabledList.includes(s),
  }));
}
export function getTimeAmpm(props: TimeListProps): TimeList {
  const AMPM = ['am', 'pm'];

  const isUpperCase = getColumnsFromFormat(props.format).list.includes('A');
  return AMPM.map((a) => ({
    label: isUpperCase ? a.toUpperCase() : a,
    value: a,
    selected: props.selectedAmpm === a,
    disabled: props.disabled,
  }));
}
