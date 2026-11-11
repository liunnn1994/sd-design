import { initializeDateLocale } from '@sdata/web-core/_utils/date';
import { getValueByPath } from '@sdata/web-core/_utils/get-value-by-path';
import { useLayoutEffect, useReducer } from 'react';

import { useI18n } from '../locale/index.js';

export function useDatePickerLocale(
  localLocale: Record<string, unknown> | undefined,
  dayStartOfWeek: number,
) {
  const { t, locale } = useI18n();
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  useLayoutEffect(() => {
    let active = true;
    void initializeDateLocale(locale, dayStartOfWeek).then(() => {
      if (active) refresh();
    });
    return () => {
      active = false;
    };
  }, [locale, dayStartOfWeek]);
  return (key: string) =>
    getValueByPath<string>(localLocale, key.replace(/^datePicker\./, '')) || t(key);
}
