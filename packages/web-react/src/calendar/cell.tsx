import type {
  CalendarCellProps as CoreCellProps,
  PositionedSpecialHour,
} from '@sdata/web-core/calendar/cell';
import type { CSSProperties, ReactNode } from 'react';

import type { CalendarEventViewProps } from './event.js';
import type { CalendarEvent, CalendarId, CalendarSchedule } from './types.js';
import type { CalendarCellAdapterHost } from './use-cell.js';

import { CalendarEventList } from './event-list.js';
import { useCalendarCell } from './use-cell.js';

type Schedule = CalendarSchedule & { id: CalendarId };
export type CalendarCellViewHost = CalendarCellAdapterHost<Schedule> &
  CalendarEventViewProps['calendar'] & {
    config: { eventsOnMonthView: boolean };
    view: {
      now: Date;
      nowLine: { show: boolean | undefined; style: CSSProperties; currentTime: string };
    };
  };
type CellInfo = ReturnType<ReturnType<typeof useCalendarCell>['info']>;
export interface CalendarCellRenderParams {
  cell: CellInfo;
  view: CalendarCellViewHost['view'];
  schedule?: Schedule;
  events?: CalendarEvent[];
}
export interface CalendarCellViewProps
  extends
    CoreCellProps,
    Pick<
      CalendarEventViewProps,
      'renderEvent' | 'renderViewEvent' | 'renderAllDayEvent' | 'renderEventContent'
    > {
  calendar: CalendarCellViewHost;
  className?: string;
  style?: CSSProperties;
  renderCell?: (cell: CellInfo) => ReactNode;
  renderCellDate?: (params: CalendarCellRenderParams) => ReactNode;
  renderCellContent?: (params: CalendarCellRenderParams) => ReactNode;
  renderCellEvents?: (params: CalendarCellRenderParams) => ReactNode;
  renderSpecialHoursLabel?: (params: {
    range: PositionedSpecialHour;
    schedule?: Schedule;
  }) => ReactNode;
  renderEventCount?: (events: CalendarEvent[]) => ReactNode;
  renderNowLine?: (params: { now: Date; timeFormatted: string }) => ReactNode;
}

export function CalendarCellView(props: CalendarCellViewProps) {
  const {
    calendar,
    renderCell,
    renderCellDate,
    renderCellContent,
    renderCellEvents,
    renderSpecialHoursLabel,
    renderEventCount,
    renderNowLine,
  } = props;
  const { prefixCls: prefix, config, view } = calendar;
  const cell = useCalendarCell(calendar, props);
  const { rules } = cell;
  const info = cell.info();
  const events = rules.cellEvents();
  const foreground = rules.cellForegroundEvents();
  const specialHours = rules.specialHours();
  const date = rules.formattedCellDate();
  const eventStyles = rules.eventStyles();
  const eventClasses = rules.eventClasses();
  const perSchedule = rules.cellEventsPerSchedule();
  const placeholder = rules.eventPlaceholder();
  const creating = rules.isCreatingEvent();
  const special = (ranges: PositionedSpecialHour[], schedule?: Schedule) =>
    ranges.map((range, index) => (
      <div
        key={index}
        style={range.style}
        className={[`${prefix}__special-hours`, range.class].filter(Boolean).join(' ')}
      >
        {renderSpecialHoursLabel ? renderSpecialHoursLabel({ range, schedule }) : range.label}
      </div>
    ));
  const content = (schedule?: Schedule) => {
    const params: CalendarCellRenderParams = {
      cell: info,
      view,
      ...(schedule ? { schedule, events: perSchedule?.[schedule.id] ?? [] } : {}),
    };
    const items = schedule ? (perSchedule?.[schedule.id] ?? []) : events;
    const showEvents =
      schedule || (!(view.isMonth && !config.eventsOnMonthView) && !view.isYear && !view.isYears);
    return (
      <>
        {(date || renderCellDate) && (
          <div className={`${prefix}__cell-date`}>
            {renderCellDate ? renderCellDate(params) : date}
          </div>
        )}
        {renderCellContent && (
          <div className={`${prefix}__cell-content`}>{renderCellContent(params)}</div>
        )}
        {renderCellEvents && (schedule || events.length) ? (
          <div className={`${prefix}__cell-events`}>{renderCellEvents(params)}</div>
        ) : (
          showEvents && (
            <CalendarEventList
              events={items}
              className={`${prefix}__cell-events`}
              eventProps={(event) => ({
                calendar,
                inAllDayBar: props.allDay,
                cellStart: props.start,
                cellEnd: props.end,
                onDeleted: cell.deleteEvent,
                style: eventStyles[event._.id],
                className: schedule ? undefined : eventClasses[event._.id],
                renderEvent: props.renderEvent,
                renderViewEvent: props.renderViewEvent,
                renderAllDayEvent: props.renderAllDayEvent,
                renderEventContent: props.renderEventContent,
              })}
            />
          )
        )}
        {creating && (!schedule || (cell.touch.schedule === schedule.id && !props.allDay)) && (
          <div className={`${prefix}__event-placeholder`} style={placeholder.style}>
            {placeholder.start} - {placeholder.end}
          </div>
        )}
      </>
    );
  };
  return (
    <div
      ref={cell.ref}
      data-start={props.start.getTime()}
      style={props.style}
      className={[
        `${prefix}__cell`,
        ...Object.entries(rules.classes())
          .filter(([, active]) => active)
          .map(([name]) => name),
        props.className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {renderCell?.(info)}
      {!!specialHours?.default.length && !config.schedules?.length && special(specialHours.default)}
      {!renderCell &&
        (config.schedules
          ? rules.schedulesWithCellSpecialHours().map(({ schedule, ranges }) => (
              <div
                key={schedule.id}
                data-schedule={schedule.id}
                style={schedule.style}
                className={[`${prefix}__schedule`, `${prefix}__schedule--cell`, schedule.class]
                  .filter(Boolean)
                  .join(' ')}
              >
                {special(ranges, schedule)}
                {content(schedule)}
              </div>
            ))
          : content())}
      {renderEventCount
        ? renderEventCount(foreground)
        : !!rules.showCellEventCount() && (
            <div className={`${prefix}__cell-events-count`}>{foreground.length}</div>
          )}
      {view.nowLine.show && rules.isToday() && !props.allDay && (
        <div
          className={`${prefix}__now-line`}
          style={view.nowLine.style}
          title={view.nowLine.currentTime}
        >
          {renderNowLine ? (
            renderNowLine({ now: view.now, timeFormatted: view.nowLine.currentTime })
          ) : (
            <span>{view.nowLine.currentTime}</span>
          )}
        </div>
      )}
    </div>
  );
}
