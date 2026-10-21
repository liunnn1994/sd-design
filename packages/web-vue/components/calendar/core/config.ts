import { computed, reactive, toRefs, watch } from 'vue';

import {
  createCalendarConfigRules,
  getCalendarHiddenDayCount,
  getCalendarConfigSize,
} from '@sdata/web-core/calendar/config';
import { createCalendarTextsLoader } from '@sdata/web-core/calendar/i18n';

import type { CalendarState } from '../context';
import type { SpecialHours, CalendarEvent, CalendarSchedule } from '../types';
import type { CalendarProps } from './props-definitions';

import { initializeDateLocale } from '../../_utils/date';
import { useI18n } from '../../locale';
import enUS from '../../locale/lang/en-us';
import zhCN from '../../locale/lang/zh-cn';
import { createCalendarTexts } from './i18n';
export { defaults, months, weekdays } from '@sdata/web-core/calendar/constants';

export const useConfig = (
  calendar: Pick<CalendarState, 'dateUtils' | 'texts'> & {
    view: {
      id: string;
      isDay: boolean;
      isDays: boolean;
      isWeek: boolean;
      isMonth: boolean;
      isYear: boolean;
    };
  },
  props: CalendarProps,
  attrs: Record<string, unknown>,
) => {
  // Library locale — reactive, follows ConfigProvider.
  const { i18nMessage, locale: globalLocal } = useI18n();
  const ready = false;
  const rules: ReturnType<typeof createCalendarConfigRules<CalendarSchedule>> =
    createCalendarConfigRules(
      props,
      calendar,
      {
        get availableViews() {
          return availableViews.value;
        },
        get hideWeekdays() {
          return hideWeekdays.value;
        },
        get rawSpecialHours() {
          return rawSpecialHours.value;
        },
        get specialHours() {
          return specialHours.value;
        },
      },
      attrs,
    );
  const view = computed(rules.view);
  const sm = computed(rules.sm);
  const xs = computed(rules.xs);
  const sizeState = {
    get xs() {
      return xs.value;
    },
    get sm() {
      return sm.value;
    },
  };
  const clickToNavigate = computed(rules.clickToNavigate);

  /**
   * Extract all the Calendar external event listeners for cells and events, and prepare an object to
   * pass to the cell component which will v-on this object of listeners.
   */
  const eventListeners = computed(rules.eventListeners);

  // An object consisting of only the weekdays to hide, given their index (1-7, Mon - Sun).
  // E.g. { 1: true, 6: true, 7 true } will hide the Mondays and weekends.
  const hideWeekdays = computed(rules.hideWeekdays);
  const hideWeekends = computed(rules.hideWeekends);

  const availableViews = computed(rules.availableViews);

  const defaultView = computed(rules.defaultView);

  const selectedDate = computed(rules.selectedDate);

  // An array of specific dates to disable.
  // The dates can be provided as 'YYYY-MM-DD' strings or Date objects and the dates are validated
  // or ignored.
  const disableDays = computed(rules.disableDays);

  /**
   * Mostly for date pickers, sets a minimum date for cell interactions.
   */
  const minTimestamp = computed(rules.minTimestamp);

  /**
   * Mostly for date pickers, sets a maximum date for cell interactions.
   */
  const maxTimestamp = computed(rules.maxTimestamp);

  const schedules = computed<(CalendarSchedule & { id: string | number })[] | undefined>(
    rules.schedules,
  );

  const rawSpecialHours = computed(rules.rawSpecialHours);

  const specialHours = computed<SpecialHours>(rules.specialHours);

  const specialHoursDisallowed = computed(rules.specialHoursDisallowed);

  const editableEvents = computed<{
    drag: boolean;
    resize: boolean;
    resizeX?: boolean;
    delete: boolean;
    create: boolean;
  }>(rules.editableEvents);

  const showCellEventCount = computed(rules.showCellEventCount);

  const allDayEvents = computed(rules.allDayEvents);

  const horizontal = computed(rules.horizontal);

  const timeAtCursor = computed(rules.timeAtCursor);

  /**
   * Initializes dayjs locale and loads calendar texts from both
   * dayjs locale data (month/weekday names) and the library's SdLang
   * calendar section (UI labels).
   */
  const loadTexts = createCalendarTextsLoader({
    get locale() {
      return globalLocal.value;
    },
    get weekStart() {
      return props.startWeekOnSunday ? 0 : 1;
    },
    get texts() {
      return calendar.texts;
    },
    initializeLocale: initializeDateLocale,
    translations(dateLocale) {
      const calendarLang = props.locale
        ? (dateLocale === 'en' ? enUS : zhCN).calendar
        : i18nMessage.value?.calendar;
      return createCalendarTexts(calendarLang, dateLocale);
    },
  });

  // Keep a local copy of the events so the prop is not mandatory.
  // Event dates and metadata are normalized by eventsManager before use.
  const events = reactive(props.events || []) as CalendarEvent[];
  // Track array membership after prop replacement without watching nested event edits.
  watch(
    () => props.events?.slice() || [],
    (evts) => {
      if (events.length !== evts.length || events.some((event, i) => event !== evts[i]))
        events.splice(0, events.length, ...(evts as CalendarEvent[]));
    },
  );

  // React to locale changes from either the `locale` prop or the library's global locale.
  watch(
    [
      () => props.locale || globalLocal.value,
      () => (props.locale ? undefined : i18nMessage.value.calendar),
    ],
    ([newLocale]) => loadTexts(newLocale),
    { deep: true },
  );

  // When startWeekOnSunday changes, re-initialize dayjs locale with new weekStart.
  watch(
    () => props.startWeekOnSunday,
    () => loadTexts(props.locale || globalLocal.value),
  );

  // Initial load.
  loadTexts(props.locale || globalLocal.value);

  return {
    ...toRefs(props),
    events,
    // All the events listeners for cells and events that the end user may have attached to cal.
    eventListeners,
    defaultView,
    availableViews,
    disableDays,
    ready,
    sm,
    xs,
    clickToNavigate,
    hideWeekdays,
    hideWeekends,
    minTimestamp,
    maxTimestamp,
    schedules,
    specialHours,
    specialHoursDisallowed,
    selectedDate,
    editableEvents,
    showCellEventCount,
    allDayEvents,
    horizontal,
    timeAtCursor,
    view,
    // Getters.
    get hasHiddenDays() {
      return getCalendarHiddenDayCount(hideWeekdays.value);
    },
    get size() {
      return getCalendarConfigSize(sizeState);
    },
    loadTexts,
  };
};
