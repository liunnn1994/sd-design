import ResizeObserver from 'resize-observer-polyfill';

import { createResizeObserverFoundation } from './foundation.js';

export function createResizeObserverController(onResize: (entry: ResizeObserverEntry) => void) {
  return createResizeObserverFoundation({
    observe(target, listener) {
      const observer = new ResizeObserver(listener);
      // Virtualized children may mount during resize delivery. Register after
      // that delivery so shallower targets do not create undelivered notices.
      const frame = window.requestAnimationFrame(() => observer.observe(target));
      return () => {
        window.cancelAnimationFrame(frame);
        observer.disconnect();
      };
    },
    requestFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (frame) => window.cancelAnimationFrame(frame),
    onResize,
  });
}
