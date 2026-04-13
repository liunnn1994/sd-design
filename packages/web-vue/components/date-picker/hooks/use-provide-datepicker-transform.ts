import { toRefs, provide } from 'vue';

import { dayjs } from '../../_utils/date';
import { getValueByPath } from '../../_utils/get-value-by-path';
import { useI18n } from '../../locale';
import { PickerContext, PickerInjectionKey } from '../context';
import { BasePickerProps } from '../interface';

interface DatePickerTransform {
  locale?: BasePickerProps['locale'];
}

export default function useDatePickerTransform(props: DatePickerTransform) {
  const { locale } = toRefs(props);
  const { locale: i18nLocale, t } = useI18n();
  dayjs.locale(i18nLocale.value.toLowerCase());

  const datePickerT: typeof t = (key: string, ...args: any[]): any => {
    const keyForLocale = key.startsWith('datePicker.') ? key.split('.').slice(1).join('.') : key;

    return getValueByPath(locale?.value || {}, keyForLocale) || t(key, ...args);
  };

  provide<PickerContext>(PickerInjectionKey, {
    datePickerT,
  });

  return datePickerT;
}
