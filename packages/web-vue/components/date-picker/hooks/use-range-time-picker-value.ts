import { reactive, toRefs, computed, ComputedRef } from 'vue';

import {
  createRangeTimePickerValueFoundation,
  getSideTimePickerProps,
} from '@sdata/web-core/date-picker/time-value';
import { Dayjs } from 'dayjs';

import { TimePickerProps } from '../../time-picker/interface';
import useTimePickerValue from './use-time-picker-value';

interface RangeTimePickerValueProps {
  timePickerProps?: Partial<TimePickerProps>;
  selectedValue: Array<Dayjs | undefined> | undefined;
}
export default function useRangeTimePickerValue(
  props: RangeTimePickerValueProps,
): [ComputedRef<Dayjs[]>, (val: Array<Dayjs | undefined> | undefined) => void, () => void] {
  const { timePickerProps, selectedValue } = toRefs(props);

  const startValue = computed(() => selectedValue?.value?.[0]);
  const endValue = computed(() => selectedValue?.value?.[1]);

  const timePickerDefaultValue = computed(() => timePickerProps?.value?.defaultValue);
  const sidePropsState = {
    get props() {
      return timePickerProps?.value;
    },
    get defaultValue() {
      return timePickerDefaultValue.value;
    },
  };

  const startTimePickerProps = computed(() => getSideTimePickerProps(sidePropsState, 0));
  const endTimePickerProps = computed(() => getSideTimePickerProps(sidePropsState, 1));

  const [startTimeValue, setStartTimeValue, resetStartTimeValue] = useTimePickerValue(
    reactive({
      timePickerProps: startTimePickerProps,
      selectedValue: startValue,
    }),
  );

  const [endTimeValue, setEndTimeValue, resetEndTimeValue] = useTimePickerValue(
    reactive({
      timePickerProps: endTimePickerProps,
      selectedValue: endValue,
    }),
  );

  const rangeTimePickerValue = computed(() => [startTimeValue.value, endTimeValue.value]);

  const { setTimeValue, resetTimeValue } = createRangeTimePickerValueFoundation({
    setStartTimeValue,
    setEndTimeValue,
    resetStartTimeValue,
    resetEndTimeValue,
  });

  return [rangeTimePickerValue, setTimeValue, resetTimeValue];
}
