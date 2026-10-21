import { createCalendarTexts as createCoreCalendarTexts } from '@sdata/web-core/calendar/i18n';

import type { SdLang } from '../../locale/interface';

import { dayjs } from '../../_utils/date';

export const createCalendarTexts = (
  calendarLang: SdLang['calendar'] | undefined,
  locale = dayjs.locale(),
) => createCoreCalendarTexts(calendarLang, locale);
