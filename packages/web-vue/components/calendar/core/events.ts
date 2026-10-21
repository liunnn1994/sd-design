import { onBeforeUnmount, reactive, shallowReactive, watch } from 'vue';
import type { ShallowReactive } from 'vue';

import { createCalendarEvents } from '@sdata/web-core/calendar/events';

import type { CalendarState } from '../context';

type CalendarEvents = ReturnType<typeof createCalendarEvents>;
type VueCalendarEvents = CalendarEvents & {
  eventsIndex: ShallowReactive<CalendarEvents['eventsIndex']>;
};

export const useEvents = (
  calendar: Pick<CalendarState, 'config' | 'dateUtils' | 'emit' | 'prefixCls' | 'touch'>,
) => {
  const { config } = calendar;
  return createCalendarEvents(calendar, {
    // Calendar event/index states contain plain data and native handles, never Vue refs.
    createState: (state) => reactive(state) as typeof state,
    createIndex: (state) => shallowReactive(state),
    observeEvents: (rebuild) => {
      watch(() => config.events.slice(), rebuild, { immediate: true });
    },
    onDispose: onBeforeUnmount,
  }) as VueCalendarEvents;
};
