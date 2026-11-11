import { defaults } from '@sdata/web-core/calendar/constants';
import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useLayoutEffect, useRef, useState } from 'react';

import type { CalendarOptions } from '../../src/calendar/types.js';

import { resolveCalendarConfig } from '../../src/calendar/config.js';
import { useCalendarView } from '../../src/calendar/use-view.js';

const dateUtils = createDateUtils();
function View({
  options,
  record,
  unmount,
}: {
  options: CalendarOptions;
  record(value: string): void;
  unmount(): void;
}) {
  const current = useRef<ReturnType<typeof useCalendarView>>(null);
  const [ready, setReady] = useState(false);
  const flags = {
    get id() {
      return current.current?.state.id ?? options.view ?? 'week';
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
  };
  const resolved = resolveCalendarConfig(options, { dateUtils, view: flags });
  const config = Object.assign(resolved, { ready });
  const view = useCalendarView({
    config,
    texts: defaults.texts,
    dateUtils,
    emit: (name, payload) => {
      if (name === 'view-change')
        record(
          `${document.querySelector('[data-testid="view-date"]')?.textContent}|${dateUtils.formatDateLite((payload as { start: Date }).start)}`,
        );
    },
    getViewEvents: () => [],
  });
  current.current = view;
  useLayoutEffect(() => setReady(true), []);
  return (
    <>
      <button onClick={() => view.navigation.next()}>Next range</button>
      <button onClick={() => view.navigation.previous()}>Previous range</button>
      <button onClick={() => view.navigation.switchView('month')}>Month view</button>
      <button onClick={() => view.navigation.switchView('day')}>Day view</button>
      <button
        onClick={() => {
          view.navigation.next();
          unmount();
        }}
      >
        Navigate and unmount
      </button>
      <output data-testid="view-date">{dateUtils.formatDateLite(view.layout.start)}</output>
      <output data-testid="view-now">{view.state.now.toISOString()}</output>
      <output data-testid="view-kind">{view.state.id}</output>
      <output data-testid="view-selected">
        {view.state.selectedDate ? dateUtils.formatDateLite(view.state.selectedDate) : 'none'}
      </output>
      <output data-testid="view-cells">{view.layout.cellsCount}</output>
    </>
  );
}
export function CalendarViewFixture() {
  const [mounted, setMounted] = useState(true);
  const [options, setOptions] = useState<CalendarOptions>({ viewDate: '2026-11-08' });
  const [log, setLog] = useState<string[]>([]);
  return (
    <section>
      <button onClick={() => setMounted(!mounted)}>Mount view</button>
      <button
        onClick={() =>
          setOptions({
            ...options,
            view: 'month',
            viewDate: '2026-12-18',
            selectedDate: '2026-12-20',
          })
        }
      >
        External dates
      </button>
      <button onClick={() => setOptions({ ...options, selectedDate: '' })}>Clear selection</button>
      <button onClick={() => setOptions({ ...options, watchRealTime: !options.watchRealTime })}>
        Watch time
      </button>
      {mounted && (
        <View
          options={options}
          record={(value) => setLog((old) => [...old, value])}
          unmount={() => setMounted(false)}
        />
      )}
      <output data-testid="view-log">{log.join(';')}</output>
    </section>
  );
}
