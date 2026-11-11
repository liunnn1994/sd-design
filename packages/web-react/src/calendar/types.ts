import type { CalendarConfigInput } from '@sdata/web-core/calendar/config';
import type { CalendarEventInput, CalendarId } from '@sdata/web-core/calendar/types';
import type { CSSProperties } from 'react';

export interface CalendarSchedule {
  id?: CalendarId;
  label?: string;
  class?: string;
  color?: string;
  hide?: boolean;
  style?: CSSProperties;
}

export interface CalendarOptions extends Partial<CalendarConfigInput<CalendarSchedule>> {
  stackEvents?: boolean;
  currentTimeLabel?: boolean;
  eventCreateMinDrag?: number;
  events?: CalendarEventInput[];
  locale?: string;
  multidayEvents?: boolean;
  snapToInterval?: number;
  startWeekOnSunday?: boolean;
  theme?: string | boolean;
  timeCellHeight?: number;
  timeFormat?: string;
  timeFrom?: number;
  timeStep?: number;
  timeTo?: number;
  titleBar?: boolean;
  todayButton?: boolean;
  twelveHour?: boolean;
  viewDate?: string | Date;
  viewDayOffset?: number;
  viewsBar?: boolean;
  watchRealTime?: boolean;
  weekNumbers?: boolean;
}

export type {
  CalendarDragData,
  CalendarEventInteraction,
  CalendarEventDragEnd,
  CalendarEventResize,
  CalendarEventResizeEnd,
  CalendarEventDrop,
  CalendarEventDropped,
  CalendarId,
  CalendarRange,
  CalendarEvent,
  CalendarEventInput,
  CalendarEventMeta,
  CalendarCell,
  CalendarTexts,
  CalendarEmit,
  CalendarListener,
  SpecialHoursInput,
  SpecialHours,
  SpecialHoursRange,
  SpecialHoursDay,
  DisallowedHours,
} from '@sdata/web-core/calendar/types';
