import type { CalendarId } from '@sdata/web-core/calendar/types';

import type { Ref, UnwrapRef } from 'vue';

import type { ScrollbarInstance } from '../scrollbar';
import type { useConfig } from './core/config';
import type { useEvents } from './core/events';
import type { useView } from './core/view';
import type { useDragAndDrop } from './modules/drag-and-drop';
import type { createDateUtils } from './utils/date';
export type {
  CalendarId,
  CalendarRange,
  SpecialHoursRange,
  SpecialHoursDay,
  SpecialHours,
  DisallowedHours,
  CalendarEventMeta,
  CalendarEvent,
  CalendarEventInput,
  CalendarCell,
  CalendarTexts,
  CalendarEmit,
  CalendarListener,
} from '@sdata/web-core/calendar/types';

export interface CalendarSchedule {
  id?: CalendarId;
  label?: string;
  class?: string;
  color?: string;
  hide?: boolean;
  style?: import('vue').CSSProperties;
}
export type CalendarConfig = UnwrapRef<ReturnType<typeof useConfig>>;
export type CalendarEventsManager = UnwrapRef<ReturnType<typeof useEvents>>;
export type CalendarView = UnwrapRef<ReturnType<typeof useView>>;
export type CalendarDnd = ReturnType<typeof useDragAndDrop>;
export type CalendarDateUtils = ReturnType<typeof createDateUtils>;
export type CalendarElementRef = Ref<HTMLElement | null>;
export type CalendarScrollbarRef = Readonly<Ref<ScrollbarInstance | null>>;
