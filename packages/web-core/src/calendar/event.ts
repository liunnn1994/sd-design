import type { CalendarEvent, CalendarListener } from './types.js';
import type { createDateUtils } from './utils/date.js';

import { minutesToPercentage } from './utils/conversions.js';
export interface CalendarEventProps {
  inAllDayBar: boolean;
  cellStart: Date;
  cellEnd: Date;
}
export interface CalendarEventHost {
  prefixCls: string;
  config: {
    editableEvents: { drag: boolean; resize: boolean };
    time: boolean;
    horizontal: boolean;
    timeFrom: number;
    timeTo: number;
  };
  view: {
    isDay: boolean;
    isDays: boolean;
    isWeek: boolean;
    isMonth: boolean;
    isYear: boolean;
    isYears: boolean;
  };
  touch: { isResizingEvent: boolean };
  dateUtils: Pick<ReturnType<typeof createDateUtils>, 'isSameDate'>;
}
export type CalendarEventStyle = {
  backgroundColor?: string | undefined;
  color?: string | undefined;
  left?: string;
  top?: string;
  width?: string;
  height?: string;
};
export function createCalendarEventRules(
  host: CalendarEventHost,
  props: CalendarEventProps,
  event: CalendarEvent,
  derived: { canTouchAndDrag: boolean | null; startsInCell: boolean; endsInCell: boolean },
) {
  const { config, view, touch: globalTouchState, dateUtils, prefixCls } = host;
  const isDraggable = () => {
    return (
      config.editableEvents.drag &&
      event.draggable !== false &&
      !event.background &&
      derived.canTouchAndDrag !== false
    );
  };
  const isResizable = () => {
    if (view.isMonth || view.isYear || view.isYears || props.inAllDayBar) return false;
    if (event._.multiday && !derived.endsInCell) return false;
    return (
      config.time && config.editableEvents.resize && event.resizable !== false && !event.background
    );
  };
  const classes = () => {
    const isMultiday = !!event._?.multiday;
    const isHzl = config.horizontal;
    const isCutStart =
      !props.inAllDayBar &&
      (event._?.startMinutes < config.timeFrom || (isMultiday && !derived.startsInCell));

    const isCutEnd =
      !props.inAllDayBar &&
      (event._?.endMinutes > config.timeTo || (isMultiday && !derived.endsInCell));

    return {
      [`${prefixCls}__event--${event._.id}`]: true,
      [event.class ?? '']: !!event.class,
      [`${prefixCls}__event--recurring`]: !!event.recurring,
      [`${prefixCls}__event--background`]: !!event.background,
      [`${prefixCls}__event--all-day`]:
        event.allDay || (event._?.startMinutes === 0 && event._?.duration === 24 * 60),
      [`${prefixCls}__event--multiday`]: isMultiday,
      // In horizontal mode, cut-top becomes cut-left and cut-bottom becomes cut-right.
      [`${prefixCls}__event--cut-top`]: !isHzl && isCutStart,
      [`${prefixCls}__event--cut-bottom`]: !isHzl && isCutEnd,
      [`${prefixCls}__event--cut-left`]: isHzl && isCutStart,
      [`${prefixCls}__event--cut-right`]: isHzl && isCutEnd,
      // Only apply the dragging class on the event copy that is being dragged.
      [`${prefixCls}__event--dragging`]: !event._.draggingGhost && event._.dragging,
      // Only apply the dragging-ghost class on the event original that remains fixed while a copy is being
      // dragged. Sometimes when dragging fast the dragging-ghost class would get stuck and events stays
      // invisible, so if dragging is false, disable the dragging-ghost class as well.
      // On event drop, if the new position of the event is approved, only remove the dragging-ghost class
      // after event deletion (event._.dragging is already false) so the event ghost does not flash in before
      // deletion.
      [`${prefixCls}__event--dragging-ghost`]: event._.draggingGhost,
      [`${prefixCls}__event--resizing`]: globalTouchState.isResizingEvent,
    };
  };
  const eventStartsInThisCell = () => {
    if (event._.multiday) {
      return new Date(event.start).setHours(0, 0, 0, 0) === props.cellStart.getTime();
    }
    return true;
  };
  const eventEndsInThisCell = () => {
    if (event._.multiday) {
      return dateUtils.isSameDate(new Date(new Date(event.end).setMilliseconds(-1)), props.cellEnd);
    }
    return true;
  };
  const plusDaysIndicator = () => {
    const start = new Date(event.start).setHours(0, 0, 0, 0);
    const end = new Date(event.end).setHours(0, 0, 0, 0);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };
  const styles = (): CalendarEventStyle | false => {
    const hasPosition =
      (view.isDay || view.isDays || view.isWeek) && config.time && !props.inAllDayBar;
    const isHzl = config.horizontal;

    if (!hasPosition && !event.backgroundColor && !event.color) return false;

    const styles: CalendarEventStyle = {
      backgroundColor: event.backgroundColor || undefined,
      color: event.color || undefined,
    };

    if (hasPosition) {
      let startMinutes = event._.startMinutes;
      let endMinutes = event._.endMinutes;

      if (event._.multiday) {
        if (!derived.startsInCell) startMinutes = 0;
        if (!derived.endsInCell) endMinutes = 24 * 60;
      }

      // Ensure that the event start and end stay in range.
      const from = Math.max(config.timeFrom, startMinutes);
      const to =
        Math.min(config.timeTo, endMinutes) + (event._.duration && !endMinutes ? 24 * 60 : 0);
      const top = minutesToPercentage(from, config);
      const height = minutesToPercentage(to, config) - top;

      styles[isHzl ? 'left' : 'top'] = `${top}%`;
      styles[isHzl ? 'width' : 'height'] = `${height}%`;
    }

    return styles;
  };
  return {
    isDraggable,
    isResizable,
    classes,
    eventStartsInThisCell,
    eventEndsInThisCell,
    plusDaysIndicator,
    styles,
  };
}
export function createCalendarEventInteraction(
  adapter: {
    prefixCls: string;
    event: CalendarEvent;
    element: () => HTMLElement;
    listeners: () => Record<string, CalendarListener>;
    resize: (e: MouseEvent | TouchEvent, event: CalendarEvent, element: HTMLElement) => void;
  },
  touch: { canTouchAndDrag: boolean | null },
) {
  const { prefixCls, event, resize: handleEventResize } = adapter;
  let clickTimeout: ReturnType<typeof setTimeout> | null = null;
  let holdTimer: ReturnType<typeof setTimeout> | null = null;
  let touchAndDragTimer: ReturnType<typeof setTimeout> | null = null;
  const clearHold = () => {
    if (holdTimer) clearTimeout(holdTimer);
    if (touchAndDragTimer) clearTimeout(touchAndDragTimer);
    holdTimer = null;
    touchAndDragTimer = null;

    document.removeEventListener('mouseup', clearHold);
    document.removeEventListener('touchend', clearHold);
    document.removeEventListener('touchcancel', clearHold);
  };
  const onMousedown = (e: MouseEvent | TouchEvent) => {
    const domEvent = (e as TouchEvent).touches?.[0] || e;
    const eventTarget = domEvent.target as Element | null;
    const fromResizer = !!eventTarget?.closest(`.${prefixCls}__event-resizer`);
    if (fromResizer) handleEventResize(e, event, adapter.element());
    if (holdTimer) clearTimeout(holdTimer);
    document.addEventListener('mouseup', clearHold);
    document.addEventListener('touchend', clearHold);
    document.addEventListener('touchcancel', clearHold);
    holdTimer = setTimeout(() => {
      adapter.listeners().hold?.({ e, event });
    }, 1000);
  };
  const buildListeners = (extListeners: Record<string, CalendarListener>) => {
    const listeners: Record<string, CalendarListener> = {};

    // Inject the event details in each eventListener handler call as 2nd param.
    for (const [eventListener, handler] of Object.entries(extListeners) as [
      string,
      CalendarListener,
    ][]) {
      // The events manager handles `event-resize-end` after document mouseup.
      if (!['resize-end'].includes(eventListener)) {
        listeners[eventListener] = (e: Event | { e: Event }) => {
          // SHOULD NOT PREVENT BUBBLING UP TO THE CELL WHEN INTERACTING WITH THE EVENT:
          // if we stop bubbling, we will not receive the onMouseup listened from document if
          // releasing on the event. Instead, in the cell don't call the mouseup handler if
          // releasing on the event.
          // e.stopPropagation()

          // Check if e.type to not rewrap the DOM event in an object if already done.
          // `event-drop` is handled in the drag-and-drop composable.
          if (!('type' in e) || e.type !== 'drop') handler('type' in e ? { e, event } : e);
        };
      }
    }

    // Store a copy of any potential external handler to combine with internal handlers like
    // click, touchstart, mousedown.
    const externalHandlers: Record<string, CalendarListener> = { ...listeners };

    listeners.touchstart = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      touchAndDragTimer = setTimeout(() => {
        touch.canTouchAndDrag = true;
      }, 500);
      onMousedown(e);

      externalHandlers.touchstart?.({ e, event });
    };
    listeners.mousedown = (e: MouseEvent | TouchEvent) => {
      e.stopPropagation();
      onMousedown(e);

      externalHandlers.mousedown?.({ e, event });
    };

    // `event-delayed-click` is only fired after 400ms if there was no dblclick.
    listeners.click = (e: MouseEvent | TouchEvent) => {
      externalHandlers.click?.({ e, event }); // Handle single click.

      // Handle double click in eventListeners.dblclick.
      if (clickTimeout) clickTimeout = clearTimeout(clickTimeout) as unknown as null;
      else {
        clickTimeout = setTimeout(() => {
          clickTimeout = null;
          externalHandlers['delayed-click']?.({ e, event }); // Handle delayed single click.
        }, 400);
      }
    };
    listeners.dblclick = (e: MouseEvent | TouchEvent) => {
      if (externalHandlers.dblclick) externalHandlers.dblclick({ e, event });
      // Show delete button on event on double click by default except if dblclick is used
      // externally.
      else event.delete(1);
    };

    return listeners;
  };
  const dispose = () => {
    clearHold();
    if (clickTimeout) clickTimeout = clearTimeout(clickTimeout) as unknown as null;
  };
  return { buildListeners, dispose };
}
