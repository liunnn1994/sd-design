import type { Dayjs } from 'dayjs';

import type { TimeValue } from '../time-picker/types.js';

import { getNow } from '../_utils/date.js';
import { isArray } from '../_utils/is.js';

export interface TimePickerValueState {
  readonly selectedValue: Dayjs | undefined;
  readonly defaultValue: Dayjs | undefined;
  value: Dayjs;
}
export function createTimePickerValueFoundation(state: TimePickerValueState) {
  const getDefaultValue = () => state.selectedValue || state.defaultValue || getNow();

  function setTimePickerValue(val: Dayjs | undefined) {
    if (val) {
      state.value = val;
    }
  }

  function resetTimePickerValue() {
    state.value = getDefaultValue();
  }

  return { getDefaultValue, setTimePickerValue, resetTimePickerValue };
}

export function getSideTimePickerProps<Props extends object | undefined>(
  state: { readonly props: Props; readonly defaultValue: TimeValue | TimeValue[] | undefined },
  index: number,
) {
  return isArray(state.defaultValue)
    ? { ...state.props, defaultValue: state.defaultValue[index] }
    : state.props;
}

export function createRangeTimePickerValueFoundation({
  setStartTimeValue,
  setEndTimeValue,
  resetStartTimeValue,
  resetEndTimeValue,
}: {
  setStartTimeValue: (value: Dayjs | undefined) => void;
  setEndTimeValue: (value: Dayjs | undefined) => void;
  resetStartTimeValue: () => void;
  resetEndTimeValue: () => void;
}) {
  function setTimeValue(val: Array<Dayjs | undefined> | undefined) {
    if (!val) return;
    setStartTimeValue(val[0]);
    setEndTimeValue(val[1]);
  }

  function resetTimeValue() {
    resetStartTimeValue();
    resetEndTimeValue();
  }

  return { setTimeValue, resetTimeValue };
}
