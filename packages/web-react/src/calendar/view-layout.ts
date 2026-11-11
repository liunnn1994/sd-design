import type { CalendarViewMathHost } from '@sdata/web-core/calendar/view-math';

import {
  calendarContainsToday,
  calendarNowLineVisible,
  getAdjacentCalendarView,
  getCalendarCellDates,
  getCalendarColumns,
  getCalendarRows,
  getCalendarFirstCellDate,
  getCalendarRangeStart,
  getCalendarRangeEnd,
  getCalendarExtendedStart,
  getCalendarExtendedEnd,
  getCalendarTitle,
  getCalendarWeekTitle,
} from '@sdata/web-core/calendar/view-math';

type LayoutInput = Pick<
  CalendarViewMathHost,
  'viewId' | 'startTheoretical' | 'now' | 'config' | 'texts' | 'dateUtils'
>;

export function resolveCalendarLayout(input: LayoutInput) {
  const { viewId, config, dateUtils, startTheoretical } = input;
  const cols = getCalendarColumns(viewId, config);
  const rows = getCalendarRows(viewId, config);
  const cellsCount = cols * rows;
  const firstCellDate = getCalendarFirstCellDate(viewId, startTheoretical, config, dateUtils);
  const cellDates = getCalendarCellDates(viewId, firstCellDate, cellsCount, config, dateUtils);
  const lastCellDate = cellDates[cellDates.length - 1].end;
  const host: CalendarViewMathHost = {
    ...input,
    firstCellDate,
    lastCellDate,
    get start() {
      return start;
    },
    get end() {
      return end;
    },
    get extendedStart() {
      return extendedStart;
    },
    get extendedEnd() {
      return extendedEnd;
    },
    get containsToday() {
      return containsToday;
    },
  };
  const start = getCalendarRangeStart(host);
  const end = getCalendarRangeEnd(host);
  const extendedStart = getCalendarExtendedStart(host);
  const extendedEnd = getCalendarExtendedEnd(host);
  const containsToday = calendarContainsToday(host);
  return {
    id: viewId,
    cols,
    rows,
    cellsCount,
    firstCellDate,
    lastCellDate,
    cellDates,
    start,
    end,
    extendedStart,
    extendedEnd,
    containsToday,
    title: getCalendarTitle(host),
    titleWeekInfo: getCalendarWeekTitle(host),
    nowLineVisible: calendarNowLineVisible(host),
    broaderView: getAdjacentCalendarView(viewId, config.availableViews, 1),
    narrowerView: getAdjacentCalendarView(viewId, config.availableViews, -1),
    isDay: viewId === 'day',
    isDays: viewId === 'days',
    isWeek: viewId === 'week',
    isMonth: viewId === 'month',
    isYear: viewId === 'year',
    isYears: viewId === 'years',
  };
}
