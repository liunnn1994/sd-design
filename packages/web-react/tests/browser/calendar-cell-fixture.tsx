import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useRef, useState } from 'react';

import type { CalendarCellAdapterHost } from '../../src/calendar/use-cell.js';

import { resolveCalendarConfig } from '../../src/calendar/config.js';
import { useCalendarCell } from '../../src/calendar/use-cell.js';
import { useCalendarTexts } from '../../src/calendar/use-texts.js';
import { useCalendarView } from '../../src/calendar/use-view.js';

const dateUtils = createDateUtils();
const start = new Date(2026, 10, 8);
const end = new Date(2026, 10, 8, 23, 59, 59);
function Cell({ host }: { host: CalendarCellAdapterHost }) {
  const cell = useCalendarCell(host, { start, end, index: 0, allDay: false });
  const placeholder = cell.rules.eventPlaceholder();
  return (
    <div
      ref={cell.ref}
      data-testid="cell"
      className={Object.entries(cell.rules.classes())
        .filter(([, active]) => active)
        .map(([name]) => name)
        .join(' ')}
      style={{ position: 'relative', width: 300, height: 300, border: '1px solid' }}
    >
      {cell.rules.isCreatingEvent() && (
        <div data-testid="placeholder" style={placeholder.style}>
          {placeholder.start} - {placeholder.end}
        </div>
      )}
      {cell.state.awaiting && <span>Awaiting creation</span>}
    </div>
  );
}
export function CalendarCellFixture() {
  const [disabled, setDisabled] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [defer, setDefer] = useState(false);
  const [created, setCreated] = useState<string[]>([]);
  const [clicks, setClicks] = useState(0);
  const [holds, setHolds] = useState(0);
  const resolve = useRef<((value: boolean) => void) | null>(null);
  const [touch] = useState({ isDraggingCell: false });
  const texts = useCalendarTexts({ locale: 'en' });
  const config = Object.assign(
    resolveCalendarConfig(
      {
        view: 'week',
        viewDate: start,
        timeFrom: 600,
        timeTo: 900,
        snapToInterval: 30,
        editableEvents: { create: true },
        minDate: disabled ? '2026-11-09' : '',
      },
      {
        dateUtils,
        view: {
          id: 'week',
          isDay: false,
          isDays: false,
          isWeek: true,
          isMonth: false,
          isYear: false,
        },
      },
      {
        onCellClick: () => setClicks((n) => n + 1),
        onCellHold: () => setHolds((n) => n + 1),
        ...(defer
          ? {
              onEventCreate: (event: { resolve(value: boolean): void }) => {
                resolve.current = event.resolve;
              },
            }
          : {}),
      },
    ),
    { ready: true },
  );
  const controller = useCalendarView({
    config,
    texts,
    dateUtils,
    emit() {},
    getViewEvents: () => [],
  });
  const host: CalendarCellAdapterHost = {
    prefixCls: 'sd-calendar',
    config,
    dateUtils,
    touch,
    view: {
      ...controller.layout,
      broader: controller.navigation.switchToBroaderView,
      narrower: controller.navigation.switchToNarrowerView,
      selectedDate: controller.state.selectedDate,
      updateSelectedDate: controller.navigation.updateSelectedDate,
      updateViewDate: controller.navigation.updateViewDate,
      switch: (id, date) => controller.navigation.switchView(id, true, date),
      createEvent(event) {
        setCreated((old) => [
          ...old,
          `${dateUtils.formatTime(event.start as Date, 'HH:mm')}-${dateUtils.formatTime(event.end as Date, 'HH:mm')}`,
        ]);
      },
    },
    eventsManager: {
      getEventsInRange: () => [],
      getCellOverlappingEvents: () => ({ cellOverlaps: {}, longestStreak: 0 }),
      deleteEvent: async () => {},
    },
    dnd: { cellDragEnter() {}, cellDragOver() {}, cellDragLeave() {}, async cellDragDrop() {} },
  };
  return (
    <>
      <button onClick={() => setDisabled(!disabled)}>Disable day</button>
      <button onClick={() => setMounted(!mounted)}>Mount cell</button>
      <button onClick={() => setDefer(!defer)}>Defer creation</button>
      <button onClick={() => resolve.current?.(true)}>Accept creation</button>
      {mounted && <Cell host={host} />}
      <output data-testid="clicks">{clicks}</output>
      <output data-testid="holds">{holds}</output>
      <output data-testid="selected">
        {controller.state.selectedDate
          ? dateUtils.formatDateLite(controller.state.selectedDate)
          : 'none'}
      </output>
      <output data-testid="created">{created.join('|')}</output>
    </>
  );
}
