import type { createDateUtils } from '@sdata/web-core/calendar/utils/date';

import { createCalendarNavigation } from '@sdata/web-core/calendar/navigation';
import {
  getCalendarInitialView,
  getCalendarInitialViewDate,
} from '@sdata/web-core/calendar/view-math';

import type { resolveCalendarConfig } from './config.js';
import type { CalendarEmit, CalendarTexts, CalendarEvent, CalendarRange } from './types.js';

import { resolveCalendarLayout } from './view-layout.js';

type Config = ReturnType<typeof resolveCalendarConfig> & { ready: boolean };
export function createCalendarViewController(host: {
  readonly config: Config;
  readonly texts: CalendarTexts;
  dateUtils: ReturnType<typeof createDateUtils>;
  emit: CalendarEmit;
  nextRender(): Promise<unknown>;
  onChange(): void;
  getViewEvents(cells: CalendarRange[]): CalendarEvent[];
}) {
  const state = {
    id: getCalendarInitialView(host.config, host.config.availableViews),
    viewDate: getCalendarInitialViewDate(host.config.viewDate, () => new Date()),
    selectedDate: host.config.selectedDate ?? null,
    now: new Date(),
    startTheoretical: new Date(),
    transitionDirection: 'right',
  };
  let initialized = false;
  let cached: ReturnType<typeof resolveCalendarLayout> | undefined;
  let previousConfig: Config | undefined;
  let previousTexts: CalendarTexts | undefined;
  function changed() {
    cached = undefined;
    if (initialized) host.onChange();
  }
  function layout() {
    if (!cached || previousConfig !== host.config || previousTexts !== host.texts) {
      previousConfig = host.config;
      previousTexts = host.texts;
      cached = resolveCalendarLayout({
        viewId: state.id,
        startTheoretical: state.startTheoretical,
        now: state.now,
        config: host.config,
        texts: host.texts,
        dateUtils: host.dateUtils,
      });
    }
    return cached;
  }
  const navigation = createCalendarNavigation({
    config: {
      get availableViews() {
        return host.config.availableViews;
      },
      get ready() {
        return host.config.ready;
      },
      get startWeekOnSunday() {
        return host.config.startWeekOnSunday;
      },
      get hideWeekdays() {
        return host.config.hideWeekdays;
      },
    },
    dateUtils: host.dateUtils,
    emit: host.emit,
    nextRender: host.nextRender,
    get startTheoretical() {
      return state.startTheoretical;
    },
    set startTheoretical(value) {
      state.startTheoretical = value;
      changed();
    },
    get viewDate() {
      return state.viewDate;
    },
    set viewDate(value) {
      state.viewDate = value;
      host.onChange();
    },
    get now() {
      return state.now;
    },
    set now(value) {
      state.now = value;
      changed();
    },
    get viewId() {
      return state.id;
    },
    set viewId(value) {
      state.id = value;
      changed();
    },
    get selectedDate() {
      return state.selectedDate;
    },
    set selectedDate(value) {
      state.selectedDate = value;
      host.onChange();
    },
    get transitionDirection() {
      return state.transitionDirection;
    },
    set transitionDirection(value) {
      state.transitionDirection = value;
      host.onChange();
    },
    get cellsCount() {
      return layout().cellsCount;
    },
    get broaderView() {
      return layout().broaderView;
    },
    get narrowerView() {
      return layout().narrowerView;
    },
    get firstCellDate() {
      return layout().firstCellDate;
    },
    get lastCellDate() {
      return layout().lastCellDate;
    },
    get extendedStart() {
      return layout().extendedStart;
    },
    get start() {
      return layout().start;
    },
    get end() {
      return layout().end;
    },
    snapshot() {
      const current = layout();
      return {
        id: state.id,
        title: current.title,
        start: current.start,
        end: current.end,
        extendedStart: current.extendedStart,
        extendedEnd: current.extendedEnd,
        cellDates: current.cellDates,
        containsToday: current.containsToday,
        events: host.getViewEvents(current.cellDates),
      };
    },
  });
  void navigation.updateView();
  initialized = true;
  return {
    state,
    navigation,
    get layout() {
      return layout();
    },
    invalidate: changed,
  };
}
