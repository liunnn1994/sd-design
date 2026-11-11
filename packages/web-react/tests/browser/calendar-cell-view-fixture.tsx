import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useRef, useState } from 'react';

import type { CalendarEventInput } from '../../src/calendar/types.js';

import { CalendarCellView } from '../../src/calendar/cell.js';
import { resolveCalendarConfig } from '../../src/calendar/config.js';
import { useCalendarEvents } from '../../src/calendar/use-events.js';
import { useCalendarTexts } from '../../src/calendar/use-texts.js';
import { useCalendarView } from '../../src/calendar/use-view.js';
const start = new Date(2026, 10, 8);
const end = new Date(2026, 10, 8, 23, 59, 59);
const dateUtils = createDateUtils();
const initial: CalendarEventInput[] = [
  { start: new Date(2026, 10, 8, 10), end: new Date(2026, 10, 8, 11), title: 'First', schedule: 0 },
  {
    start: new Date(2026, 10, 8, 10, 30),
    end: new Date(2026, 10, 8, 11, 30),
    title: 'Second',
    schedule: 1,
  },
];
export function CalendarCellViewFixture() {
  const [scheduled, setScheduled] = useState(false);
  const [mode, setMode] = useState('day');
  const [custom, setCustom] = useState(false);
  const [override, setOverride] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [touch] = useState({
    isDraggingCell: false,
    isResizingEvent: false,
    currentHoveredCell: null,
  });
  const current = useRef<ReturnType<typeof useCalendarView>>(null);
  const texts = useCalendarTexts({ locale: 'en' });
  const flags = current.current?.layout ?? {
    id: 'day',
    isDay: true,
    isDays: false,
    isWeek: false,
    isMonth: false,
    isYear: false,
  };
  const config = Object.assign(
    resolveCalendarConfig(
      {
        events: initial,
        view: mode,
        viewDate: start,
        timeFrom: 540,
        timeTo: 840,
        editableEvents: true,
        eventCount: true,
        schedules: scheduled
          ? [
              { id: 0, label: 'Zero' },
              { id: 1, label: 'One' },
            ]
          : [],
        specialHours: {
          sun: {
            default: [{ from: 540, to: 600, label: 'Default hours' }],
            schedules: { '0': [{ from: 600, to: 660, label: 'Zero hours' }] },
          },
        },
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
      now: new Date(2026, 10, 8, 11, 30),
      nowLine: { show: true, style: { top: '50%' }, currentTime: '11:30' },
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
      <button onClick={() => setScheduled(!scheduled)}>Schedules</button>
      <button onClick={() => setMode(mode === 'day' ? 'month' : 'day')}>Month view</button>
      <button onClick={() => setCustom(!custom)}>Custom cell content</button>
      <button onClick={() => setOverride(!override)}>Override cell</button>
      <button onClick={() => setMounted(!mounted)}>Mount cell</button>
      <button
        onClick={() => {
          void store.events[0]?.delete(2);
        }}
      >
        Visual deletion
      </button>
      <button
        onClick={() => {
          void store.events[0]?.delete(3);
        }}
      >
        Final deletion
      </button>
      <div className="sd-calendar" style={{ width: 600, height: 360 }}>
        {mounted && (
          <CalendarCellView
            calendar={calendar}
            start={start}
            end={end}
            index={0}
            allDay={false}
            style={
              {
                'position': 'relative',
                'height': 300,
                '--sd-calendar-schedules-count': scheduled ? 2 : 1,
              } as React.CSSProperties
            }
            renderCell={
              override ? (cell) => <span>Entire cell {cell.events.length}</span> : undefined
            }
            renderCellDate={
              custom
                ? ({ cell, schedule, events }) => (
                    <span>
                      {cell.start.getDate()}|{schedule?.id ?? 'none'}|
                      {events?.length ?? cell.events.length}
                    </span>
                  )
                : undefined
            }
            renderCellContent={custom ? ({ view }) => <span>View {view.id}</span> : undefined}
            renderCellEvents={
              custom
                ? ({ events, cell }) => (
                    <span>
                      Events {(events ?? cell.events).map((event) => event.title).join(',')}
                    </span>
                  )
                : undefined
            }
            renderSpecialHoursLabel={
              custom
                ? ({ range, schedule }) => (
                    <b>
                      {schedule?.id ?? 'default'}:{range.label}
                    </b>
                  )
                : undefined
            }
          />
        )}
      </div>
      <output data-testid="source-count">{store.events.length}</output>
    </>
  );
}
