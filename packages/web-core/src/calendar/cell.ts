import type { createCalendarEvents } from './events.js';
import type {
  CalendarEvent,
  CalendarEventInput,
  CalendarCell,
  CalendarId,
  CalendarListener,
  SpecialHours,
  DisallowedHours,
} from './types.js';
import type { createDateUtils } from './utils/date.js';

import { months, weekdays } from './constants.js';
import { clampDragCreateDayMinutes } from './special-hours-allow-events.js';
import { minutesToPercentage, percentageToMinutes } from './utils/conversions.js';
export interface CalendarCellProps {
  start: Date;
  end: Date;
  index: number;
  allDay: boolean;
}
export interface CalendarCellSchedule {
  id: CalendarId;
}
export interface CalendarCellHost<Schedule extends CalendarCellSchedule = CalendarCellSchedule> {
  prefixCls: string;
  dateUtils: ReturnType<typeof createDateUtils>;
  config: {
    horizontal: boolean;
    time: boolean;
    timeFrom: number;
    timeTo: number;
    snapToInterval: number;
    specialHoursDisallowed?: DisallowedHours | undefined;
    schedules?: readonly Schedule[] | undefined;
    editableEvents: { create: boolean; drag: boolean };
    eventCreateMinDrag: number;
    availableViews: Record<string, { cols: number; rows: number }>;
    xs: boolean;
    datePicker: boolean;
    allDayEvents: boolean;
    stackEvents: boolean;
    showCellEventCount: boolean | number;
    specialHours?: SpecialHours | undefined;
    minTimestamp: number | null;
    maxTimestamp: number | null;
    disableDays: readonly unknown[];
    clickToNavigate: boolean;
    eventListeners: {
      cell: Record<string, CalendarListener>;
      event: Record<string, CalendarListener>;
    };
  };
  view: {
    id: string;
    start: Date;
    selectedDate: Date | null;
    isDay: boolean;
    isDays: boolean;
    isWeek: boolean;
    isMonth: boolean;
    isYear: boolean;
    isYears: boolean;
    updateSelectedDate(date: Date | string): void;
    updateViewDate(date: Date | string): void;
    switch(id: string, date?: Date | string): void;
    createEvent(event: CalendarEventInput): unknown;
  };
  eventsManager: Pick<
    ReturnType<typeof createCalendarEvents>,
    'getEventsInRange' | 'getCellOverlappingEvents' | 'deleteEvent'
  >;
  touch: { isDraggingCell: boolean };
  dnd: {
    cellDragEnter(e: DragEvent, cell: CalendarCell): void;
    cellDragOver(e: DragEvent, cell: CalendarCell): void;
    cellDragLeave(e: DragEvent, cell: CalendarCell): void;
    cellDragDrop(e: DragEvent, cell: CalendarCell, allDay: boolean): Promise<void>;
  };
}
export type CalendarCellTouch = {
  dragging: boolean;
  holding: boolean;
  holdTimer: ReturnType<typeof setTimeout> | null;
  thresholdPassed: boolean;
  canTouchAndDrag: boolean | null;
  touchAndDragTimer: ReturnType<typeof setTimeout> | null;
  startX: number;
  startY: number;
  moveX: number;
  moveY: number;
  startPercentageX: number;
  startPercentageY: number;
  movePercentageX: number;
  movePercentageY: number;
  schedule: string | number | null;
};
export const createCalendarCellTouch = (): CalendarCellTouch => ({
  dragging: false,
  holding: false, // When the cell is clicked and hold for a certain amount of time.
  holdTimer: null, // Cell click and hold detection.
  thresholdPassed: false, // If the drag threshold has been passed.
  canTouchAndDrag: null, // Wait for 500ms before allowing an event to be dragged after touchstart.
  touchAndDragTimer: null, // Timer for canTouchAndDrag.
  startX: 0, // The x position at the start of the drag (mousedown or touchstart).
  startY: 0, // The y position at the start of the drag (mousedown or touchstart).
  moveX: 0,
  moveY: 0,
  startPercentageX: 0, // The x position in percentage at the start of the drag (mousedown or touchstart).
  startPercentageY: 0, // The y position in percentage at the start of the drag (mousedown or touchstart).
  movePercentageX: 0,
  movePercentageY: 0,
  schedule: null,
});
export type SpecialHourRange = {
  from: number;
  to: number;
  class?: string;
  label?: string;
};
export type PositionedSpecialHour = {
  style: Record<string, string>;
  class?: string;
  label?: string;
};
export type CalendarCellEventStyle = {
  left?: string;
  right?: string;
  top?: string;
  width?: string;
  height?: string;
};
export type CalendarCellOverlaps = ReturnType<
  CalendarCellHost['eventsManager']['getCellOverlappingEvents']
>;
export interface CalendarCellDerived {
  awaitingEventCreation: boolean;
  isToday: boolean;
  cellEvents: CalendarEvent[];
  cellForegroundEvents: CalendarEvent[];
  overlappingEvents: CalendarCellOverlaps;
  specialHours:
    | { default: PositionedSpecialHour[]; schedules: Record<string, PositionedSpecialHour[]> }
    | undefined;
  isBeforeMinDate: boolean;
  isAfterMaxDate: boolean;
  isDisabled: boolean;
  deletedIds: CalendarId[];
}
export function createCalendarCellRules<Schedule extends CalendarCellSchedule>(
  host: CalendarCellHost<Schedule>,
  props: CalendarCellProps,
  touch: CalendarCellTouch,
  derived: CalendarCellDerived,
) {
  const { config, view, dateUtils, eventsManager, prefixCls } = host;
  const getPositionedSpecialHours = (ranges: SpecialHourRange[]) => {
    const list = ranges || [];
    const isHzl = config.horizontal;
    const { timeFrom, timeTo } = config;
    const positioned = [];

    for (let i = 0; i < list.length; i++) {
      const range = list[i];
      let { from, to, class: classes, label } = range;

      // Skip incorrect special hours or ranges completely outside the visible timeline.
      if (isNaN(from) || isNaN(to) || timeFrom >= to || timeTo <= from) continue;

      from = Math.max(timeFrom, from);
      to = Math.min(timeTo, to);

      const start = minutesToPercentage(from, config);
      const size = minutesToPercentage(to, config) - start;

      positioned.push({
        style: {
          [isHzl ? 'left' : 'top']: `${start}%`,
          [isHzl ? 'width' : 'height']: `${size}%`,
        },
        label,
        class: classes,
      });
    }

    return positioned;
  };
  const isToday = () => dateUtils.isToday(props.start);
  const eventPlaceholder = () => {
    const isHzl = config.horizontal;
    const startPercentageVal = isHzl ? touch.startPercentageX : touch.startPercentageY;
    const movePercentageVal = isHzl ? touch.movePercentageX : touch.movePercentageY;

    const anchorDayMinutes = percentageToMinutes(startPercentageVal, config);
    const cursorDayMinutes = percentageToMinutes(movePercentageVal, config);

    let startPercentage = Math.min(startPercentageVal, movePercentageVal);
    let endPercentage = Math.max(startPercentageVal, movePercentageVal);
    let startMinutes = percentageToMinutes(startPercentage, config);
    let endMinutes = percentageToMinutes(endPercentage, config);

    // Snap the event to the nearest interval if set.
    if (config.snapToInterval) {
      startMinutes = dateUtils.snapToInterval(startMinutes, config.snapToInterval);
      endMinutes = dateUtils.snapToInterval(endMinutes, config.snapToInterval);
      startPercentage = minutesToPercentage(startMinutes, config);
      endPercentage = minutesToPercentage(endMinutes, config);
    }

    if (config.time && config.specialHoursDisallowed?.hasAny && !props.allDay) {
      const clamped = clampDragCreateDayMinutes({
        anchorDayMinutes,
        cursorDayMinutes,
        snappedLow: startMinutes,
        snappedHigh: endMinutes,
        cellDate: props.start,
        schedule: touch.schedule,
        disallowed: config.specialHoursDisallowed,
        hasSchedules: !!(config.schedules && config.schedules.length),
      });
      startMinutes = clamped.low;
      endMinutes = clamped.high;
      startPercentage = minutesToPercentage(startMinutes, config);
      endPercentage = minutesToPercentage(endMinutes, config);
    }

    return {
      style: {
        [isHzl ? 'left' : 'top']: `${startPercentage}%`,
        [isHzl ? 'width' : 'height']: `${Math.abs(endPercentage - startPercentage)}%`,
      },
      startMinutes,
      endMinutes,
      start: dateUtils.formatMinutes(startMinutes),
      end: dateUtils.formatMinutes(endMinutes),
      ...(touch.schedule != null ? { schedule: touch.schedule } : {}),
    };
  };
  const isCreatingEvent = () => {
    const isCreating =
      config.editableEvents.create && (touch.dragging || derived.awaitingEventCreation);
    const hasPassedMinDrag =
      (config.eventCreateMinDrag && touch.thresholdPassed) || !config.eventCreateMinDrag;
    const canCreateEvent = touch.canTouchAndDrag !== false; // Allow if null (mouse) or true (touch after delay).
    return isCreating && hasPassedMinDrag && canCreateEvent;
  };
  const classes = () => {
    const now = new Date();
    const viewYear = view.start.getFullYear();
    const viewMonth = view.start.getMonth();
    const y = props.start.getFullYear();
    const m = props.start.getMonth();
    const weekday = weekdays[props.start.getDay()];

    return {
      [`${prefixCls}__cell--${weekday}`]: view.isDay || view.isDays || view.isWeek || view.isMonth,
      [`${prefixCls}__cell--${months[m]}`]: view.isYear,
      [`${prefixCls}__cell--${y}`]: view.isYears,
      [`${prefixCls}__cell--today`]: derived.isToday,
      [`${prefixCls}__cell--current-month`]:
        view.isYear && y === now.getFullYear() && m === now.getMonth(),
      [`${prefixCls}__cell--current-year`]: view.isYears && y === now.getFullYear(),
      [`${prefixCls}__cell--out-of-range`]: view.isMonth && (y !== viewYear || m !== viewMonth),
      [`${prefixCls}__cell--before-min`]: derived.isDisabled && derived.isBeforeMinDate,
      [`${prefixCls}__cell--after-max`]: derived.isDisabled && derived.isAfterMaxDate,
      [`${prefixCls}__cell--disabled`]: derived.isDisabled,
      [`${prefixCls}__cell--selected`]:
        view.selectedDate &&
        view.selectedDate.getTime() >= props.start.getTime() &&
        view.selectedDate.getTime() <= props.end.getTime(),
      [`${prefixCls}__cell--has-schedules`]: config.schedules?.length,
      [`${prefixCls}__cell--dragging`]: touch.dragging,
      [`${prefixCls}__cell--has-events`]: derived.cellEvents.length,
    };
  };
  const startFormatted = () => dateUtils.formatDate(props.start);
  const formattedCellDate = () => {
    // ! \ IMPORTANT NOTE:
    // If the selectedDate prop would be added to the calendar.view, any click on any cell
    // (triggering an emit of the selectedDate), would trigger a rerendering of all the
    // cells of the view. The following marker is here to monitor that this does not happen
    // with any prop while developing.
    switch (view.id) {
      case 'day':
        return '';
      case 'days':
        // Multi-row days views render the date inside each cell (the headings bar only covers
        // the first row), otherwise the date stays hidden.
        if (config.availableViews.days.rows > 1) return dateUtils.formatDate(props.start, 'D');
        return '';
      case 'week':
        return '';
      case 'month':
        return dateUtils.formatDate(props.start, 'D');
      case 'year':
        return dateUtils.formatDate(props.start, config.xs ? 'MMM' : 'MMMM');
      case 'years':
        return dateUtils.formatDate(props.start, 'YYYY');
      default:
        return '';
    }
  };
  const cellEvents = () => {
    if (config.datePicker) return [];
    return eventsManager.getEventsInRange(props.start, props.end, {
      excludeIds: derived.deletedIds,
      ...(config.allDayEvents ? { allDay: props.allDay } : {}),
    });
  };
  const cellForegroundEvents = () => derived.cellEvents.filter((event) => !event.background);
  const cellEventsPerSchedule = () => {
    return config.schedules?.reduce(
      (obj: Record<string, CalendarEvent[]>, schedule) => {
        obj[schedule.id] = derived.cellEvents.filter((event) => event.schedule === schedule.id);
        return obj;
      },
      {} as Record<string, CalendarEvent[]>,
    );
  };
  const eventStyles = () => {
    if (view.isMonth || view.isYear || view.isYears || props.allDay || !config.time)
      return {} as Record<CalendarId, CalendarCellEventStyle>;
    const isRTL =
      typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl';
    const isHzl = config.horizontal;
    const styles: Record<CalendarId, CalendarCellEventStyle> = {};

    for (const event of derived.cellEvents) {
      const eventId = event._.id;
      const { maxConcurrent = 1, position = 0 } =
        derived.overlappingEvents.cellOverlaps[eventId] || {};

      const rightOrLeft = isRTL ? 'right' : 'left';
      const widthOrHeight = isHzl ? 'height' : 'width';
      styles[eventId] = { [isHzl ? 'top' : rightOrLeft]: `${(100 / maxConcurrent) * position}%` };
      // Stack overlapping events on top of each other if the stackEvents prop is set to true.
      if (config.stackEvents) {
        styles[eventId][widthOrHeight] =
          `${100 / maxConcurrent + (position === maxConcurrent - 1 ? 0 : 15)}%`;
      } else styles[eventId][widthOrHeight] = `${100 / maxConcurrent}%`;
    }
    return styles;
  };
  const eventClasses = () => {
    const classes: Record<CalendarId, string> = {};
    for (const event of derived.cellEvents) {
      const eventId = event._.id;
      const { maxConcurrent = 1, position = 0 } =
        derived.overlappingEvents.cellOverlaps[eventId] || {};

      classes[eventId] = `${prefixCls}__event--stack-${position + 1}-${maxConcurrent}`;
    }
    return classes;
  };
  const showCellEventCount = () => {
    return config.showCellEventCount && derived.cellForegroundEvents.length;
  };
  const specialHours = () => {
    if (!config.specialHours || view.isMonth || view.isYear || view.isYears || props.allDay)
      return undefined;
    const weekday = weekdays[props.start.getDay()];

    // The special hours ranges for the current cell day.
    let daySpecialHours = config.specialHours?.[weekday];
    if (!daySpecialHours) return undefined;

    return {
      default: getPositionedSpecialHours(daySpecialHours.default),
      schedules: Object.entries(daySpecialHours.schedules || {}).reduce<
        Record<string, PositionedSpecialHour[]>
      >((obj, [scheduleId, ranges]) => {
        obj[scheduleId] = getPositionedSpecialHours(ranges as SpecialHourRange[]);
        return obj;
      }, {}),
    };
  };
  const schedulesWithCellSpecialHours = () => {
    const schedules = config.schedules;
    if (!schedules?.length) return [];

    const sh = derived.specialHours;
    if (!sh)
      return schedules.map((schedule: Schedule) => ({
        schedule,
        ranges: [] as PositionedSpecialHour[],
      }));

    const { default: defaultRanges, schedules: byScheduleId } = sh;

    return schedules.map((schedule: Schedule) => {
      const scheduleKey = String(schedule.id);
      const ranges = Object.prototype.hasOwnProperty.call(byScheduleId, scheduleKey)
        ? byScheduleId[scheduleKey]
        : defaultRanges;

      return { schedule, ranges };
    });
  };
  const isBeforeMinDate = () => {
    return config.minTimestamp !== null && config.minTimestamp > props.end.getTime();
  };
  const isAfterMaxDate = () => {
    return config.maxTimestamp !== null && config.maxTimestamp < props.start.getTime();
  };
  const isDisabled = () => {
    const { disableDays } = config;
    const isYearsOrYearView = view.isYear || view.isYears;
    if (
      disableDays.length &&
      disableDays.includes(dateUtils.formatDate(props.start)) &&
      !isYearsOrYearView
    )
      return true;
    return derived.isBeforeMinDate || derived.isAfterMaxDate;
  };
  const cursorInfo = () => {
    const isHzl = config.horizontal;
    const percentageVal = isHzl
      ? touch.movePercentageX || touch.startPercentageX
      : touch.movePercentageY || touch.startPercentageY;
    const minutes = percentageToMinutes(percentageVal, config);
    const date = new Date(props.start);
    date.setMinutes(minutes);

    return {
      x: touch.movePercentageX || touch.startPercentageX,
      y: touch.movePercentageY || touch.startPercentageY,
      date,
    };
  };
  const overlapKey = () =>
    !view.isYears &&
    !view.isYear &&
    derived.cellForegroundEvents
      .map((e) => `${e._.id}${e.start.getTime()}${e.end.getTime()}:${e.schedule}`)
      .join();
  return {
    isToday,
    eventPlaceholder,
    isCreatingEvent,
    classes,
    startFormatted,
    formattedCellDate,
    cellEvents,
    cellForegroundEvents,
    cellEventsPerSchedule,
    eventStyles,
    eventClasses,
    showCellEventCount,
    specialHours,
    schedulesWithCellSpecialHours,
    isBeforeMinDate,
    isAfterMaxDate,
    isDisabled,
    cursorInfo,
    overlapKey,
  };
}
