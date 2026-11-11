import type { CSSProperties } from 'react';

import { calendarPropDefaults } from '@sdata/web-core/calendar/prop-defaults';
import { createCalendarRootController } from '@sdata/web-core/calendar/surface-interaction';
import { createCalendarSurfaceRules } from '@sdata/web-core/calendar/surfaces';
import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { ScrollbarExposed } from '../scrollbar/index.js';
import type { CalendarProps } from './root-types.js';
import type { CalendarEmit } from './types.js';

import { useThemeMode } from '../_shared/use-theme-mode.js';
import { useI18n } from '../locale/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { CalendarBody } from './body.js';
import { CalendarHeader } from './header.js';
import { CalendarHeadings } from './headings.js';
import { CalendarTimeColumn } from './time-column.js';
import { CalendarTransition } from './transition.js';
import { useCalendar } from './use-calendar.js';

const optionNames = new Set([
  ...Object.keys(calendarPropDefaults),
  'businessHours',
  'disableDays',
  'events',
  'hideWeekdays',
  'specialHours',
  'schedules',
  'views',
]);
const callbackNames = {
  'ready': 'onReady',
  'view-change': 'onViewChange',
  'update:view': 'onUpdateView',
  'update:viewDate': 'onUpdateViewDate',
  'update:selectedDate': 'onUpdateSelectedDate',
  'update:events': 'onUpdateEvents',
  'event-created': 'onEventCreated',
  'event-delete': 'onEventDelete',
  'event-dropped': 'onEventDropped',
  'event-drag-start': 'onEventDragStart',
  'event-drag-end': 'onEventDragEnd',
} as const;
const customNames = new Set([
  'ref',
  'previousButton',
  'nextButton',
  'allDayLabel',
  ...Object.values(callbackNames),
]);
const classes = (values: Record<string, unknown>) =>
  Object.keys(values)
    .filter((name) => values[name])
    .join(' ');

export function Calendar(props: CalendarProps) {
  const root = useRef<HTMLDivElement>(null);
  const scrollbar = useRef<ScrollbarExposed>(null);
  const [ready, setReady] = useState(false);
  const announced = useRef(false);
  const live = useRef(props);
  live.current = props;
  const emit: CalendarEmit = (event, ...args) => {
    const callback = live.current[callbackNames[event]];
    (callback as ((...args: unknown[]) => unknown) | undefined)?.(...args);
  };
  const options = Object.fromEntries(Object.entries(props).filter(([key]) => optionNames.has(key)));
  const listeners = Object.fromEntries(
    Object.entries(props).filter(([key]) => !customNames.has(key)),
  );
  const calendar = useCalendar(options, {
    ready,
    emit,
    listeners,
    scrollTop: (value) => scrollbar.current?.scrollTop(value),
  });
  const { config, view, prefixCls: prefix } = calendar;
  const identity = `${view.id}:${view.start.getTime()}`;
  const scrollbarRef = useMemo(() => {
    let instance: ScrollbarExposed | null = null;
    return (next: ScrollbarExposed | null) => {
      if (next) scrollbar.current = next;
      else if (scrollbar.current === instance) scrollbar.current = null;
      instance = next;
    };
  }, [identity]);
  const theme = useThemeMode(root);
  const { t } = useI18n();
  const rules = createCalendarSurfaceRules(calendar, {
    isDark: theme === 'dark',
    get hasTimeColumn(): boolean {
      return rules.hasTimeColumn();
    },
  });
  const controller = useMemo(
    () =>
      createCalendarRootController(prefix, {
        get element() {
          return root.current;
        },
      }),
    [prefix],
  );
  useImperativeHandle(props.ref, () => ({ view }), [view]);
  useLayoutEffect(() => {
    controller.mount();
    setReady(true);
    return controller.dispose;
  }, [controller]);
  useLayoutEffect(() => {
    controller.sync();
    if (ready && !announced.current) {
      announced.current = true;
      emit('ready', { config, view });
    }
  });
  const attrs = Object.fromEntries(
    Object.entries(props).filter(
      ([key]) =>
        !optionNames.has(key) &&
        !customNames.has(key) &&
        !key.startsWith('render') &&
        !/^on(Cell|Event)/.test(key),
    ),
  );
  const {
    renderCell,
    renderCellDate,
    renderCellContent,
    renderCellEvents,
    renderEvent,
    renderViewEvent,
    renderAllDayEvent,
    renderEventContent,
    renderSpecialHoursLabel,
    renderEventCount,
    renderNowLine,
  } = props;
  const titleRenderer = props.renderViewTitle?.[view.id] ?? props.renderTitle;
  return (
    <div
      {...attrs}
      ref={root}
      data-locale={props.locale ?? ''}
      className={[prefix, classes(rules.wrapperClasses()), props.className]
        .filter(Boolean)
        .join(' ')}
      style={{ ...rules.wrapperStyles(), ...props.style } as CSSProperties}
    >
      {props.renderDiy ? (
        props.renderDiy(calendar)
      ) : (
        <>
          <CalendarHeader
            prefixCls={prefix}
            config={config}
            texts={calendar.texts}
            controller={calendar.controller}
            previousLabel={t('a11y.prevPage')}
            nextLabel={t('a11y.nextPage')}
            previousButton={props.previousButton}
            nextButton={props.nextButton}
            renderTodayButton={props.renderTodayButton}
            renderHeader={
              props.renderHeader
                ? () =>
                    props.renderHeader!({ calendar, view, availableViews: config.availableViews })
                : undefined
            }
            renderTitle={titleRenderer ? () => titleRenderer(view) : undefined}
          />
          <div className={`${prefix}__scrollable-wrap`}>
            <CalendarTransition
              identity={identity}
              name={`${prefix}-slide-fade--${view.transitionDirection}`}
              style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}
            >
              <Scrollbar
                ref={scrollbarRef}
                outerClass={`${prefix}__scrollable ${classes(rules.scrollableElClasses())}`}
                className={`${prefix}__scrollable-content`}
              >
                {rules.hasTimeColumn() && (
                  <CalendarTimeColumn
                    calendar={calendar}
                    now={view.now}
                    allDayLabel={props.allDayLabel}
                    renderTimeCell={props.renderTimeCell}
                    renderCurrentTimeLabel={props.renderCurrentTimeLabel}
                  />
                )}
                {config.weekNumbers && view.isMonth && (
                  <div className={`${prefix}__week-numbers`}>
                    {rules.weekNumbers().map((week, index) => (
                      <div className={`${prefix}__week-number`} key={index}>
                        {props.renderWeekNumber ? (
                          props.renderWeekNumber(week)
                        ) : (
                          <small>{week}</small>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className={`${prefix}__body-wrap`}>
                  <CalendarHeadings
                    calendar={calendar}
                    getRoot={() => root.current}
                    renderWeekdayHeading={props.renderWeekdayHeading}
                    renderScheduleHeading={props.renderScheduleHeading}
                    renderEvent={renderEvent}
                    renderAllDayEvent={renderAllDayEvent}
                  />
                  <CalendarBody
                    calendar={calendar}
                    renderCell={renderCell}
                    renderCellDate={!renderCell ? renderCellDate : undefined}
                    renderCellContent={!renderCell ? renderCellContent : undefined}
                    renderCellEvents={!renderCell ? renderCellEvents : undefined}
                    renderEvent={!renderCell && !renderCellEvents ? renderEvent : undefined}
                    renderViewEvent={!renderCell && !renderCellEvents ? renderViewEvent : undefined}
                    renderAllDayEvent={
                      !renderCell && !renderCellEvents ? renderAllDayEvent : undefined
                    }
                    renderEventContent={
                      !renderCell && !renderCellEvents ? renderEventContent : undefined
                    }
                    renderSpecialHoursLabel={renderSpecialHoursLabel}
                    renderEventCount={!renderCell ? renderEventCount : undefined}
                    renderNowLine={renderNowLine}
                  />
                </div>
              </Scrollbar>
            </CalendarTransition>
          </div>
        </>
      )}
    </div>
  );
}
