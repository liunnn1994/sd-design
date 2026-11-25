import type {
  CalendarEventHost,
  CalendarEventProps as CoreEventProps,
} from '@sdata/web-core/calendar/event';
import type { CSSProperties, ReactNode } from 'react';

import {
  createCalendarEventRules,
  createCalendarEventInteraction,
} from '@sdata/web-core/calendar/event';
import { runCssTransition } from '@sdata/web-core/transition/css';
import { useLayoutEffect, useReducer, useRef, useState } from 'react';

import type { CalendarEvent, CalendarId, CalendarListener } from './types.js';

import { useTransitionPresence } from '../_shared/use-transition-presence.js';
import { PerformantEllipsis } from '../ellipsis/index.js';

export interface CalendarEventViewProps extends CoreEventProps {
  calendar: CalendarEventHost & {
    config: { twelveHour: boolean; eventListeners: { event: Record<string, CalendarListener> } };
    view: { id: string };
    texts: { deleteEvent: string };
    eventsManager: {
      handleEventResize(
        e: MouseEvent | TouchEvent,
        event: CalendarEvent,
        element: HTMLElement,
      ): void;
    };
    dnd: {
      eventDragStart(e: DragEvent, event: CalendarEvent): void;
      eventDragEnd(e: DragEvent, event: CalendarEvent): void;
    };
  };
  event: CalendarEvent;
  leaving?: boolean;
  onAfterLeave?: () => void;
  className?: string | undefined;
  style?: CSSProperties;
  onDeleted(id: CalendarId): void;
  renderEvent?: ((event: CalendarEvent) => ReactNode) | undefined;
  renderViewEvent?: Record<string, (event: CalendarEvent) => ReactNode> | undefined;
  renderAllDayEvent?: ((event: CalendarEvent) => ReactNode) | undefined;
  renderEventContent?: ((event: CalendarEvent) => ReactNode) | undefined;
}

function DeleteButton({
  event,
  prefix,
  label,
}: {
  event: CalendarEvent;
  prefix: string;
  label: string;
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const visible = !!event._.deleting;
  const { present } = useTransitionPresence(
    visible,
    element,
    `${prefix}-delete-btn`,
    undefined,
    () => {},
    () => {},
  );
  useLayoutEffect(() => {
    if (!element) return;
    // Stop at the native target before the event root's native listeners run.
    const click = (e: MouseEvent) => {
      e.stopPropagation();
      if (visible) void event.delete(3);
    };
    const keydown = (e: KeyboardEvent) => {
      if (visible && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        e.stopPropagation();
        void event.delete(3);
      }
    };
    element.addEventListener('click', click);
    element.addEventListener('keydown', keydown);
    return () => {
      element.removeEventListener('click', click);
      element.removeEventListener('keydown', keydown);
    };
  }, [element, event, visible]);
  if (!present) return null;
  return (
    <div
      ref={setElement}
      role="button"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible || undefined}
      className={`${prefix}__event-delete`}
    >
      {label}
    </div>
  );
}

export function CalendarEventView(props: CalendarEventViewProps) {
  const {
    calendar,
    event,
    inAllDayBar,
    className,
    style,
    renderEvent,
    renderViewEvent,
    renderAllDayEvent,
    renderEventContent,
  } = props;
  const { prefixCls: prefix, config, view } = calendar;
  const live = useRef(props);
  live.current = props;
  const root = useRef<HTMLDivElement>(null);
  const listeners = useRef<Record<string, CalendarListener>>({});
  const interaction = useRef<ReturnType<typeof createCalendarEventInteraction> | null>(null);
  const [, render] = useReducer((n: number) => n + 1, 0);
  const [touch] = useState(
    () =>
      new Proxy(
        { canTouchAndDrag: null as boolean | null },
        {
          set(target, key, value) {
            if (Reflect.get(target, key) !== value) {
              Reflect.set(target, key, value);
              render();
            }
            return true;
          },
        },
      ),
  );
  const rules = createCalendarEventRules(calendar, props, event, {
    get canTouchAndDrag() {
      return touch.canTouchAndDrag;
    },
    get startsInCell() {
      return rules.eventStartsInThisCell();
    },
    get endsInCell() {
      return rules.eventEndsInThisCell();
    },
  });
  useLayoutEffect(() => {
    const element = root.current!;
    interaction.current = createCalendarEventInteraction(
      {
        prefixCls: prefix,
        event,
        element: () => element,
        listeners: () => listeners.current,
        resize: (...args) => live.current.calendar.eventsManager.handleEventResize(...args),
      },
      touch,
    );
    const deleted = (e: Event) => live.current.onDeleted((e as CustomEvent<CalendarId>).detail);
    element.addEventListener('event-deleted', deleted);
    event._.register!(element);
    return () => {
      interaction.current?.dispose();
      interaction.current = null;
      element.removeEventListener('event-deleted', deleted);
      event._.unregister!();
    };
  }, [event, prefix, touch]);
  useLayoutEffect(() => {
    const element = root.current!;
    const handlers = interaction.current!.buildListeners(config.eventListeners.event);
    listeners.current = handlers;
    for (const [name, handler] of Object.entries(handlers))
      element.addEventListener(name, handler as EventListener);
    return () => {
      for (const [name, handler] of Object.entries(handlers))
        element.removeEventListener(name, handler as EventListener);
    };
  });
  useLayoutEffect(() => {
    if (!props.leaving || !root.current) return;
    return runCssTransition(root.current, {
      name: `${prefix}-event-delete`,
      enter: false,
      finish: () => live.current.onAfterLeave?.(),
    });
  }, [props.leaving, prefix]);
  const draggable = !props.leaving && rules.isDraggable();
  const renderer =
    (inAllDayBar ? renderAllDayEvent : undefined) ?? renderViewEvent?.[view.id] ?? renderEvent;
  const classes = Object.entries(rules.classes())
    .filter(([, active]) => active)
    .map(([name]) => name);
  return (
    <div
      ref={root}
      inert={props.leaving || undefined}
      aria-hidden={props.leaving || undefined}
      className={[`${prefix}__event`, ...classes, className].filter(Boolean).join(' ')}
      style={{ ...rules.styles(), ...style }}
      draggable={draggable || undefined}
      onDragStart={(e) => {
        if (draggable) calendar.dnd.eventDragStart(e.nativeEvent, event);
      }}
      onDragEnd={(e) => {
        if (draggable) calendar.dnd.eventDragEnd(e.nativeEvent, event);
      }}
    >
      <div className={`${prefix}__event-details`}>
        {renderer ? (
          renderer(event)
        ) : (
          <>
            <PerformantEllipsis className={`${prefix}__event-title`}>
              {event.title}
            </PerformantEllipsis>
            {config.time &&
              !inAllDayBar &&
              !(event._.multiday && !rules.eventStartsInThisCell()) && (
                <div className={`${prefix}__event-time`}>
                  {view.isMonth && <span className={`${prefix}__event-comma`}>,&nbsp;</span>}
                  <PerformantEllipsis className={`${prefix}__event-time-text`}>
                    <span className={`${prefix}__event-start`}>
                      {event._[config.twelveHour ? 'startTimeFormatted12' : 'startTimeFormatted24']}
                    </span>
                    {!view.isMonth && (
                      <span className={`${prefix}__event-end`}>
                        &nbsp;-&nbsp;
                        {event._[config.twelveHour ? 'endTimeFormatted12' : 'endTimeFormatted24']}
                        {event._.multiday && rules.eventStartsInThisCell() && (
                          <span>+{rules.plusDaysIndicator()}d</span>
                        )}
                      </span>
                    )}
                  </PerformantEllipsis>
                </div>
              )}
            {!inAllDayBar && (
              <div className={`${prefix}__event-content`}>
                {renderEventContent ? renderEventContent(event) : event.content}
              </div>
            )}
          </>
        )}
      </div>
      {rules.isResizable() && (
        <div
          className={`${prefix}__event-resizer`}
          onDragStartCapture={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      )}
      <DeleteButton event={event} prefix={prefix} label={calendar.texts.deleteEvent} />
    </div>
  );
}
