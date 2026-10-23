import type {
  CalendarCellHost,
  CalendarCellProps,
  CalendarCellTouch,
  createCalendarCellRules,
} from './cell.js';
import type { CalendarCell, CalendarId, CalendarListener } from './types.js';

import { percentageToMinutes, pxToPercentage } from './utils/conversions.js';
type CellRules = ReturnType<typeof createCalendarCellRules>;
export interface CalendarCellAdapter {
  element: HTMLElement | null;
  info: CalendarCell;
  cursor: ReturnType<CellRules['cursorInfo']>;
  placeholder: ReturnType<CellRules['eventPlaceholder']>;
  isCreating: boolean;
  isDisabled: boolean;
  listeners: Record<string, CalendarListener>;
  awaitingEventCreation: boolean;
  deletedIds: CalendarId[];
}
export function createCalendarCellInteraction(
  host: CalendarCellHost,
  props: CalendarCellProps,
  touch: CalendarCellTouch,
  adapter: CalendarCellAdapter,
) {
  const { config, view, dnd, touch: globalTouchState, prefixCls, eventsManager } = host;
  let clickTimeout: ReturnType<typeof setTimeout> | null = null;
  const getTimeAtCursor = (e: MouseEvent | TouchEvent) => {
    const isHzl = config.horizontal;
    const { clientX, clientY } = (e as TouchEvent).touches?.[0] || e;
    if (!adapter.element) return { x: 0, y: 0, date: new Date() };
    const { top, left } = adapter.element.getBoundingClientRect();

    const cursorPercent = isHzl
      ? ((clientX - left) * 100) / adapter.element.clientWidth
      : pxToPercentage(clientY - top, adapter.element);

    const date = new Date(props.start);
    date.setMinutes(percentageToMinutes(cursorPercent, config));

    return { [isHzl ? 'x' : 'y']: cursorPercent, date };
  };
  const onCellClick = () => {
    view.updateSelectedDate(props.start);

    if (config.clickToNavigate) {
      if ((view.isMonth || view.isDays || view.isWeek) && config.availableViews.day)
        view.switch('day');
      else if (view.isYear && config.availableViews.month) view.switch('month');
      else if (view.isYears && config.availableViews.year) view.switch('year');
    }
    view.updateViewDate(props.start);
  };
  const onMousedown = (e: MouseEvent | TouchEvent) => {
    const isTouchEvent = e.type === 'touchstart';

    // On touch devices, wait for 500ms then trigger event creation.
    if (isTouchEvent) {
      touch.canTouchAndDrag = false;
      touch.touchAndDragTimer = setTimeout(() => {
        touch.canTouchAndDrag = true;
        // Now we can start the event creation process if still touching
        // Prevent default scrolling behavior from this point.
        if (touch.holding || touch.dragging) e.preventDefault();
      }, 500);
    }
    // For mouse events, allow immediate event creation.
    else touch.canTouchAndDrag = true;

    // dataset.schedule is always a string; match config id (number, 0, or string/UID).
    const rawSchedule = ((e.target as HTMLElement)?.closest('[data-schedule]') as HTMLElement)
      ?.dataset?.schedule;
    if (rawSchedule !== undefined && config.schedules?.length) {
      const match = config.schedules.find((s) => String(s.id) === String(rawSchedule));
      touch.schedule = match ? match.id : rawSchedule;
    } else touch.schedule = null;
    if (!adapter.element) return;
    const rect = adapter.element.getBoundingClientRect();
    touch.startX = ((e as TouchEvent).touches?.[0] || e).clientX - rect.left; // Handle click or touch event coords.
    touch.startY = ((e as TouchEvent).touches?.[0] || e).clientY - rect.top; // Handle click or touch event coords.
    touch.startPercentageX = (touch.startX * 100) / rect.width;
    touch.startPercentageY = (touch.startY * 100) / rect.height;
    touch.thresholdPassed = false;

    document.addEventListener(isTouchEvent ? 'touchmove' : 'mousemove', onDocMousemove, {
      passive: !isTouchEvent,
    });
    document.addEventListener(isTouchEvent ? 'touchend' : 'mouseup', onDocMouseup, { once: true });
    if (isTouchEvent) document.addEventListener('touchcancel', onDocMouseup, { once: true });

    touch.holdTimer = setTimeout(() => {
      touch.holding = true;
      // If there's a @cell-hold external listener, call it.
      adapter.listeners.hold?.({ e, cell: adapter.info, cursor: adapter.cursor, view });
    }, 1000);
  };
  const onDocMousemove = (e: MouseEvent | TouchEvent) => {
    const isTouchEvent = e.type === 'touchmove';
    const isHzl = config.horizontal;

    // For touch events, if the 500ms hasn't passed yet, cancel event creation and allow scrolling.
    if (isTouchEvent && !touch.canTouchAndDrag) {
      // Cancel the touch and drag timer.
      if (touch.touchAndDragTimer) {
        clearTimeout(touch.touchAndDragTimer);
        touch.touchAndDragTimer = null;
      }
      // Don't prevent default - allow natural scrolling.
      // Clean up and exit early.
      onDocMouseup(e);
      return;
    }

    if (isTouchEvent) {
      // If we reach here, either it's a mouse event or touch event after 500ms delay.
      // Prevent default scrolling when click/tap and move so we can create events instead.
      e.preventDefault();
    }

    // Internal emit to the root component to add a CSS class on wrapper while dragging.
    if (!touch.dragging) {
      globalTouchState.isDraggingCell = true; // Add a CSS class on wrapper while dragging.

      // If there's a @cell-drag-start external listener, call it.
      adapter.listeners['drag-start']?.({
        e,
        cell: adapter.info,
        cursor: adapter.cursor,
        view,
      });
    }
    touch.dragging = true;
    if (touch.holdTimer) {
      touch.holdTimer = clearTimeout(touch.holdTimer) as unknown as null;
    }
    touch.holding = false;

    if (!adapter.element) return;
    const rect = adapter.element.getBoundingClientRect();
    touch.moveX = ((e as TouchEvent).touches?.[0] || e).clientX - rect.left; // Handle click or touch event coords.
    touch.moveY = ((e as TouchEvent).touches?.[0] || e).clientY - rect.top; // Handle click or touch event coords.
    touch.movePercentageX = (touch.moveX * 100) / rect.width;
    touch.movePercentageY = (touch.moveY * 100) / rect.height;

    // Check drag threshold based on layout orientation.
    const dragDelta = isHzl
      ? Math.abs(touch.startX - touch.moveX)
      : Math.abs(touch.startY - touch.moveY);
    if (config.eventCreateMinDrag && dragDelta > config.eventCreateMinDrag) {
      touch.thresholdPassed = true;
    }

    // If there's a @cell-drag external listener, call it.
    adapter.listeners.drag?.({ e, cell: adapter.info, cursor: adapter.cursor, view });
  };
  const onDocMouseup = async (e: MouseEvent | TouchEvent) => {
    const isTouchEvent = e.type.startsWith('touch');
    document.removeEventListener(
      isTouchEvent ? 'touchmove' : 'mousemove',
      onDocMousemove as EventListener,
    );
    document.removeEventListener(isTouchEvent ? 'touchend' : 'mouseup', onDocMouseup);
    if (isTouchEvent) document.removeEventListener('touchcancel', onDocMouseup);

    // Clean up touch and drag timer
    if (touch.touchAndDragTimer) {
      clearTimeout(touch.touchAndDragTimer);
      touch.touchAndDragTimer = null;
    }

    if (touch.dragging) {
      // If there's a @cell-drag-end external listener, call it.
      adapter.listeners['drag-end']?.({
        e,
        cell: adapter.info,
        cursor: adapter.cursor,
        view,
      });
      globalTouchState.isDraggingCell = false; // Add a CSS class on wrapper while dragging.

      if (config.editableEvents.create && touch.canTouchAndDrag && e.type !== 'touchcancel') {
        adapter.awaitingEventCreation = true;
        await createEventIfAllowed(e);
        adapter.awaitingEventCreation = false;
      }
    }

    if (touch.holdTimer) {
      touch.holdTimer = clearTimeout(touch.holdTimer) as unknown as null;
    }
    touch.holding = false;
    touch.dragging = false;
    touch.startX = 0;
    touch.startY = 0;
    touch.moveX = 0;
    touch.moveY = 0;
    touch.startPercentageX = 0;
    touch.startPercentageY = 0;
    touch.movePercentageX = 0;
    touch.movePercentageY = 0;
    touch.thresholdPassed = false;
    touch.schedule = null;
    touch.canTouchAndDrag = null;
  };
  const createEventIfAllowed = async (e: MouseEvent | TouchEvent) => {
    if (!adapter.isCreating) return;

    const { startMinutes, endMinutes } = adapter.placeholder;
    const start = new Date(props.start);
    start.setMinutes(startMinutes);
    const end = new Date(props.start);
    end.setMinutes(endMinutes);

    let eventToCreate = { ...adapter.placeholder, start, end };

    // If there's a @event-create listener, call it and check if it returns true to accept the event
    // creation or false to cancel it. If no listener, create the event.
    // The call to the handler is wrapped in a promise so the user may open an event editor and modify
    // the event before sending in back and resolving the promise.
    const { create: createListener } = config.eventListeners.event;

    if (typeof createListener === 'function') {
      const eventCopy = eventToCreate;
      eventToCreate = await new Promise((resolve) =>
        createListener({
          e,
          event: eventToCreate,
          cell: adapter.info,
          resolve,
          cursor: adapter.cursor,
          view,
        }),
      );
      // eventToCreate may be true, false or an updated event object to create.
      if (eventToCreate && typeof eventToCreate === 'object') view.createEvent(eventToCreate);
      if (eventToCreate && typeof eventToCreate === 'boolean') view.createEvent(eventCopy);
    } else view.createEvent(eventToCreate);
    navigator.vibrate?.(200); // Haptic feedback on supported devices and browsers.
  };
  const removeEventListeners = () => {
    for (const event of Object.keys(adapter.listeners)) {
      adapter.element?.removeEventListener(event, adapter.listeners[event] as EventListener);
    }
  };
  const buildListeners = () => {
    if (adapter.isDisabled) {
      return {};
    }

    const listeners: Record<string, CalendarListener> = { ...config.eventListeners.cell };

    // Inject the cell details in each eventListener handler call as 2nd param.
    for (const [eventListener, handler] of Object.entries(listeners)) {
      listeners[eventListener] = (e: Event | { e: Event }) => {
        // When interacting with an event, skip calling the cell DOM event handler.
        // The DOM event bubbles up to the cell from the event but we don't stop it on purpose so
        // we can receive the on mouseup from the document and stop event drag&drop.
        if (
          (('e' in e ? e.e?.target : e.target) as Element | null)?.closest?.(`.${prefixCls}__event`)
        )
          return;

        // Check if e.type to not rewrap the DOM event in an object if already done.
        handler('type' in e ? { e, cell: adapter.info, cursor: adapter.cursor, view } : e);
      };
    }

    // Store a copy of any potential external handler to combine with internal handlers like
    // click, touchstart, mousedown.
    const externalHandlers: Record<string, CalendarListener> = { ...listeners };

    // `cell-delayed-click` is only fired after 400ms if there was no dblclick.
    listeners.click = (e: MouseEvent | TouchEvent) => {
      onCellClick();
      const cursor = getTimeAtCursor(e);

      externalHandlers.click?.({ e, cell: adapter.info, cursor, view });

      if (clickTimeout) clickTimeout = clearTimeout(clickTimeout) as unknown as null;
      else {
        clickTimeout = setTimeout(() => {
          clickTimeout = null;
          // Handle delayed single click.
          externalHandlers['delayed-click']?.({ e, cell: adapter.info, cursor, view });
        }, 400);
      }
    };

    if ((config.time && view.isDay) || view.isDays || view.isWeek) {
      listeners.touchstart = (e: MouseEvent | TouchEvent) => {
        onMousedown(e);
        externalHandlers.touchstart?.({
          e,
          cell: adapter.info,
          cursor: adapter.cursor,
          view,
        });
      };
      listeners.mousedown = (e: MouseEvent | TouchEvent) => {
        onMousedown(e);

        externalHandlers.mousedown?.({ e, cell: adapter.info, cursor: adapter.cursor, view });
      };
    }

    if (externalHandlers.dblclick) {
      // If there's a dblclick external listener, recalculate the cursor position and date
      // since the mouse up has already fired and cleared the touch object.
      // Note: increasing the touch object longevity to keep the cursor position and date would
      // not work because the dblclick can have a fast click and a long hold second click and it
      // should still fire.
      listeners.dblclick = (e: MouseEvent | TouchEvent) => {
        externalHandlers.dblclick?.({
          e,
          cell: adapter.info,
          cursor: getTimeAtCursor(e),
          view,
        });
      };
    }

    if (config.editableEvents.drag) {
      listeners.dragenter = (e: DragEvent) => dnd.cellDragEnter(e, adapter.info);
      listeners.dragover = (e: DragEvent) => {
        e.preventDefault(); // Explicitly prevent default to allow drop in Firefox.
        dnd.cellDragOver(e, adapter.info);
      };
      listeners.dragleave = (e: DragEvent) => dnd.cellDragLeave(e, adapter.info);
      listeners.drop = (e: DragEvent) => dnd.cellDragDrop(e, adapter.info, props.allDay);
    }

    return listeners;
  };
  const dispose = () => {
    // Removing the calendar events will trigger a rerender of all the cells in the view because the array
    // of events is a reactive object. So only remove them from the source of truth when the cell is unmounted.
    for (const eventId of adapter.deletedIds) eventsManager.deleteEvent(eventId, 3);

    removeEventListeners(); // Prevent potential memory leaks.
    document.removeEventListener('mousemove', onDocMousemove);
    document.removeEventListener('touchmove', onDocMousemove);
    document.removeEventListener('mouseup', onDocMouseup);
    document.removeEventListener('touchend', onDocMouseup);
    document.removeEventListener('touchcancel', onDocMouseup);
    if (touch.holdTimer) clearTimeout(touch.holdTimer);
    if (touch.touchAndDragTimer) clearTimeout(touch.touchAndDragTimer);
    if (touch.dragging) globalTouchState.isDraggingCell = false;
    if (clickTimeout) clickTimeout = clearTimeout(clickTimeout) as unknown as null;
  };
  return { buildListeners, dispose };
}
