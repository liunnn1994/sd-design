import { createCalendarClock } from '@sdata/web-core/calendar/clock';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import { createCalendarViewController } from './view-controller.js';

type Host = Omit<Parameters<typeof createCalendarViewController>[0], 'onChange' | 'nextRender'>;
const stamp = (date: string | Date | undefined) => (date instanceof Date ? date.getTime() : date);

export function useCalendarView(host: Host) {
  const live = useRef(host);
  live.current = host;
  const mounted = useRef(false);
  const commits = useRef<(() => void)[]>([]);
  const [, render] = useReducer((version: number) => version + 1, 0);
  const [controller] = useState(() =>
    createCalendarViewController({
      get config() {
        return live.current.config;
      },
      get texts() {
        return live.current.texts;
      },
      dateUtils: host.dateUtils,
      emit: (...args) => {
        if (mounted.current) live.current.emit(...args);
      },
      getViewEvents: (cells) => live.current.getViewEvents(cells),
      onChange: render,
      nextRender: () =>
        new Promise<void>((resolve) => {
          commits.current.push(resolve);
          render();
        }),
    }),
  );
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      commits.current.splice(0).forEach((resolve) => resolve());
    };
  }, []);
  useLayoutEffect(() => {
    commits.current.splice(0).forEach((resolve) => resolve());
  });
  const config = host.config;
  const inputs = {
    view: config.view,
    date: stamp(config.viewDate),
    selected: stamp(config.selectedDate),
    views: JSON.stringify(config.availableViews),
    picker: config.datePicker,
    sunday: config.startWeekOnSunday,
    weekends: config.hideWeekends,
    weekdays: JSON.stringify(config.hideWeekdays),
  };
  const previous = useRef(inputs);
  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = inputs;
    const navigation = controller.navigation;
    if (old.view !== inputs.view) navigation.switchView(config.view, false);
    if (old.views !== inputs.views) void navigation.updateView();
    if (old.picker !== inputs.picker) navigation.switchView('month');
    if (old.date !== inputs.date) navigation.updateViewDate(config.viewDate, false);
    if (old.selected !== inputs.selected) {
      if (config.selectedDate === undefined) {
        controller.state.selectedDate = null;
        render();
      } else navigation.updateSelectedDate(config.selectedDate, false);
    }
    if (old.sunday !== inputs.sunday) navigation.switchWeekStart(config.startWeekOnSunday);
    if (old.weekends !== inputs.weekends) navigation.toggleWeekends(Boolean(config.hideWeekends));
    if (old.weekdays !== inputs.weekdays) navigation.toggleWeekdays();
  });
  const [clock] = useState(() =>
    createCalendarClock({
      get now() {
        return controller.state.now;
      },
      set now(value) {
        controller.state.now = value;
        controller.invalidate();
      },
    }),
  );
  useLayoutEffect(() => {
    if (config.time && config.watchRealTime) clock.start();
    return clock.stop;
  }, [clock, config.time, config.watchRealTime]);
  return controller;
}
