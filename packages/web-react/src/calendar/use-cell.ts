import type {
  CalendarCellDerived,
  CalendarCellHost,
  CalendarCellProps,
} from '@sdata/web-core/calendar/cell';
import type { CalendarCellAdapter } from '@sdata/web-core/calendar/cell-interaction';

import { createCalendarCellRules, createCalendarCellTouch } from '@sdata/web-core/calendar/cell';
import { createCalendarCellInteraction } from '@sdata/web-core/calendar/cell-interaction';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { CalendarId } from './types.js';

export type CalendarCellAdapterHost<Schedule extends { id: CalendarId } = { id: CalendarId }> =
  CalendarCellHost<Schedule> & {
    view: {
      broaderView: string | undefined;
      narrowerView: string | undefined;
      broader(): void;
      narrower(): void;
    };
  };

export function useCalendarCell<Schedule extends { id: CalendarId }>(
  host: CalendarCellAdapterHost<Schedule>,
  props: CalendarCellProps,
) {
  const live = useRef({ host, props });
  live.current = { host, props };
  const [, render] = useReducer((value: number) => value + 1, 0);
  const [cell] = useState(() => {
    const state = {
      active: false,
      element: null as HTMLElement | null,
      awaiting: false,
      deletedIds: [] as CalendarId[],
      overlapKey: '',
      overlaps: { cellOverlaps: {}, longestStreak: 0 } as CalendarCellDerived['overlappingEvents'],
      listeners: {} as CalendarCellAdapter['listeners'],
      interaction: null as ReturnType<typeof createCalendarCellInteraction> | null,
    };
    const refresh = () => {
      if (state.active) render();
    };
    const touch = new Proxy(createCalendarCellTouch(), {
      set(target, key, value) {
        if (Reflect.get(target, key) === value) return true;
        Reflect.set(target, key, value);
        refresh();
        return true;
      },
    });
    const forward = <T extends object>(read: () => T) =>
      // React freezes development props; a mutable target permits forwarding newer values.
      new Proxy({ ...read() }, { get: (_, key) => Reflect.get(read(), key) });
    const currentProps = forward(() => live.current.props);
    const currentHost: CalendarCellAdapterHost<Schedule> = {
      get prefixCls() {
        return live.current.host.prefixCls;
      },
      config: forward(() => live.current.host.config),
      view: forward(() => live.current.host.view),
      dateUtils: forward(() => live.current.host.dateUtils),
      eventsManager: forward(() => live.current.host.eventsManager),
      dnd: forward(() => live.current.host.dnd),
      touch: new Proxy(host.touch, {
        get: (_, key) => Reflect.get(live.current.host.touch, key),
        set: (_, key, value) => Reflect.set(live.current.host.touch, key, value),
      }),
    };
    const derived: CalendarCellDerived = {
      get awaitingEventCreation() {
        return state.awaiting;
      },
      get isToday() {
        return rules.isToday();
      },
      get cellEvents() {
        return rules.cellEvents();
      },
      get cellForegroundEvents() {
        return rules.cellForegroundEvents();
      },
      get overlappingEvents() {
        return state.overlaps;
      },
      get specialHours() {
        return rules.specialHours();
      },
      get isBeforeMinDate() {
        return rules.isBeforeMinDate();
      },
      get isAfterMaxDate() {
        return rules.isAfterMaxDate();
      },
      get isDisabled() {
        return rules.isDisabled();
      },
      get deletedIds() {
        return state.deletedIds;
      },
    };
    const rules: ReturnType<typeof createCalendarCellRules<Schedule>> = createCalendarCellRules(
      currentHost,
      currentProps,
      touch,
      derived,
    );
    const details = {
      get start() {
        return currentProps.start;
      },
      get end() {
        return currentProps.end;
      },
      get events() {
        return rules.cellEvents();
      },
      get today() {
        return rules.isToday();
      },
      get content() {
        return rules.formattedCellDate();
      },
      get schedule() {
        return touch.schedule ?? undefined;
      },
      goNarrower: () => currentHost.view.narrower(),
      goBroader: () => currentHost.view.broader(),
      get broader() {
        return currentHost.view.broaderView;
      },
      get narrower() {
        return currentHost.view.narrowerView;
      },
    };
    const info = () => details;
    const adapter: CalendarCellAdapter = {
      get element() {
        return state.element;
      },
      get info() {
        return info();
      },
      get cursor() {
        return rules.cursorInfo();
      },
      get placeholder() {
        return rules.eventPlaceholder();
      },
      get isCreating() {
        return rules.isCreatingEvent();
      },
      get isDisabled() {
        return rules.isDisabled();
      },
      get listeners() {
        return state.listeners;
      },
      get awaitingEventCreation() {
        return state.awaiting;
      },
      set awaitingEventCreation(value) {
        state.awaiting = value;
        refresh();
      },
      get deletedIds() {
        return state.deletedIds;
      },
    };
    return {
      state,
      info,
      touch,
      rules,
      adapter,
      currentHost,
      currentProps,
      ref(element: HTMLElement | null) {
        state.element = element;
      },
      deleteEvent(id: CalendarId) {
        if (!state.deletedIds.includes(id)) {
          state.deletedIds.push(id);
          refresh();
        }
      },
    };
  });
  const { state, rules } = cell;
  const overlapKey = `${props.start.getTime()}:${props.end.getTime()}:${props.allDay}:${host.config.allDayEvents}:${rules.overlapKey()}`;
  if (state.overlapKey !== overlapKey) {
    state.overlapKey = overlapKey;
    state.overlaps = host.eventsManager.getCellOverlappingEvents(
      props.start,
      props.end,
      props.allDay,
    );
  }
  useLayoutEffect(() => {
    state.active = true;
    const interaction = createCalendarCellInteraction(
      cell.currentHost,
      cell.currentProps,
      cell.touch,
      cell.adapter,
    );
    state.interaction = interaction;
    return () => {
      state.active = false;
      state.interaction?.dispose();
      state.interaction = null;
    };
  }, [cell, state]);
  useLayoutEffect(() => {
    const element = state.element;
    if (!element || !state.interaction) return;
    const listeners = state.interaction.buildListeners();
    state.listeners = listeners;
    for (const [name, handler] of Object.entries(listeners))
      element.addEventListener(name, handler as EventListener);
    return () => {
      for (const [name, handler] of Object.entries(listeners))
        element.removeEventListener(name, handler as EventListener);
    };
  });
  return cell;
}
