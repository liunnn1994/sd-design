import type { CalendarId, CalendarListener, SpecialHours, SpecialHoursInput } from './types.js';
import type { createDateUtils } from './utils/date.js';

import { defaults, weekdays } from './constants.js';
import { normalizeSpecialHoursDay, buildSpecialHoursDisallowed } from './special-hours.js';

export const getCalendarHiddenDayCount = (days: Record<number, boolean>) =>
  Object.keys(days).length;
export const getCalendarConfigSize = (state: { xs: boolean; sm: boolean }): string =>
  state.xs ? 'xs' : state.sm ? 'sm' : 'lg';
export interface CalendarConfigInput<
  Schedule extends CalendarScheduleInput = CalendarScheduleInput,
> {
  view?: string | undefined;
  views?: readonly string[] | Record<string, { cols?: number; rows?: number }> | undefined;
  datePicker: boolean;
  sm: boolean;
  xs: boolean;
  clickToNavigate?: boolean | undefined;
  hideWeekdays?: readonly string[] | undefined;
  hideWeekends: boolean;
  horizontal: boolean;
  selectedDate?: string | Date | undefined;
  disableDays?: readonly (string | Date)[] | undefined;
  minDate?: string | Date | undefined;
  maxDate?: string | Date | undefined;
  schedules?: readonly Schedule[] | undefined;
  specialHours?: SpecialHoursInput | undefined;
  businessHours?: SpecialHoursInput | undefined;
  editableEvents:
    | boolean
    | { drag?: boolean; resize?: boolean; resizeX?: boolean; create?: boolean; delete?: boolean };
  eventCount: boolean | readonly string[];
  eventsOnMonthView: boolean;
  allDayEvents: boolean;
  time: boolean;
  timeAtCursor: boolean;
}
export interface CalendarScheduleInput {
  id?: CalendarId | undefined;
  hide?: boolean | undefined;
}
export interface CalendarConfigView {
  id: string;
  isDay: boolean;
  isDays: boolean;
  isWeek: boolean;
  isMonth: boolean;
  isYear: boolean;
}
export interface CalendarConfigDerived {
  availableViews: Record<string, { cols: number; rows: number }>;
  hideWeekdays: Record<number, boolean>;
  rawSpecialHours: SpecialHoursInput;
  specialHours: SpecialHours;
}

const weekdaysMap = weekdays.reduce(
  (obj, day, i) => {
    obj[day] = i || 7;
    return obj;
  },
  {} as Record<string, number>,
);
/** Rules read their inputs lazily so adapters can retain their own computed caches. */
export function createCalendarConfigRules<Schedule extends CalendarScheduleInput>(
  props: CalendarConfigInput<Schedule>,
  calendar: {
    dateUtils: Pick<ReturnType<typeof createDateUtils>, 'stringToDate' | 'formatDate' | 'isValid'>;
    view: CalendarConfigView;
  },
  derived: CalendarConfigDerived,
  attrs: Record<string, unknown>,
) {
  const { dateUtils } = calendar;
  const view = () => {
    // If user explicitly provided a valid view, use it.
    if (props.view && derived.availableViews[props.view]) return props.view;

    // If user explicitly provided an invalid view, warn and use first available.
    if (props.view && !derived.availableViews[props.view]) {
      console.warn(
        `Calendar: the provided view \`${props.view}\` is not in the list of available views.` +
          ` The first available view will be chosen: \`${Object.keys(derived.availableViews)[0]}\`.`,
      );
      return Object.keys(derived.availableViews)[0];
    }

    // User didn't provide a view - use default fallback silently.
    const fallbackView = props.datePicker ? 'month' : 'week';
    if (derived.availableViews[fallbackView]) return fallbackView;

    // Default fallback not available, silently use first available.
    return Object.keys(derived.availableViews)[0];
  };
  const sm = () => props.sm && !props.xs;
  const xs = () => props.xs || props.datePicker;
  const clickToNavigate = () =>
    props.clickToNavigate || (props.datePicker && props.clickToNavigate !== false);
  const eventListeners = () => {
    const listeners = {
      cell: {} as Record<string, CalendarListener>, // All possible event listeners to attach to cells.
      event: {} as Record<string, CalendarListener>, // All possible event listeners to attach to calendar events.
    };

    const kebabize = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    // Forward any cell and calendar-events event listener attached to sd-calendar to the cell and event components.
    // For instance, convert sd-calendar.onCellMouseenter to cell.mouseenter.
    for (const [attr, value] of Object.entries(attrs)) {
      const [m0, m1, m2] = attr.match(/^on(Cell|Event)(.+)$/) || [];
      // Allow both camelCase and kebab-case for event handlers names, but store as kebab-case.
      if (m0 && typeof value === 'function')
        listeners[m1.toLowerCase() as 'cell' | 'event'][kebabize(m2).replace(/^-+|-+$/g, '')] =
          value as CalendarListener;
    }

    return listeners;
  };
  const hideWeekdays = () => {
    const weekDays: Record<number, boolean> = {}; // 1-7, Mon - Sun.
    if (props.hideWeekends) {
      weekDays[6] = true;
      weekDays[7] = true;
    }
    if (props.hideWeekdays?.length)
      props.hideWeekdays.forEach((day) => (weekDays[weekdaysMap[day]] = true));

    return weekDays;
  };
  const hideWeekends = () =>
    props.hideWeekends || (derived.hideWeekdays[6] && derived.hideWeekdays[7]);
  const availableViews = () => {
    const datePicker = props.datePicker;
    let invalidViews = 0;
    let availViews: Record<string, { cols: number; rows: number }> = {}; // The new object to return.
    const views = props.views as
      | string[]
      | Record<string, { cols?: number; rows?: number }>
      | undefined;

    // Default views for date picker layout: ['month', 'year', 'years'].
    if (datePicker && !views)
      return {
        month: { ...defaults.availableViews.month },
        year: { ...defaults.availableViews.year },
        years: { ...defaults.availableViews.years },
      };

    if (views) {
      if (Array.isArray(views)) {
        availViews = views.reduce(
          (obj, view) => {
            if (typeof view === 'string' && defaults.availableViews[view])
              obj[view] = defaults.availableViews[view];
            else invalidViews++;
            return obj;
          },
          {} as Record<string, { cols: number; rows: number }>,
        );
      } else if (typeof views === 'object') {
        availViews = Object.entries(views).reduce(
          (obj, [id, size]) => {
            const { cols, rows } = defaults.availableViews[id];
            obj[id] = { cols: size.cols || cols, rows: size.rows || rows };
            return obj;
          },
          {} as Record<string, { cols: number; rows: number }>,
        );
      }
      // Else case handled by unauthorized Vue props definition error.

      if (invalidViews) {
        console.warn(
          'Calendar: the provided `views` prop contains invalid views that will be ignored.',
        );
      }
      if (!Object.keys(availViews).length) {
        console.warn(
          'Calendar: No valid view in the provided `views` prop. Falling back to default views.',
        );
        availViews = { ...defaults.availableViews };
      }
    }
    // Default views for normal layout: ['day', 'days', 'week', 'month', 'year', 'years'] }.
    else {
      availViews = { ...defaults.availableViews };
      // If horizontal view, flip the default rows and cols for the days and week views.
      if (props.horizontal) {
        const { days, week } = defaults.availableViews;
        availViews.days = { cols: days.rows, rows: days.cols };
        availViews.week = { cols: week.rows, rows: week.cols };
      }
    }

    return availViews;
  };
  const defaultView = () => {
    if (props.datePicker) return 'month';
    if (derived.availableViews.week) return 'week';
    return Object.keys(derived.availableViews)[0];
  };
  const selectedDate = () => {
    if (!props.selectedDate) return;
    if (typeof props.selectedDate === 'string') return dateUtils.stringToDate(props.selectedDate);
    if (props.selectedDate instanceof Date) return props.selectedDate;
    // 未选择是正常状态，不需要提示；只有传了非法值才告警
    if (props.selectedDate) {
      console.warn('Calendar: The provided selected date is invalid:', props.selectedDate);
    }
  };
  const disableDays = () => {
    if (!props.disableDays) return [];

    const validDates = [];
    if (Array.isArray(props.disableDays)) {
      for (let date of props.disableDays) {
        let jsDate = date;
        if (typeof date === 'string') jsDate = dateUtils.stringToDate(date);
        else if (date instanceof Date) date = dateUtils.formatDate(date, 'YYYY-MM-DD');

        if (jsDate instanceof Date && !isNaN(jsDate.getTime())) {
          validDates.push(date);
          // Don't return here, we need to process all dates in the array.
        } else {
          console.warn('Calendar: The provided `disableDays` prop contains an invalid date:', date);
        }
      }
    } else console.warn('Calendar: The provided `disableDays` prop is invalid:', props.disableDays);

    return validDates;
  };
  const minTimestamp = () => {
    let date: Date | null = null;
    if (props.minDate && typeof props.minDate === 'string')
      date = dateUtils.stringToDate(props.minDate);
    else if (props.minDate && props.minDate instanceof Date) date = props.minDate;
    return dateUtils.isValid(date) ? date.getTime() : null;
  };
  const maxTimestamp = () => {
    let date: Date | null = null;
    if (props.maxDate && typeof props.maxDate === 'string')
      date = dateUtils.stringToDate(props.maxDate);
    else if (props.maxDate && props.maxDate instanceof Date) date = props.maxDate;
    return dateUtils.isValid(date) ? date.getTime() : null;
  };
  const schedules = (): (Schedule & { id: string | number })[] | undefined => {
    const { view } = calendar;
    const list = props.schedules;
    if (!list?.length || !(view.isDay || view.isDays || view.isWeek)) return undefined;
    const visible = [];
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (s.hide) continue;
      visible.push({ ...s, id: s.id ?? i + 1 });
    }
    return visible.length ? visible : undefined;
  };
  const rawSpecialHours = () => {
    const sh = props.specialHours;
    const bh = props.businessHours;
    if (sh && typeof sh === 'object' && !Array.isArray(sh) && Object.keys(sh).length) return sh;
    if (bh && typeof bh === 'object' && !Array.isArray(bh)) return bh;
    return {};
  };
  const specialHours = (): SpecialHours => {
    const raw = derived.rawSpecialHours;
    if (!raw || typeof raw !== 'object') return {};

    return Object.entries(raw).reduce((obj, [weekday, dayConfig]) => {
      if (!weekdays.includes(weekday)) return obj;

      const normalized = normalizeSpecialHoursDay(dayConfig);
      if (normalized) obj[weekday] = normalized;
      return obj;
    }, {} as SpecialHours);
  };
  const specialHoursDisallowed = () => buildSpecialHoursDisallowed(derived.specialHours);
  const editableEvents = (): {
    drag: boolean;
    resize: boolean;
    resizeX?: boolean;
    delete: boolean;
    create: boolean;
  } => {
    const defaults = {
      drag: true,
      resize: true,
      delete: true,
      create: true,
    };
    if (props.editableEvents === true) return defaults;
    if (props.editableEvents === false)
      return Object.keys(defaults).reduce(
        (obj, key) => {
          obj[key as keyof typeof defaults] = false;
          return obj;
        },
        {} as typeof defaults,
      );
    return { ...defaults, ...props.editableEvents };
  };
  const showCellEventCount = () => {
    const { view } = calendar;
    const { eventCount } = props;
    const showEventCount = Array.isArray(eventCount) ? eventCount.includes(view.id) : eventCount;
    return showEventCount && ((view.isMonth && !props.eventsOnMonthView) || view.isYear);
  };
  const allDayEvents = () => {
    const { view } = calendar;
    return props.allDayEvents && props.time && (view.isDay || view.isDays || view.isWeek);
  };
  const horizontal = () => {
    const { view } = calendar;
    return props.horizontal && (view.isDay || view.isDays || view.isWeek);
  };
  const timeAtCursor = () => props.timeAtCursor && props.time;
  return {
    view,
    sm,
    xs,
    clickToNavigate,
    eventListeners,
    hideWeekdays,
    hideWeekends,
    availableViews,
    defaultView,
    selectedDate,
    disableDays,
    minTimestamp,
    maxTimestamp,
    schedules,
    rawSpecialHours,
    specialHours,
    specialHoursDisallowed,
    editableEvents,
    showCellEventCount,
    allDayEvents,
    horizontal,
    timeAtCursor,
  };
}
