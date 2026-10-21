import type { Dayjs } from 'dayjs';

import { toRefs } from 'vue';

import { getReturnValue } from '@sdata/web-core/date-picker/values';

import type { ValueFormat } from '../interface';
export { getReturnValue, getReturnRangeValue } from '@sdata/web-core/date-picker/values';

export function useReturnValue(props: {
  format: ValueFormat;
  utcOffset?: number;
  timezone?: string;
}) {
  const { format, utcOffset, timezone } = toRefs(props);

  return (date: Dayjs) => getReturnValue(date, format.value, utcOffset?.value, timezone?.value);
}
