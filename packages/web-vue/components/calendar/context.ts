import type { InjectionKey, Ref } from 'vue';

import type {
  CalendarId,
  CalendarEmit,
  CalendarTexts,
  CalendarDateUtils,
  CalendarConfig,
  CalendarEventsManager,
  CalendarView,
  CalendarDnd,
} from './types';

/** Shared reactive state provided to calendar sub-components. */
export interface CalendarState {
  uid: CalendarId;
  prefixCls: string;
  emit: CalendarEmit;
  texts: CalendarTexts;
  dateUtils: CalendarDateUtils;
  now: Date;
  config: CalendarConfig;
  eventsManager: CalendarEventsManager;
  view: CalendarView;
  dnd: CalendarDnd;
  touch: {
    isDraggingCell: boolean;
    isDraggingEvent: boolean;
    isResizingEvent: boolean;
    currentHoveredCell: HTMLElement | null;
  };
}
export const calendarInjectionKey: InjectionKey<CalendarState> = Symbol('SDCalendar');
export const calendarElInjectionKey: InjectionKey<Ref<HTMLElement | null>> = Symbol('SDCalendarEl');
