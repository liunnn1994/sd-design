import type { ComponentRef as ReactComponentRef } from 'react';

import type { Calendar } from './root.js';

export { Calendar, Calendar as default } from './root.js';
export type {
  CalendarProps,
  CalendarExposed,
  CalendarState,
  CalendarView,
  CalendarViewChange,
  CalendarCellInteraction,
  CalendarEventCreate,
} from './root-types.js';
export type {
  CalendarDragData,
  CalendarEventInteraction,
  CalendarEventDragEnd,
  CalendarEventResize,
  CalendarEventResizeEnd,
  CalendarEventDrop,
  CalendarEventDropped,
  CalendarOptions,
  CalendarSchedule,
  CalendarEvent,
  CalendarEventInput,
  CalendarEventMeta,
  CalendarCell,
  CalendarId,
  CalendarRange,
  CalendarTexts,
  CalendarListener,
  SpecialHoursInput,
  SpecialHours,
  SpecialHoursRange,
  SpecialHoursDay,
  DisallowedHours,
} from './types.js';

export type CalendarInstance = ReactComponentRef<typeof Calendar>;
