/**
 * Calendar i18n helpers.
 *
 * After `initializeDateLocale()` has been called (from config.js), the active
 * dayjs locale contains month names, weekday names, AM/PM labels, etc.
 * This module extracts that data into the shape the calendar runtime expects,
 * merging it with UI text from the library's SdLang `calendar` section.
 */

import type { CalendarTexts } from './types.js';

import { defaults } from './constants.js';

export interface CalendarLanguage {
  today?: string;
  allDay?: string;
  noEvent?: string;
  deleteEvent?: string;
  createEvent?: string;
  view?: {
    years?: string;
    year?: string;
    month?: string;
    week?: string;
    day?: string;
    days?: string;
  };
}

import { dayjs } from '../_utils/date.js';

/**
 * Reorders a dayjs weekday array from Sun-first [Sun, Mon, …, Sat]
 * to the calendar's Mon-first [Mon, …, Sun].
 */
const reorderSunToMon = (arr: string[]) => [arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[0]];

/**
 * Builds the calendar `texts` object from the currently active dayjs locale
 * and the library's SdLang calendar section.
 *
 * Must be called **after** `initializeDateLocale()` so that the dayjs locale
 * data is loaded and set.
 *
 * @param {object} [calendarLang] — The `calendar` section from SdLang (from `useI18n().i18nMessage.value.calendar`).
 * @returns {object} Calendar texts ready to merge into `calendar.texts`.
 */
export const createCalendarTexts = (
  calendarLang: CalendarLanguage | undefined,
  locale = dayjs.locale(),
) => {
  const localeData = (dayjs.Ls[locale] || dayjs.Ls.en) as (typeof dayjs.Ls)[string] & {
    meridiem?: (hour: number, minute: number, lower: boolean) => string;
  };

  // Weekday names — reordered from dayjs Sun-first to calendar Mon-first.
  const weekDays = reorderSunToMon(localeData.weekdays || []);
  const weekDaysShort = reorderSunToMon(localeData.weekdaysShort || []);
  const weekDaysMin = reorderSunToMon(
    localeData.weekdaysMin || localeData.weekdaysShort?.map((d) => d.slice(0, 2)) || [],
  );

  // Month names (already 0-indexed Jan–Dec in dayjs).
  const months = localeData.months || [];

  // AM / PM from dayjs locale.
  let am = 'am';
  let pm = 'pm';
  if (typeof localeData.meridiem === 'function') {
    am = localeData.meridiem(0, 0, false);
    pm = localeData.meridiem(12, 0, false);
  }

  return {
    weekDays,
    weekDaysShort,
    weekDaysMin,
    months,
    am,
    pm,
    // UI text from library locale, with English fallbacks.
    today: calendarLang?.today || 'Today',
    allDay: calendarLang?.allDay || 'All Day',
    noEvent: calendarLang?.noEvent || 'No Event',
    deleteEvent: calendarLang?.deleteEvent || 'Delete',
    createEvent: calendarLang?.createEvent || 'Create an event',
    years: calendarLang?.view?.years || 'Years',
    year: calendarLang?.view?.year || 'Year',
    month: calendarLang?.view?.month || 'Month',
    week: calendarLang?.view?.week || 'Week',
    day: calendarLang?.view?.day || 'Day',
    days: calendarLang?.view?.days || 'Days',
    // Used by view.js to determine month-before-day ordering.
    dateFormat: 'dddd MMMM D, YYYY',
    truncations: true,
  };
};

/** Latest request wins; locale/week start are captured before the asynchronous load. */
export function createCalendarTextsLoader(adapter: {
  locale: string;
  weekStart: number;
  texts: CalendarTexts;
  initializeLocale: (locale: string, weekStart: number) => Promise<string>;
  translations: (locale: string) => Partial<CalendarTexts>;
}) {
  let textsLoadId = 0;
  return async (locale: string) => {
    const loadId = ++textsLoadId;
    const effectiveLocale = locale || adapter.locale || 'en-us';
    const weekStart = adapter.weekStart;
    const dateLocale = await adapter.initializeLocale(effectiveLocale, weekStart);
    if (loadId !== textsLoadId) return;
    const translations = adapter.translations(dateLocale);
    Object.assign(adapter.texts, defaults.texts, translations, { dateLocale });
  };
}
