import { computed, toRefs } from 'vue';

import { Dayjs } from 'dayjs';

import { getDateValue } from '../../_utils/date';
import {
  DisabledDate,
  DisabledTime,
  Mode,
  RangeDisabledDate,
  RangeDisabledTime,
} from '../interface';
import { isDisabledDate as isPeriodDisabledDate } from '../utils';

interface IsDisabledProps {
  mode?: Mode;
  showTime?: boolean;
  disabledDate?: DisabledDate | RangeDisabledDate;
  disabledTime?: DisabledTime | RangeDisabledTime;
  isRange?: boolean;
}

export default function useIsDisabledDate(props: IsDisabledProps) {
  const { mode, showTime, disabledDate, disabledTime, isRange } = toRefs(props);
  const needCheckTime = computed(() => mode?.value === 'date' && showTime?.value);
  const isDisabledDate = computed(() => {
    return (current: Dayjs, type: 'start' | 'end') => {
      if (!disabledDate?.value) return false;

      return isPeriodDisabledDate(
        current,
        isRange?.value
          ? (date) => (disabledDate.value as RangeDisabledDate)(date, type)
          : (disabledDate.value as DisabledDate),
        mode?.value,
      );
    };
  });

  const isDisabledItem = (num: number, getDisabledList?: () => number[]) => {
    const list = getDisabledList?.() || [];
    return list.includes(num);
  };

  const isDisabledTime = computed(() => {
    return (current: Dayjs, type: 'start' | 'end') => {
      if (!needCheckTime.value) return false;
      if (!disabledTime?.value) return false;

      const dateValue = getDateValue(current);

      const disabledTimeProps = isRange?.value
        ? (disabledTime.value as RangeDisabledTime)(dateValue, type)
        : (disabledTime.value as DisabledTime)(dateValue);

      return (
        isDisabledItem(current.hour(), disabledTimeProps.disabledHours) ||
        isDisabledItem(current.minute(), disabledTimeProps.disabledMinutes) ||
        isDisabledItem(current.second(), disabledTimeProps.disabledSeconds)
      );
    };
  });

  return function isDisabled(value: Dayjs | undefined, type?: 'start' | 'end') {
    return (
      value &&
      (isDisabledDate.value(value, type || 'start') || isDisabledTime.value(value, type || 'start'))
    );
  };
}
