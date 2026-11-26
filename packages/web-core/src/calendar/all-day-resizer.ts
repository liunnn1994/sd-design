import { createPointerDrag } from '../_utils/pointer-drag.js';

export function createCalendarAllDayResizer(
  config: { horizontal: boolean },
  prefixCls: string,
  adapter: { element: HTMLElement | null },
) {
  const drag = createPointerDrag(
    (event) => allDayResizer.updateSize(event.clientX, event.clientY),
    () => allDayResizer.cleanup(),
  );
  const allDayResizer = {
    isResizing: false,
    startY: 0,
    initialHeight: 0,

    // Or in the case of horizontal layout.
    startX: 0,
    initialWidth: 0,

    // Cleanup event listeners.
    cleanup() {
      drag.stop();
      allDayResizer.isResizing = false;
    },

    handlePointerDown(event: PointerEvent, handle?: HTMLElement) {
      if (!adapter.element || !drag.start(event, handle)) return;
      event.preventDefault();
      const { clientX, clientY } = event;
      this.isResizing = true;
      const isHzl = config.horizontal;
      this[isHzl ? 'startX' : 'startY'] = isHzl ? clientX : clientY;

      // Get the current CSS variable value in pixels. Using a temp element to properly
      // convert units like rem/em to pixels, preventing jumps when resizing starts.
      const cssValue = getComputedStyle(adapter.element!).getPropertyValue(
        `--${prefixCls}-all-day-bar-size`,
      );
      const tempEl = document.createElement('div');
      tempEl.style.position = 'absolute';
      tempEl.style.visibility = 'hidden';
      tempEl.style[isHzl ? 'width' : 'height'] = cssValue;
      document.body.appendChild(tempEl);
      const pixelValue = tempEl[isHzl ? 'offsetWidth' : 'offsetHeight'];
      tempEl.remove();

      if (pixelValue > 0) {
        this[isHzl ? 'initialWidth' : 'initialHeight'] = pixelValue;
      }
    },

    // Update height/width based on pointer movement.
    updateSize(clientX: number, clientY: number) {
      if (!this.isResizing) return;

      const isHzl = config.horizontal;
      const delta = isHzl ? clientX - this.startX : clientY - this.startY;
      // Minimum height/width of 20px.
      const newSize = Math.max(20, this[isHzl ? 'initialWidth' : 'initialHeight'] + delta);

      adapter.element?.style.setProperty(`--${prefixCls}-all-day-bar-size`, `${newSize}px`);
    },
  };
  return allDayResizer;
}
