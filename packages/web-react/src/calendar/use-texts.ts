import { initializeDateLocale } from '@sdata/web-core/_utils/date';
import { defaults } from '@sdata/web-core/calendar/constants';
import { createCalendarTexts, createCalendarTextsLoader } from '@sdata/web-core/calendar/i18n';
import enUS from '@sdata/web-core/locale/lang/en-us';
import zhCN from '@sdata/web-core/locale/lang/zh-cn';
import { useEffect, useRef, useState } from 'react';

import type { CalendarOptions, CalendarTexts } from './types.js';

import { useI18n } from '../locale/index.js';

export function useCalendarTexts(options: Pick<CalendarOptions, 'locale' | 'startWeekOnSunday'>) {
  const { locale, i18nMessage } = useI18n();
  const live = useRef({ options, locale, message: i18nMessage.calendar });
  live.current = { options, locale, message: i18nMessage.calendar };
  const [resource] = useState(() => {
    const texts: CalendarTexts = { ...defaults.texts };
    const load = createCalendarTextsLoader({
      get locale() {
        return live.current.locale;
      },
      get weekStart() {
        return live.current.options.startWeekOnSunday ? 0 : 1;
      },
      texts,
      initializeLocale: initializeDateLocale,
      translations(dateLocale) {
        const language = live.current.options.locale
          ? (dateLocale === 'en' ? enUS : zhCN).calendar
          : live.current.message;
        return createCalendarTexts(language, dateLocale);
      },
    });
    return { texts, load };
  });
  const [texts, setTexts] = useState<CalendarTexts>(() => ({ ...resource.texts }));
  useEffect(() => {
    let active = true;
    void resource.load(options.locale || locale).then(() => {
      if (active) setTexts({ ...resource.texts });
    });
    return () => {
      active = false;
    };
  }, [resource, options.locale, options.startWeekOnSunday, locale, i18nMessage.calendar]);
  return texts;
}
