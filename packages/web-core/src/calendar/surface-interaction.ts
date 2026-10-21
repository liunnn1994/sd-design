import type { CalendarSurfaceHost, CalendarBodyCursor } from './surfaces.js';

import { pxToPercentage } from './utils/conversions.js';
export function createCalendarBodyController(
  calendar: Pick<CalendarSurfaceHost, 'config' | 'view' | 'touch' | 'prefixCls'>,
  cursor: CalendarBodyCursor,
  adapter: { element: HTMLElement | null; resizeState: { cellEl: HTMLElement | null } },
) {
  const { config, view, touch: globalTouchState, prefixCls } = calendar;
  const { resizeState } = adapter;
  const onBodyMousemove = (e: MouseEvent | TouchEvent) => {
    if (view.isMonth || view.isYear || view.isYears) return;

    // When resizing an event horizontally, update the current hovered cell from the body element,
    // so there is only one event listener and no need for cell coordinates calculation.
    const needsResizeCellUpdate = globalTouchState.isResizingEvent && config.editableEvents.resizeX;

    // Skip all DOM work when nothing needs updating (common case when timeAtCursor is off).
    if (!config.timeAtCursor && !needsResizeCellUpdate) return;

    const domEvent = (e as TouchEvent).touches?.[0] || e; // Handle click or touch event.
    const { clientX, clientY } = domEvent;

    if (needsResizeCellUpdate)
      resizeState.cellEl = getCellUnderMouse(clientX, clientY) as HTMLElement | null;

    if (config.timeAtCursor && adapter.element) {
      const { top, left } = adapter.element.getBoundingClientRect();
      if (config.horizontal) cursor.x = ((clientX - left) * 100) / adapter.element.clientWidth;
      else cursor.y = pxToPercentage(clientY - top, adapter.element);
    }
  };
  const onBodyMouseleave = () => {
    cursor.x = null;
    cursor.y = null;
  };
  const getCellUnderMouse = (mouseX: number, mouseY: number) => {
    // Use elementFromPoint for better performance as it's optimized by the browser.
    const element = document.elementFromPoint(mouseX, mouseY);
    // Check if the element or its parent is a cell.
    return element?.closest(`.${prefixCls}__cell`) || null;
  };
  const mount = () => {
    if (adapter.element) {
      adapter.element.addEventListener('mousemove', onBodyMousemove);
      adapter.element.addEventListener('touchmove', onBodyMousemove);
      adapter.element.addEventListener('mouseleave', onBodyMouseleave);
      adapter.element.addEventListener('touchend', onBodyMouseleave);
    }
  };
  const dispose = () => {
    if (adapter.element) {
      adapter.element.removeEventListener('mousemove', onBodyMousemove);
      adapter.element.removeEventListener('touchmove', onBodyMousemove);
      adapter.element.removeEventListener('mouseleave', onBodyMouseleave);
      adapter.element.removeEventListener('touchend', onBodyMouseleave);
    }
  };
  return { mount, dispose };
}
export const syncCalendarPrefixedClasses = (rootEl: HTMLElement | null, prefixCls: string) => {
  if (!rootEl) return;

  const matchCalendarPrefix = (cls: string) => {
    const matched = cls.match(/^(.+?-calendar)(?=--|__)/);
    return matched ? matched[1] : null;
  };

  const syncElement = (el: Element) => {
    if (!(el instanceof Element) || !el.classList?.length) return;

    for (const cls of el.classList) {
      const classPrefix = matchCalendarPrefix(cls);
      if (!classPrefix || classPrefix === prefixCls) continue;

      const prefixed = `${prefixCls}${cls.slice(classPrefix.length)}`;
      if (prefixed && !el.classList.contains(prefixed)) el.classList.add(prefixed);
    }
  };

  syncElement(rootEl);
  rootEl.querySelectorAll('[class]').forEach(syncElement);
};
export function createCalendarRootController(
  prefixCls: string,
  adapter: { element: HTMLElement | null },
) {
  const contextMenuHandler = (e: Event) => {
    if ((e.target as HTMLElement)?.closest(`.${prefixCls}__cell, [class$="__cell"]`))
      e.preventDefault();
  };
  return {
    mount() {
      if (typeof window !== 'undefined' && window.hasOwnProperty('ontouchstart'))
        adapter.element?.addEventListener('contextmenu', contextMenuHandler);
    },
    sync() {
      syncCalendarPrefixedClasses(adapter.element, prefixCls);
    },
    dispose() {
      adapter.element?.removeEventListener('contextmenu', contextMenuHandler);
    },
  };
}
