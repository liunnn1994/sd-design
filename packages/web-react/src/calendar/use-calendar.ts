import { createCalendarScroll } from '@sdata/web-core/calendar/clock';
import { minutesToPercentage } from '@sdata/web-core/calendar/utils/conversions';
import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useId, useReducer, useRef, useState } from 'react';

import type { CalendarEmit, CalendarOptions } from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { resolveCalendarConfig } from './config.js';
import { useCalendarDrag } from './use-drag.js';
import { useCalendarEvents } from './use-events.js';
import { useCalendarTexts } from './use-texts.js';
import { useCalendarView } from './use-view.js';

export function useCalendar(
  options: CalendarOptions,
  adapter: {
    ready: boolean;
    emit: CalendarEmit;
    listeners: Record<string, unknown>;
    scrollTop(value: number): void;
  },
) {
  const uid = useId();
  const prefixCls = usePrefix('calendar');
  const texts = useCalendarTexts(options);
  const liveTexts = useRef(texts);
  liveTexts.current = texts;
  const [dateUtils] = useState(() => createDateUtils(() => liveTexts.current.dateLocale));
  const [, render] = useReducer((value: number) => value + 1, 0);
  const [touch] = useState(
    () =>
      new Proxy(
        {
          isDraggingCell: false,
          isDraggingEvent: false,
          isResizingEvent: false,
          currentHoveredCell: null as HTMLElement | null,
        },
        {
          set(target, key, value) {
            if (Object.is(Reflect.get(target, key), value)) return true;
            const result = Reflect.set(target, key, value);
            render();
            return result;
          },
        },
      ),
  );
  const current = useRef<ReturnType<typeof useCalendarView> | null>(null);
  const inputConfig = Object.assign(
    resolveCalendarConfig(
      options,
      {
        dateUtils,
        view: {
          get id(): string {
            return current.current?.state.id ?? inputConfig.view;
          },
          get isDay() {
            return this.id === 'day';
          },
          get isDays() {
            return this.id === 'days';
          },
          get isWeek() {
            return this.id === 'week';
          },
          get isMonth() {
            return this.id === 'month';
          },
          get isYear() {
            return this.id === 'year';
          },
        },
      },
      adapter.listeners,
    ),
    { ready: adapter.ready },
  );
  const store = useCalendarEvents({
    config: inputConfig,
    dateUtils,
    prefixCls,
    touch,
    emit: adapter.emit,
  });
  // The public host and drag controller mutate the normalized private store, never input props.
  const config = new Proxy(
    { ...inputConfig, events: store.events },
    {
      get(_target, key) {
        return key === 'events' ? store.events : Reflect.get(inputConfig, key);
      },
    },
  );
  const controller = useCalendarView({
    config,
    texts,
    dateUtils,
    emit: adapter.emit,
    getViewEvents: store.manager.getViewEvents,
  });
  current.current = controller;
  const { navigation, state, layout } = controller;
  const nowInMinutes = dateUtils.dateToMinutes(state.now);
  const todaysTimePosition = minutesToPercentage(nowInMinutes, config);
  const viewSnapshot = {
    ...state,
    ...layout,
    events: store.manager.getViewEvents(layout.cellDates),
    nowLine: {
      show: layout.nowLineVisible,
      nowInMinutes,
      todaysTimePosition,
      style: { [config.horizontal ? 'left' : 'top']: `${todaysTimePosition}%` },
      currentTime: dateUtils.formatTime(state.now, config.twelveHour ? 'h:mm {am}' : 'HH:mm'),
    },
    switch: (id: string, date?: Date | string) => navigation.switchView(id, true, date),
    broader: navigation.switchToBroaderView,
    narrower: navigation.switchToNarrowerView,
    previous: navigation.previous,
    next: navigation.next,
    navigate: navigation.navigate,
    goToToday: navigation.goToToday,
    updateViewDate: navigation.updateViewDate,
    updateSelectedDate: navigation.updateSelectedDate,
    ...createCalendarScroll({ config, scrollTop: adapter.scrollTop }),
    createEvent: store.manager.createEvent,
    deleteEvent: store.manager.deleteEvent,
  };
  const latestView = useRef(viewSnapshot);
  latestView.current = viewSnapshot;
  const [view] = useState(
    () =>
      new Proxy(
        { ...viewSnapshot },
        {
          get(_target, key) {
            return Reflect.get(latestView.current, key);
          },
        },
      ),
  );
  const dnd = useCalendarDrag({
    uid,
    prefixCls,
    config,
    view,
    eventsManager: store.manager,
    touch,
    emit: adapter.emit,
  });
  return {
    uid,
    prefixCls,
    config,
    texts,
    dateUtils,
    touch,
    view,
    dnd,
    eventsManager: store.manager,
    controller,
  };
}
