import type { CalendarTexts } from './types.js';
import type { createDateUtils } from './utils/date.js';
type DateUtils = ReturnType<typeof createDateUtils>;

export function getCalendarInitialView(
  config: { view: string; defaultView: string },
  availableViews: Record<string, unknown>,
) {
  return config.view && availableViews[config.view] ? config.view : config.defaultView;
}

export function getCalendarInitialViewDate(input: string | Date, getNow: () => Date) {
  const date = new Date(input || getNow());
  date.setHours(0, 0, 0, 0);
  return date;
}
export interface CalendarLayoutConfig {
  availableViews: Record<string, { cols: number; rows: number }>;
  hasHiddenDays: number;
  horizontal: boolean;
  startWeekOnSunday: boolean;
  hideWeekdays: Record<number, boolean>;
  viewDayOffset: number;
}
export function getCalendarColumns(viewId: string, config: CalendarLayoutConfig) {
  // When switching to date-picker from week view, the first computation is done before the
  // availableViews object is updated, so we need to check if the view is available.
  if (!config.availableViews[viewId]) return 1;

  // Includes all the weekdays, but some may need to be hidden.
  let cols = config.availableViews[viewId].cols;
  // Hidden weekdays reduce columns in month and vertical week layouts.
  if (config.hasHiddenDays && (viewId === 'month' || (viewId === 'week' && !config.horizontal)))
    cols -= config.hasHiddenDays;
  return cols;
}

export function getCalendarRows(viewId: string, config: CalendarLayoutConfig) {
  const rows = config.availableViews[viewId]?.rows || 1;
  return viewId === 'week' && config.horizontal ? rows - config.hasHiddenDays : rows;
}

export function getCalendarFirstCellDate(
  viewId: string,
  startTheoretical: Date,
  config: CalendarLayoutConfig,
  dateUtils: DateUtils,
) {
  if (viewId === 'month') {
    // By default, the month view has 6 rows of 7 days. If the first day of the month is not
    // a Monday (or Sunday if startWeekOnSunday), then pad the preceding cells with days from the
    // previous month. E.g.
    // M  T  W  T  F  S  S
    // 28 29 30 1  2  3  4
    let weekday = startTheoretical.getDay() || 7; // 1-7, starting from Monday.

    if (config.startWeekOnSunday && !config.hideWeekdays[7]) weekday += 1;
    if (config.viewDayOffset) weekday -= config.viewDayOffset;
    return dateUtils.subtractDays(startTheoretical, weekday - 1);
  }
  if (viewId === 'week') {
    const visibleDays = '1234567'
      .split('')
      .filter((day) => !Object.keys(config.hideWeekdays).includes(day));
    let firstVisibleDay = Math.min(...visibleDays.map(Number));
    if (config.startWeekOnSunday && !config.hideWeekdays[7]) firstVisibleDay = 1;
    if (config.viewDayOffset) firstVisibleDay += config.viewDayOffset;

    return dateUtils.addDays(startTheoretical, firstVisibleDay - 1);
  }

  return startTheoretical;
}

export function getCalendarCellDates(
  viewId: string,
  firstCellDate: Date,
  cellsCount: number,
  config: CalendarLayoutConfig,
  dateUtils: DateUtils,
) {
  const dates = [];
  const isDaysWeekOrMonthView = ['days', 'week', 'month'].includes(viewId);

  // Every time a weekday is removed from the generated array of cells dates, this modifier is
  // incremented so we always keep the number of cells specified in the availableViews object if the
  // view is days, or month.
  let modifier = 0;

  for (let i = 0; i < cellsCount + modifier; i++) {
    switch (viewId) {
      case 'day':
      case 'days':
      case 'week':
      case 'month': {
        const start = dateUtils.addDays(firstCellDate, i);
        const weekday = start.getDay() || 7; // 1-7, starting from Monday.

        // If hiding specific weekday or weekend and the current cell is one of these hidden days skip
        // it and add one more date at the end to fill up the cells.
        if (isDaysWeekOrMonthView && config.hasHiddenDays && config.hideWeekdays[weekday]) {
          modifier++;
          continue;
        }

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        dates.push({ start, startFormatted: dateUtils.formatDate(start), end });
        break;
      }
      case 'year':
        dates.push({
          start: new Date(firstCellDate.getFullYear(), i, 1, 0, 0, 0, 0),
          end: new Date(firstCellDate.getFullYear(), i + 1, 0, 23, 59, 59, 999),
        });
        break;
      case 'years':
        dates.push({
          start: new Date(firstCellDate.getFullYear() + i, 0, 1, 0, 0, 0, 0),
          end: new Date(firstCellDate.getFullYear() + i + 1, 0, 0, 23, 59, 59, 999),
        });
        break;
    }
  }

  return dates;
}

export function calendarContainsToday(adapter: CalendarViewMathHost) {
  const nowTime = adapter.now.getTime();

  if (adapter.viewId === 'week') {
    return adapter.extendedStart.getTime() <= nowTime && nowTime <= adapter.extendedEnd.getTime();
  }

  const firstCellTime = adapter.firstCellDate.getTime();
  const lastCellTime = adapter.lastCellDate.getTime();
  return firstCellTime <= nowTime && nowTime <= lastCellTime;
}

export function getCalendarWeekTitle(adapter: CalendarViewMathHost) {
  if (adapter.viewId !== 'week') return null;
  const weekNumber = adapter.dateUtils.getWeek(
    adapter.firstCellDate,
    adapter.config.startWeekOnSunday && !adapter.config.hideWeekdays[7],
  );
  return { text: adapter.texts.week, number: weekNumber };
}

export function getCalendarTitle(adapter: CalendarViewMathHost) {
  const { dateFormat, months, monthsGenitive, truncations } = adapter.texts;
  const locale = adapter.config.locale;
  const canTruncate = truncations !== false;

  // Determine date format style (month-first or day-first).
  const monthBeforeDay = dateFormat.indexOf('M') < dateFormat.indexOf('D');

  // Use genitive case for Greek if available and appropriate.
  const monthsArray = monthsGenitive && locale === 'el' ? monthsGenitive : months;

  switch (adapter.viewId) {
    case 'day':
      return adapter.dateUtils.formatDate(adapter.firstCellDate, dateFormat);

    case 'days':
    case 'week': {
      const options = {
        monthsArray,
        monthBeforeDay,
        canTruncate,
        xs: adapter.config.xs,
      };

      return formatDateRange(adapter.firstCellDate, adapter.lastCellDate, options);
    }

    case 'month': {
      // Shorten month if xs and the locale doesn't forbid it.
      const format = `${adapter.config.xs && canTruncate ? 'MMM' : 'MMMM'} YYYY`;
      return adapter.dateUtils.formatDate(adapter.start, format);
    }

    case 'year':
      return adapter.firstCellDate.getFullYear();

    case 'years':
      return `${adapter.firstCellDate.getFullYear()} - ${adapter.end.getFullYear()}`;
  }
}

/**
 * Gets a month name with optional truncation.
 *
 * @param {number} monthIndex - The 0-based month index.
 * @param {Array} monthsArray - Array of month names.
 * @param {boolean} shouldTruncate - Whether to truncate the month name.
 * @returns {string} The formatted month name.
 */
function getMonthName(monthIndex: number, monthsArray: string[], shouldTruncate = false) {
  if (!monthsArray || !monthsArray[monthIndex]) return monthIndex + 1; // Numeric fallback.

  const name = monthsArray[monthIndex];
  return shouldTruncate && typeof name === 'string' ? name.substring(0, 3) : name;
}

/**
 * Formats a date range between two dates.
 *
 * @param {Date} start - The start date.
 * @param {Date} end - The end date.
 * @param {Object} options - Formatting options.
 * @returns {string} The formatted date range.
 */
function formatDateRange(
  start: Date,
  end: Date,
  options: { monthsArray: string[]; monthBeforeDay: boolean; canTruncate: boolean; xs: boolean },
) {
  const { monthsArray, monthBeforeDay, canTruncate, xs } = options;

  const startMonth = start.getMonth();
  const startYear = start.getFullYear();
  const endMonth = end.getMonth();
  const endYear = end.getFullYear();
  const crossingMonth = startMonth !== endMonth;
  const crossingYear = startYear !== endYear;

  // Should we truncate month names?.
  const shouldTruncate = canTruncate && (xs || crossingMonth);

  // Get day numbers directly.
  const startDay = start.getDate();
  const endDay = end.getDate();

  if (crossingYear) {
    // Different years.
    if (monthBeforeDay)
      return `${getMonthName(startMonth, monthsArray, shouldTruncate)} ${startDay}, ${startYear} - ${getMonthName(endMonth, monthsArray, shouldTruncate)} ${endDay}, ${endYear}`;
    return `${startDay} ${getMonthName(startMonth, monthsArray, shouldTruncate)} ${startYear} - ${endDay} ${getMonthName(endMonth, monthsArray, shouldTruncate)} ${endYear}`;
  }
  if (crossingMonth) {
    // Same year, different months.
    if (monthBeforeDay)
      return `${getMonthName(startMonth, monthsArray, shouldTruncate)} ${startDay} - ${getMonthName(endMonth, monthsArray, shouldTruncate)} ${endDay}, ${startYear}`;
    return `${startDay} ${getMonthName(startMonth, monthsArray, shouldTruncate)} - ${endDay} ${getMonthName(endMonth, monthsArray, shouldTruncate)} ${startYear}`;
  }
  // Same month and year.
  if (monthBeforeDay)
    return `${getMonthName(startMonth, monthsArray, shouldTruncate)} ${startDay}-${endDay}, ${startYear}`;
  return `${startDay}-${endDay} ${getMonthName(startMonth, monthsArray, shouldTruncate)} ${startYear}`;
}
export function calendarNowLineVisible(adapter: CalendarViewMathHost) {
  if (!['day', 'days', 'week'].includes(adapter.viewId)) return;
  if (
    !adapter.containsToday ||
    !adapter.config.time ||
    ('allDay' in adapter.config && adapter.config.allDay)
  )
    return;
  if (adapter.config.timeFrom > adapter.dateUtils.dateToMinutes(adapter.now)) return;
  if (adapter.dateUtils.dateToMinutes(adapter.now) > adapter.config.timeTo) return;

  return true;
}
export function getAdjacentCalendarView(
  viewId: string,
  views: Record<string, { cols: number; rows: number }>,
  offset: number,
) {
  const ids = Object.keys(views);
  return ids[ids.indexOf(viewId) + offset];
}

export interface CalendarViewMathHost {
  readonly startTheoretical: Date;
  readonly viewId: string;
  readonly now: Date;
  readonly extendedStart: Date;
  readonly extendedEnd: Date;
  readonly firstCellDate: Date;
  readonly lastCellDate: Date;
  readonly start: Date;
  readonly end: Date;
  readonly containsToday: boolean;
  readonly config: CalendarLayoutConfig & {
    locale: string;
    xs: boolean;
    time: boolean;
    timeFrom: number;
    timeTo: number;
    allDay?: unknown;
  };
  readonly texts: CalendarTexts;
  readonly dateUtils: DateUtils;
}

export function getCalendarRangeStart(adapter: CalendarViewMathHost) {
  if (adapter.viewId === 'month') return adapter.startTheoretical;
  return adapter.firstCellDate;
}
export function getCalendarRangeEnd(adapter: CalendarViewMathHost) {
  if (adapter.viewId === 'month')
    return new Date(
      adapter.startTheoretical.getFullYear(),
      adapter.startTheoretical.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  return adapter.lastCellDate;
}
export function getCalendarExtendedStart(adapter: CalendarViewMathHost) {
  if (adapter.viewId === 'week')
    return adapter.dateUtils.getPreviousFirstDayOfWeek(
      adapter.firstCellDate,
      adapter.config.startWeekOnSunday,
    );
  if (adapter.viewId === 'month') return adapter.firstCellDate;
  return adapter.start;
}
export function getCalendarExtendedEnd(adapter: CalendarViewMathHost) {
  if (adapter.viewId === 'week') {
    const endWeek = adapter.dateUtils.addDays(adapter.extendedStart, 7);
    endWeek.setMilliseconds(-1);
    return endWeek;
  }
  if (adapter.viewId === 'month') return adapter.lastCellDate;
  return adapter.end;
}
