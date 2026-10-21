import type { createCalendarEvents } from './events.js';
import type {
  CalendarEmit,
  CalendarEvent,
  CalendarId,
  CalendarListener,
  DisallowedHours,
} from './types.js';

export interface CalendarDragHost {
  uid: CalendarId;
  prefixCls: string;
  emit: CalendarEmit;
  config: {
    events: CalendarEvent[];
    horizontal: boolean;
    time: boolean;
    timeStep: number;
    timeFrom: number;
    timeTo: number;
    snapToInterval: number;
    schedules?: readonly { id?: CalendarId | undefined }[] | undefined;
    specialHoursDisallowed?: DisallowedHours | undefined;
    eventListeners: { event: Record<string, CalendarListener> };
  };
  view: {
    id: string;
    firstCellDate: Date;
    narrowerView?: string | null | undefined;
    switch(id: string, date?: Date | string): void;
  };
  eventsManager: Pick<
    ReturnType<typeof createCalendarEvents>,
    'getEvent' | 'getEventsInRange' | 'createEvent' | 'refreshEventMeta'
  >;
  touch: { isDraggingEvent: boolean; isResizingEvent: boolean };
}

export interface CalendarDragAdapter {
  onDispose(dispose: () => void): void;
}
