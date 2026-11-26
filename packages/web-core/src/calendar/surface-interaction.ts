import type { CalendarSurfaceHost, CalendarBodyCursor } from './surfaces.js';

import { pxToPercentage } from './utils/conversions.js';
export function createCalendarBodyController(
  calendar: Pick<CalendarSurfaceHost, 'config' | 'view'>,
  cursor: CalendarBodyCursor,
  adapter: { element: HTMLElement | null },
) {
  const { config, view } = calendar;
  const onBodyMove = (e: PointerEvent | TouchEvent) => {
    if (view.isMonth || view.isYear || view.isYears || !config.timeAtCursor) return;
    if ('pointerType' in e && e.pointerType === 'touch') return;

    const domEvent = (e as TouchEvent).touches?.[0] || e; // Handle click or touch event.
    const { clientX, clientY } = domEvent;

    if (adapter.element) {
      const { top, left } = adapter.element.getBoundingClientRect();
      if (config.horizontal) cursor.x = ((clientX - left) * 100) / adapter.element.clientWidth;
      else cursor.y = pxToPercentage(clientY - top, adapter.element);
    }
  };
  const clearCursor = () => {
    cursor.x = null;
    cursor.y = null;
  };
  const mount = () => {
    if (adapter.element) {
      adapter.element.addEventListener('pointermove', onBodyMove);
      adapter.element.addEventListener('touchmove', onBodyMove);
      adapter.element.addEventListener('pointerleave', clearCursor);
      adapter.element.addEventListener('touchend', clearCursor);
      adapter.element.addEventListener('touchcancel', clearCursor);
    }
  };
  const dispose = () => {
    if (adapter.element) {
      adapter.element.removeEventListener('pointermove', onBodyMove);
      adapter.element.removeEventListener('touchmove', onBodyMove);
      adapter.element.removeEventListener('pointerleave', clearCursor);
      adapter.element.removeEventListener('touchend', clearCursor);
      adapter.element.removeEventListener('touchcancel', clearCursor);
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
      if (typeof window !== 'undefined' && Object.hasOwn(window, 'ontouchstart'))
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
