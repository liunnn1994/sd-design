import type { CSSProperties } from 'react';

import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useRef, useState } from 'react';

import type { CalendarEventInput } from '../../src/calendar/types.js';

import { CalendarBody } from '../../src/calendar/body.js';
import { resolveCalendarConfig } from '../../src/calendar/config.js';
import { useCalendarEvents } from '../../src/calendar/use-events.js';
import { useCalendarTexts } from '../../src/calendar/use-texts.js';
import { useCalendarView } from '../../src/calendar/use-view.js';
const dateUtils = createDateUtils();
const initial: CalendarEventInput[] = [
  {
    start: new Date(2026, 10, 3),
    end: new Date(2026, 10, 4),
    title: 'Holiday',
    allDay: true,
    schedule: 0,
  },
  {
    start: new Date(2026, 10, 3, 10),
    end: new Date(2026, 10, 3, 11),
    title: 'Meeting',
    schedule: 0,
  },
];
export function CalendarBodyFixture() {
  const [mode, setMode] = useState('week');
  const [cursorEnabled, setCursorEnabled] = useState(true);
  const [scheduled, setScheduled] = useState(false);
  const [custom, setCustom] = useState(false);
  const [compact, setCompact] = useState(false);
  const [weekends, setWeekends] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [allDay, setAllDay] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const current = useRef<ReturnType<typeof useCalendarView>>(null);
  const [touch] = useState({
    isDraggingCell: false,
    isDraggingEvent: false,
    isResizingEvent: false,
    currentHoveredCell: null,
  });
  const texts = useCalendarTexts({ locale: 'en' });
  const flags = current.current?.layout ?? {
    id: 'week',
    isDay: false,
    isDays: false,
    isWeek: true,
    isMonth: false,
    isYear: false,
  };
  const config = Object.assign(
    resolveCalendarConfig(
      {
        events: initial,
        timeAtCursor: cursorEnabled,
        timeFrom: 540,
        timeTo: 840,
        timeCellHeight: 50,
        timeStep: 60,
        editableEvents: { resize: true, resizeX: true },
        view: mode,
        viewDate: '2026-11-03',
        allDayEvents: allDay,
        hideWeekends: weekends,
        xs: compact,
        horizontal,
        schedules: scheduled
          ? [
              { id: 0, label: 'Zero' },
              { id: 1, label: 'One' },
            ]
          : [],
      },
      { dateUtils, view: flags },
    ),
    { ready: true },
  );
  const store = useCalendarEvents({
    config,
    dateUtils,
    prefixCls: 'sd-calendar',
    touch,
    emit() {},
  });
  const controller = useCalendarView({
    config,
    texts,
    dateUtils,
    emit() {},
    getViewEvents: () => store.events,
  });
  current.current = controller;
  const calendar = {
    prefixCls: 'sd-calendar',
    config,
    texts,
    dateUtils,
    touch,
    eventsManager: store.manager,
    view: {
      ...controller.layout,
      selectedDate: controller.state.selectedDate,
      broader: controller.navigation.switchToBroaderView,
      narrower: controller.navigation.switchToNarrowerView,
      updateSelectedDate: controller.navigation.updateSelectedDate,
      updateViewDate: controller.navigation.updateViewDate,
      switch: (id: string, date?: Date | string) =>
        controller.navigation.switchView(id, true, date),
      createEvent: store.manager.createEvent,
      now: controller.state.now,
      nowLine: { show: false, style: {}, currentTime: '' },
    },
    dnd: {
      cellDragEnter() {},
      cellDragOver() {},
      cellDragLeave() {},
      async cellDragDrop() {},
      eventDragStart() {},
      eventDragEnd() {},
    },
  };
  return (
    <>
      <button onClick={() => setMode('day')}>Day view</button>
      <button onClick={() => setCursorEnabled(!cursorEnabled)}>Cursor label</button>
      <button onClick={() => setMode('month')}>Month view</button>
      <button onClick={() => setMode('year')}>Year view</button>
      <button onClick={() => setScheduled(!scheduled)}>Schedules</button>
      <button onClick={() => setCustom(!custom)}>Custom cells</button>
      <button onClick={() => setCompact(!compact)}>Compact cells</button>
      <button onClick={() => setWeekends(!weekends)}>Hide weekends</button>
      <button onClick={() => setHorizontal(!horizontal)}>Orientation</button>
      <button onClick={() => setMounted(!mounted)}>Mount body</button>
      <button onClick={() => setAllDay(!allDay)}>All day bar</button>
      <div
        ref={root}
        data-testid="calendar-root"
        className={`sd-calendar${horizontal ? ' sd-calendar--horizontal' : ''}`}
        style={
          {
            'width': 800,
            'height': 360,
            '--sd-calendar-all-day-bar-size': '60px',
            '--sd-calendar-schedules-count': scheduled ? 2 : 1,
          } as CSSProperties
        }
      >
        <div
          className={`sd-calendar__scrollable--${controller.state.id}-view${horizontal ? ' sd-calendar__scrollable--horizontal' : ''}`}
        >
          {mounted && (
            <CalendarBody
              calendar={calendar}
              style={{ height: 300 }}
              renderCell={
                custom
                  ? (cell) => (
                      <span>
                        Cell {cell.start.getDate()} events {cell.events.length}
                      </span>
                    )
                  : undefined
              }
            />
          )}
        </div>
      </div>
      <output data-testid="selected-day">
        {controller.state.selectedDate
          ? dateUtils.formatDateLite(controller.state.selectedDate)
          : 'none'}
      </output>
      <output data-testid="body-view">{controller.state.id}</output>
      <output data-testid="timed-end">
        {dateUtils.formatDateLite(store.events.find((event) => !event.allDay)!.end)}|
        {dateUtils.formatTime(store.events.find((event) => !event.allDay)!.end, 'HH:mm')}
      </output>
      <output data-testid="resize-cell">
        {store.manager.resizeState.cellEl?.dataset.start ?? 'none'}
      </output>
    </>
  );
}
