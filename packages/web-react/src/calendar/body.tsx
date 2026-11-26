import type { CalendarBodyCursor } from '@sdata/web-core/calendar/surfaces';
import type { CSSProperties } from 'react';

import { createCalendarBodyController } from '@sdata/web-core/calendar/surface-interaction';
import { createCalendarSurfaceRules } from '@sdata/web-core/calendar/surfaces';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { CalendarCellViewProps } from './cell.js';
import type { CalendarHeadingsHost } from './headings.js';
import type { CalendarRange } from './types.js';

import { useTransitionPresence } from '../_shared/use-transition-presence.js';
import { CalendarCellView } from './cell.js';

export type CalendarBodyHost = Omit<CalendarHeadingsHost, 'view'> & {
  view: Omit<CalendarHeadingsHost['view'], 'cellDates'> & { cellDates: readonly CalendarRange[] };
};
export interface CalendarBodyProps extends Omit<
  CalendarCellViewProps,
  'calendar' | 'start' | 'end' | 'index' | 'allDay'
> {
  calendar: CalendarBodyHost;
}

function CursorTime({
  prefix,
  visible,
  value,
}: {
  prefix: string;
  visible: boolean;
  value: { style: CSSProperties; time: string };
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const latest = useRef(value);
  if (visible) latest.current = value;
  const { present } = useTransitionPresence(
    visible,
    element,
    `${prefix}-shrink`,
    undefined,
    () => {},
    () => {},
  );
  return present ? (
    <div ref={setElement} className={`${prefix}__time-at-cursor`} style={latest.current.style}>
      <label>{latest.current.time}</label>
    </div>
  ) : null;
}

export function CalendarBody({ calendar, className, style, ...renderers }: CalendarBodyProps) {
  const root = useRef<HTMLDivElement>(null);
  const [, render] = useReducer((n: number) => n + 1, 0);
  const [cursor] = useState<CalendarBodyCursor>(
    () =>
      new Proxy({ x: null, y: null } as CalendarBodyCursor, {
        set(target, key, value) {
          if (Reflect.get(target, key) !== value) {
            Reflect.set(target, key, value);
            render();
          }
          return true;
        },
      }),
  );
  useLayoutEffect(() => {
    cursor.x = null;
    cursor.y = null;
  }, [cursor, calendar.view.id, calendar.view.start.getTime(), calendar.config.horizontal]);
  const rules = createCalendarSurfaceRules(
    calendar,
    { isDark: false, hasTimeColumn: false },
    cursor,
  );
  useLayoutEffect(() => {
    const element = root.current;
    const controller = createCalendarBodyController(calendar, cursor, {
      element,
    });
    controller.mount();
    return controller.dispose;
  }, [calendar, cursor]);
  return (
    <div
      ref={root}
      className={[`${calendar.prefixCls}__body`, className].filter(Boolean).join(' ')}
      style={{ ...rules.bodyStyles(), ...style }}
    >
      <CursorTime
        prefix={calendar.prefixCls}
        visible={calendar.config.timeAtCursor && (cursor.x !== null || cursor.y !== null)}
        value={rules.timeAtCursor()}
      />
      {calendar.view.cellDates.map((date, index) => (
        <CalendarCellView
          {...renderers}
          key={index}
          calendar={calendar}
          start={date.start}
          end={date.end}
          index={index}
          allDay={false}
        />
      ))}
    </div>
  );
}
