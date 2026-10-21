import { reactive, toRefs, Ref, ref, watch, computed } from 'vue';

import { createTimePickerValueFoundation } from '@sdata/web-core/date-picker/time-value';
import { Dayjs } from 'dayjs';

import { getDayjsValue } from '../../_utils/date';
import useTimeFormat from '../../time-picker/hooks/use-time-format';
import { TimePickerProps, TimeValue } from '../../time-picker/interface';

interface TimePickerValueProps {
  timePickerProps: Partial<TimePickerProps> | undefined;
  selectedValue: Dayjs | undefined;
}
export default function useTimePickerValue(
  props: TimePickerValueProps,
): [Ref<Dayjs>, (val: Dayjs | undefined) => void, () => void] {
  const { timePickerProps, selectedValue } = toRefs(props);

  const timePickerPropsFormat = computed(() => timePickerProps?.value?.format);
  const timePickerPropsUse12Hours = computed(() => !!timePickerProps?.value?.use12Hours);

  const { format } = useTimeFormat(
    reactive({
      format: timePickerPropsFormat,
      use12Hours: timePickerPropsUse12Hours,
    }),
  );

  const defaultTimePickerValue = computed(() =>
    getDayjsValue(timePickerProps?.value?.defaultValue as TimeValue | undefined, format.value),
  );

  const { getDefaultValue, setTimePickerValue, resetTimePickerValue } =
    createTimePickerValueFoundation({
      get selectedValue() {
        return selectedValue?.value;
      },
      get defaultValue() {
        return defaultTimePickerValue.value;
      },
      get value() {
        return timePickerValue.value;
      },
      set value(value) {
        timePickerValue.value = value;
      },
    });

  const timePickerValue = ref(getDefaultValue());

  watch(selectedValue, (newVal) => {
    setTimePickerValue(newVal);
  });

  return [timePickerValue, setTimePickerValue, resetTimePickerValue];
}
