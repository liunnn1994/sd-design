import { getDefaultFormat, getDefaultValueFormat } from '@sdata/web-core/date-picker/format';
export { getDefaultFormat, getDefaultValueFormat } from '@sdata/web-core/date-picker/format';
import { computed, toRefs } from 'vue';

import { isFunction } from '../../_utils/is';
import { Mode, FormatFunc, ValueFormat } from '../interface';

interface FormatProps {
  format?: string | FormatFunc;
  valueFormat?: ValueFormat;
  mode?: Mode;
  showTime?: boolean;
}

export default function useFormat(props: FormatProps) {
  const { format: propFormat, mode, showTime, valueFormat: propValueFormat } = toRefs(props);

  const format = computed(
    () =>
      (!isFunction(propFormat?.value) && propFormat?.value) ||
      getDefaultFormat(mode?.value, showTime?.value),
  );

  const valueFormat = computed(
    () => propValueFormat?.value || getDefaultValueFormat(mode?.value, showTime?.value),
  );

  const parseValueFormat = computed(() =>
    ['timestamp', 'Date'].includes(valueFormat.value) ? format.value : valueFormat.value,
  );

  return {
    format,
    valueFormat,
    parseValueFormat,
  };
}
