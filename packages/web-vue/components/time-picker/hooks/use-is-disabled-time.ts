import { isDisabledTimeValue } from '@sdata/web-core/time-picker/values';
import { Dayjs } from 'dayjs';

import { TimePickerProps } from '../interface';

export default function useIsDisabledTime(props: {
  disabledHours: TimePickerProps['disabledHours'];
  disabledMinutes: TimePickerProps['disabledMinutes'];
  disabledSeconds: TimePickerProps['disabledSeconds'];
}) {
  return (value: Array<Dayjs | undefined> | Dayjs | undefined) => {
    return isDisabledTimeValue(value, {
      disabledHours: props.disabledHours,
      disabledMinutes: props.disabledMinutes,
      disabledSeconds: props.disabledSeconds,
    });
  };
}
