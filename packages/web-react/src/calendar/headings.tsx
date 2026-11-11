import type { CalendarSurfaceHost } from '@sdata/web-core/calendar/surfaces';
import type { ReactNode } from 'react';

import { createCalendarAllDayResizer } from '@sdata/web-core/calendar/all-day-resizer';
import { createCalendarSurfaceRules } from '@sdata/web-core/calendar/surfaces';
import { useLayoutEffect, useMemo, useRef } from 'react';

import type { CalendarCellViewHost } from './cell.js';
import type { CalendarEventViewProps } from './event.js';
import type { CalendarId, CalendarSchedule } from './types.js';

import { PerformantEllipsis } from '../ellipsis/index.js';
import { CalendarCellView } from './cell.js';

export type CalendarHeadingsHost = CalendarCellViewHost & CalendarSurfaceHost;
export interface CalendarHeadingsProps extends Pick<
  CalendarEventViewProps,
  'renderEvent' | 'renderAllDayEvent'
> {
  calendar: CalendarHeadingsHost;
  getRoot(): HTMLElement | null;
  renderWeekdayHeading?: (params: {
    label: string;
    id: string;
    date: Date;
    view: CalendarHeadingsHost['view'];
  }) => ReactNode;
  renderScheduleHeading?: (params: {
    schedule: CalendarSchedule & { id: CalendarId };
    view: CalendarHeadingsHost['view'];
    cell: ReturnType<ReturnType<typeof createCalendarSurfaceRules>['headingCell']>;
  }) => ReactNode;
}

export function CalendarHeadings({
  calendar,
  getRoot,
  renderWeekdayHeading,
  renderScheduleHeading,
  renderEvent,
  renderAllDayEvent,
}: CalendarHeadingsProps) {
  const { prefixCls: prefix, config, view } = calendar;
  const live = useRef({ config, getRoot });
  live.current = { config, getRoot };
  const rules = createCalendarSurfaceRules(calendar, { isDark: false, hasTimeColumn: false });
  const visible = rules.showHeadings();
  const resizer = useMemo(
    () =>
      createCalendarAllDayResizer(
        {
          get horizontal() {
            return live.current.config.horizontal;
          },
        },
        prefix,
        {
          get element() {
            return live.current.getRoot();
          },
        },
      ),
    [prefix],
  );
  useLayoutEffect(
    () => () => resizer.cleanup(),
    [resizer, config.horizontal, config.allDayEvents, visible],
  );
  if (!visible) return null;
  const days = rules.weekDays();
  const labelSize = rules.dayLabelSize();
  const selectable = view.isDays || view.isWeek;
  return (
    <div className={`${prefix}__headings`}>
      {!view.isDay && (
        <div className={`${prefix}__weekdays-headings`}>
          {days.map((day, index) => (
            <div
              key={index}
              className={`${prefix}__weekday${day.isToday ? ` ${prefix}__weekday--today` : ''}`}
              role={selectable ? 'button' : undefined}
              tabIndex={selectable ? 0 : undefined}
              onClick={() => rules.domEvents.click(day.date)}
              onKeyDown={(event) => {
                if (selectable && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  rules.domEvents.click(day.date);
                }
              }}
            >
              {renderWeekdayHeading ? (
                renderWeekdayHeading({ label: day[labelSize], id: day.id, date: day.date, view })
              ) : (
                <>
                  <span className={`${prefix}__weekday-day`}>{day[labelSize]}</span>
                  {!view.isMonth && (
                    <strong className={`${prefix}__weekday-date`}>{day.dateNumber}</strong>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {config.schedules && (
        <div className={`${prefix}__schedules-headings`}>
          {days.flatMap((day, index) =>
            config.schedules!.map((schedule) => (
              <div
                key={`${index}:${schedule.id}`}
                className={[`${prefix}__schedule`, `${prefix}__schedule--heading`, schedule.class]
                  .filter(Boolean)
                  .join(' ')}
              >
                {renderScheduleHeading ? (
                  renderScheduleHeading({ schedule, view, cell: rules.headingCell(day) })
                ) : (
                  <PerformantEllipsis>{schedule.label}</PerformantEllipsis>
                )}
              </div>
            )),
          )}
        </div>
      )}
      {config.allDayEvents && (
        <div className={`${prefix}__all-day`}>
          {days.map((day, index) => (
            <CalendarCellView
              key={index}
              calendar={calendar}
              start={day.date}
              end={rules.headingEnd(day.date)}
              index={index}
              allDay
              className={`${prefix}__all-day-cell${day.isToday ? ` ${prefix}__weekday--today` : ''}`}
              renderAllDayEvent={renderAllDayEvent}
              renderEvent={renderEvent}
            />
          ))}
          <div
            className={`${prefix}__all-day-resizer`}
            onMouseDown={(event) => resizer.handleMouseDown(event.nativeEvent)}
            onTouchStart={(event) => resizer.handleTouchStart(event.nativeEvent)}
          />
        </div>
      )}
    </div>
  );
}
