import type { DateDisabledOptions } from '@sdata/web-core/date-picker/disabled';
import type { Dayjs } from 'dayjs';

import { isDatePickerDisabled } from '@sdata/web-core/date-picker/disabled';

export default function useIsDisabledDate(props: DateDisabledOptions) {
  return (value: Dayjs | undefined, type?: 'start' | 'end') =>
    isDatePickerDisabled(value, props, type);
}
