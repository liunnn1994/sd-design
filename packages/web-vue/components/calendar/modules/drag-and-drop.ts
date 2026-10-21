import { onBeforeUnmount, reactive } from 'vue';

import { createCalendarDragSession } from '@sdata/web-core/calendar/drag-and-drop';

import type { CalendarState } from '../context';

const createDragAndDrop = createCalendarDragSession((state) => reactive(state) as typeof state);

export function useDragAndDrop(
  calendar: Pick<
    CalendarState,
    'config' | 'view' | 'eventsManager' | 'emit' | 'uid' | 'dateUtils' | 'prefixCls' | 'touch'
  >,
) {
  return createDragAndDrop(calendar, { onDispose: onBeforeUnmount });
}
