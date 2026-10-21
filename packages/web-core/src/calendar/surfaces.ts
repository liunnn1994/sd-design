import type { CalendarTexts } from './types.js';
import type { createDateUtils } from './utils/date.js';

import { weekdays } from './constants.js';
import { percentageToMinutes } from './utils/conversions.js';
export interface CalendarSurfaceHost {
  prefixCls: string;
  texts: CalendarTexts;
  dateUtils: ReturnType<typeof createDateUtils>;
  config: {
    time: boolean;
    horizontal: boolean;
    twelveHour: boolean;
    timeFrom: number;
    timeTo: number;
    timeStep: number;
    timeCellHeight: number;
    timeAtCursor: boolean;
    editableEvents: { resizeX?: boolean };
    xs: boolean;
    sm: boolean;
    schedules?: readonly unknown[] | undefined;
    allDayEvents: boolean;
    clickToNavigate: boolean;
    ready: boolean;
    theme: string | boolean;
    size: string;
    datePicker: boolean;
    weekNumbers: boolean;
  };
  view: {
    id: string;
    cols: number;
    rows: number;
    isDay: boolean;
    isDays: boolean;
    isWeek: boolean;
    isMonth: boolean;
    isYear: boolean;
    isYears: boolean;
    firstCellDate: Date;
    cellDates: readonly { start: Date }[];
    broaderView: string;
    narrowerView: string;
    broader(): void;
    narrower(): void;
    updateSelectedDate(date: Date | string): void;
  };
  touch: { isDraggingCell: boolean; isDraggingEvent: boolean; isResizingEvent: boolean };
}
export interface CalendarBodyCursor {
  x: number | null;
  y: number | null;
}
export const getCalendarHeadingEnd = (date: Date) =>
  new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1);
export function createCalendarSurfaceRules(
  calendar: CalendarSurfaceHost,
  derived: { isDark: boolean; hasTimeColumn: boolean },
  cursor: CalendarBodyCursor = { x: null, y: null },
) {
  const { config, view, dateUtils, texts, prefixCls, touch: touchState } = calendar;
  const bodyStyles = () => ({
    [`--${prefixCls}-grid-columns`]: view.cols,
    [`--${prefixCls}-grid-rows`]: view.rows,
    [`--${prefixCls}-body-max-height`]: config.time
      ? `${(config.timeCellHeight * (config.timeTo - config.timeFrom)) / config.timeStep}px`
      : undefined,
  });
  const timeAtCursor = () => {
    const isHzl = config.horizontal;
    const cursorPercent = isHzl ? cursor.x : cursor.y;
    if (cursorPercent === null) return { style: {}, time: '' };
    const time = dateUtils.formatTime(
      percentageToMinutes(cursorPercent, config),
      config.twelveHour ? 'h:mm{am}' : 'HH:mm',
    );
    return {
      style: { [isHzl ? 'left' : 'top']: `${cursorPercent}%` },
      time,
    };
  };
  const titleEventHandlers = () => (config.clickToNavigate ? { click: onTitleClick } : {});
  const dayLabelSize = () => {
    if (config.xs) return 'day-xs';
    if (config.sm || view.isDays || view.isMonth) return 'day-sm';
    return 'day';
  };
  const showHeadings = () => {
    const isDayDaysWeekOrMonthView = view.isDay || view.isDays || view.isWeek || view.isMonth;
    return isDayDaysWeekOrMonthView && !(view.isDay && !config.schedules && !config.allDayEvents);
  };
  const weekDays = () => {
    // Regardless of how many view rows, we always want to display a maximum of view cols headings,
    // hence the slice(0, view.cols).
    const {
      weekDays: dayNames,
      weekDaysShort: dayNamesShort,
      weekDaysMin: dayNamesMin,
    } = calendar.texts;
    return view.cellDates
      .slice(0, config.horizontal ? view.rows : view.cols)
      .map(({ start }: { start: Date }) => {
        // Map JS getDay() (Sun=0) to Mon-first index (Mon=0, Sun=6).
        const dayIdx = (start.getDay() + 6) % 7;
        return {
          'id': weekdays[start.getDay()],
          'date': start,
          'dateNumber': start.getDate(),
          'day': dayNames[dayIdx],
          'day-sm': dayNamesShort[dayIdx],
          'day-xs': dayNamesMin[dayIdx],
          'isToday': dateUtils.isToday(start),
        };
      });
  };
  const timeCells = () => {
    const cells = [];
    const noon = 12 * 60;

    for (let i = config.timeFrom; i < config.timeTo; i += config.timeStep) {
      const isLastCell = i + config.timeStep > config.timeTo;
      const hours = ~~(i / 60); // 0 to 23.
      const mins = i % 60;
      const amPm = texts[i < noon ? 'am' : 'pm'];

      let cellHeight = null;
      // If last cell, check if the cell is full or truncated.
      // E.g. timeStep = 1h, timeTo = 19h30. -> The last cell will be --${prefixCls}-time-cell-size * 0.5%.
      if (isLastCell) {
        const percentageOfFullCell = (config.timeTo - i) / config.timeStep;
        cellHeight = `calc(var(--${prefixCls}-time-cell-size) * ${percentageOfFullCell})`;
      }

      cells.push({
        minutesSum: i, // The sum of hours + minutes in minutes.
        hours,
        minutes: mins,
        formatted12: `${!(hours % 12) ? 12 : hours % 12}${mins ? `:${mins.toString().padStart(2, '0')}` : ''}${amPm}`,
        formatted24: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
        height: cellHeight,
      });
    }
    return cells;
  };
  const hasTimeColumn = () => config.time && (view.isDay || view.isDays || view.isWeek);
  const weekNumbers = () => {
    return Array(view.rows)
      .fill(0)
      .map((v, i) => {
        return dateUtils.getWeek(dateUtils.addDays(view.firstCellDate, 7 * i));
      });
  };
  const wrapperClasses = () => ({
    [`${prefixCls}--ready`]: config.ready,
    [`${prefixCls}--${config.theme}-theme`]: config.theme,
    [`${prefixCls}--${config.size}`]: true,
    [`${prefixCls}--date-picker`]: config.datePicker,
    [`${prefixCls}--dark`]: derived.isDark,
    [`${prefixCls}--light`]: !derived.isDark,
    [`${prefixCls}--${view.id}-view`]: true,
    [`${prefixCls}--view-has-time`]: derived.hasTimeColumn,
    [`${prefixCls}--timeless`]: !config.time,
    [`${prefixCls}--dragging-cell`]: touchState.isDraggingCell,
    [`${prefixCls}--dragging-event`]: touchState.isDraggingEvent,
    [`${prefixCls}--resizing-event`]: touchState.isResizingEvent,
    [`${prefixCls}--has-schedules`]: config.schedules?.length,
    [`${prefixCls}--horizontal`]: config.horizontal,
  });
  const wrapperStyles = () => ({
    [`--${prefixCls}-time-cell-size`]: config.timeCellHeight && `${config.timeCellHeight}px`,
    [`--${prefixCls}-schedules-count`]: config.schedules?.length ?? 0,
  });
  const scrollableElClasses = () => ({
    [`${prefixCls}__scrollable--row`]:
      derived.hasTimeColumn || (config.weekNumbers && view.isMonth),
    // Keep the states inside the Vue transition wrapper for smooth CSS transitions.
    [`${prefixCls}__scrollable--${view.id}-view`]: true,
    [`${prefixCls}__scrollable--has-schedules`]: config.schedules?.length,
    [`${prefixCls}__scrollable--no-schedules`]: !config.schedules?.length,
    [`${prefixCls}__scrollable--horizontal`]: config.horizontal,
    [`${prefixCls}__scrollable--no-all-day-bar`]: !config.allDayEvents,
    [`${prefixCls}__scrollable--has-all-day-bar`]: config.allDayEvents,
  });
  const onTitleClick = () => {
    if (config.clickToNavigate) view.broader();
  };
  const headingCell = (day: { date: Date; isToday: boolean }) => ({
    start: day.date,
    end: getCalendarHeadingEnd(day.date),
    isToday: day.isToday,
    goNarrower: () => view.narrower(),
    goBroader: () => view.broader(),
    broader: view.broaderView,
    narrower: view.narrowerView,
  });
  const domEvents = {
    click: (date: Date) => {
      if (view.isDays || view.isWeek) view.updateSelectedDate(date);
    },
  };
  return {
    bodyStyles,
    timeAtCursor,
    titleEventHandlers,
    dayLabelSize,
    showHeadings,
    weekDays,
    timeCells,
    hasTimeColumn,
    weekNumbers,
    wrapperClasses,
    wrapperStyles,
    scrollableElClasses,
    headingCell,
    headingEnd: getCalendarHeadingEnd,
    domEvents,
  };
}
