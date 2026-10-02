import type { Ref, UnwrapRef } from 'vue';

import type { ScrollbarInstance } from '../scrollbar';
import type { useConfig } from './core/config';
import type { useEvents } from './core/events';
import type { useView } from './core/view';
import type { useDragAndDrop } from './modules/drag-and-drop';
import type { createDateUtils } from './utils/date';

export type CalendarId = string | number;
export interface CalendarRange {
  start: Date;
  end: Date;
  schedule?: CalendarId | null;
}
export interface SpecialHoursRange {
  from: number;
  to: number;
  class?: string;
  label?: string;
  allowEvents?: boolean;
}
export interface SpecialHoursDay {
  default: SpecialHoursRange[];
  schedules: Record<string, SpecialHoursRange[]>;
}
export type SpecialHours = Record<string, SpecialHoursDay>;
export interface DisallowedHours {
  hasAny: boolean;
  byWeekday: Record<
    string,
    { default?: SpecialHoursRange[]; schedules?: Record<string, SpecialHoursRange[]> }
  >;
}
export interface CalendarSchedule {
  id?: CalendarId;
  label?: string;
  class?: string;
  color?: string;
  hide?: boolean;
  style?: import('vue').CSSProperties;
}
export interface CalendarEventMeta {
  id: CalendarId;
  multiday: boolean;
  startFormatted: string;
  endFormatted: string;
  startMinutes: number;
  endMinutes: number;
  startTimeFormatted24: string;
  startTimeFormatted12: string;
  endTimeFormatted24: string;
  endTimeFormatted12: string;
  duration: number;
  cachedStart?: number;
  cachedEnd?: number;
  deleting?: boolean;
  deleted?: boolean;
  fireCreated?: boolean;
  dragging?: boolean;
  draggingGhost?: boolean;
  $el?: HTMLElement | null;
  register?: (node: HTMLElement) => void;
  unregister?: () => void;
}
export interface CalendarEvent extends CalendarRange {
  [key: string]: unknown;
  _: CalendarEventMeta;
  title?: string;
  content?: string;
  class?: string;
  backgroundColor?: string;
  background?: boolean;
  color?: string;
  allDay?: boolean;
  recurring?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  deletable?: boolean;
  delete: (stage?: number) => Promise<boolean | void>;
  isOverlapping: (at?: CalendarRange | null) => number;
  getOverlappingEvents: (at?: CalendarRange | null) => CalendarEvent[];
}
export interface CalendarEventInput {
  [key: string]: unknown;
  start: Date | string;
  end: Date | string;
  schedule?: CalendarId | null;
  allDay?: boolean;
  _?: CalendarEventMeta;
}
export interface CalendarCell extends CalendarRange {
  highlighted?: boolean;
  highlightedSchedule?: CalendarId | null;
  isDisabled?: boolean;
}
export interface CalendarTexts {
  monthsGenitive?: string[];
  weekDays: string[];
  weekDaysShort: string[];
  weekDaysMin: string[];
  months: string[];
  years: string;
  year: string;
  month: string;
  week: string;
  day: string;
  days: string;
  today: string;
  noEvent: string;
  allDay: string;
  deleteEvent: string;
  createEvent: string;
  dateFormat: string;
  am: string;
  pm: string;
  truncations: boolean;
  dateLocale?: string;
}
export type CalendarConfig = UnwrapRef<ReturnType<typeof useConfig>>;
export type CalendarEventsManager = UnwrapRef<ReturnType<typeof useEvents>>;
export type CalendarView = UnwrapRef<ReturnType<typeof useView>>;
export type CalendarDnd = ReturnType<typeof useDragAndDrop>;
export type CalendarDateUtils = ReturnType<typeof createDateUtils>;
export type CalendarElementRef = Ref<HTMLElement | null>;
export type CalendarScrollbarRef = Readonly<Ref<ScrollbarInstance | null>>;
export type CalendarEmit = (
  event:
    | 'event-created'
    | 'event-delete'
    | 'event-drag-end'
    | 'event-drag-start'
    | 'event-dropped'
    | 'ready'
    | 'update:events'
    | 'update:selectedDate'
    | 'update:view'
    | 'update:viewDate'
    | 'view-change',
  ...args: unknown[]
) => void;

export type CalendarListener = {
  bivarianceHack(
    ...args: unknown[]
  ): boolean | CalendarEvent | void | Promise<boolean | CalendarEvent | void>;
}['bivarianceHack'];
