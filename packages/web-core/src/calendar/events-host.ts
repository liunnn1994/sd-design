import type { CalendarEmit, CalendarEvent, CalendarListener, DisallowedHours } from './types.js';
import type { createDateUtils } from './utils/date.js';

export interface CalendarEventsHost {
  config: {
    events: CalendarEvent[];
    multidayEvents: boolean;
    schedules?: readonly unknown[] | undefined;
    snapToInterval: number;
    time: boolean;
    timeFrom: number;
    timeTo: number;
    horizontal: boolean;
    specialHoursDisallowed?: DisallowedHours | undefined;
    editableEvents: { delete: boolean };
    allDayEvents: boolean;
    eventListeners?: { event: Record<string, CalendarListener> } | undefined;
  };
  dateUtils: ReturnType<typeof createDateUtils>;
  emit: CalendarEmit;
  prefixCls: string;
  touch: {
    isResizingEvent: boolean;
    currentHoveredCell: HTMLElement | null;
  };
}

export interface CalendarEventsAdapter {
  createState<State extends object>(state: State): State;
  createIndex<State extends object>(state: State): State;
  observeEvents(rebuild: () => void): void;
  onDispose(dispose: () => void): void;
}
