import type { TimeValue } from '@sdata/web-core/time-picker/types';
import type { Dayjs } from 'dayjs';

import { getDayjsValue } from '@sdata/web-core/_utils/date';
import {
  createRangeTimePickerValueFoundation,
  createTimePickerValueFoundation,
  getSideTimePickerProps,
} from '@sdata/web-core/date-picker/time-value';
import { resolveTimeFormat } from '@sdata/web-core/time-picker/values';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { TimePickerProps } from '../time-picker/types.js';

type SingleTimeProps = Pick<TimePickerProps, 'format' | 'use12Hours'> & {
  defaultValue?: TimeValue;
};

export function useDateTimeValue(selectedValue: Dayjs | undefined, props?: SingleTimeProps) {
  const format = resolveTimeFormat(props?.format, undefined, props?.use12Hours);
  const defaultValue = useMemo(
    () => getDayjsValue(props?.defaultValue, format),
    [props?.defaultValue, format],
  );
  const current = useRef({ selectedValue, defaultValue });
  current.current = { selectedValue, defaultValue };
  const [foundation] = useState<ReturnType<typeof createTimePickerValueFoundation>>(() =>
    createTimePickerValueFoundation({
      get selectedValue() {
        return current.current.selectedValue;
      },
      get defaultValue() {
        return current.current.defaultValue;
      },
      get value(): Dayjs {
        return currentValue.current;
      },
      set value(next: Dayjs) {
        setValue(next);
      },
    }),
  );
  const [value, setValue] = useState<Dayjs>(foundation.getDefaultValue);
  const currentValue = useRef<Dayjs>(value);
  currentValue.current = value;
  useLayoutEffect(() => {
    foundation.setTimePickerValue(selectedValue);
  }, [selectedValue, foundation]);
  return {
    value,
    setValue: foundation.setTimePickerValue,
    resetValue: foundation.resetTimePickerValue,
  };
}

export function useRangeDateTimeValue(
  selectedValue: Array<Dayjs | undefined> | undefined,
  props?: Partial<TimePickerProps>,
) {
  const state = { props, defaultValue: props?.defaultValue };
  const start = useDateTimeValue(
    selectedValue?.[0],
    getSideTimePickerProps(state, 0) as SingleTimeProps | undefined,
  );
  const end = useDateTimeValue(
    selectedValue?.[1],
    getSideTimePickerProps(state, 1) as SingleTimeProps | undefined,
  );
  const [foundation] = useState<ReturnType<typeof createRangeTimePickerValueFoundation>>(() =>
    createRangeTimePickerValueFoundation({
      setStartTimeValue: start.setValue,
      setEndTimeValue: end.setValue,
      resetStartTimeValue: start.resetValue,
      resetEndTimeValue: end.resetValue,
    }),
  );
  return {
    value: [start.value, end.value],
    setValue: foundation.setTimeValue,
    resetValue: foundation.resetTimeValue,
  };
}
