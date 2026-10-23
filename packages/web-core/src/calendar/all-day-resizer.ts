export function createCalendarAllDayResizer(
  config: { horizontal: boolean },
  prefixCls: string,
  adapter: { element: HTMLElement | null },
) {
  const allDayResizer = {
    isResizing: false,
    startY: 0,
    initialHeight: 0,

    // Or in the case of horizontal layout.
    startX: 0,
    initialWidth: 0,

    // Cleanup event listeners.
    cleanup() {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousemove', allDayResizer.handleMouseMove);
        document.removeEventListener('mouseup', allDayResizer.cleanup);
        document.removeEventListener('touchmove', allDayResizer.handleTouchMove);
        document.removeEventListener('touchend', allDayResizer.cleanup);
        document.removeEventListener('touchcancel', allDayResizer.cleanup);
      }
      allDayResizer.isResizing = false;
    },

    startResize(clientX: number, clientY: number) {
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

      // Add document event listeners.
      document.addEventListener('mousemove', allDayResizer.handleMouseMove);
      document.addEventListener('mouseup', allDayResizer.cleanup);
      document.addEventListener('touchmove', allDayResizer.handleTouchMove, { passive: false });
      document.addEventListener('touchend', allDayResizer.cleanup);
      document.addEventListener('touchcancel', allDayResizer.cleanup);
    },

    // Update height/width based on mouse/touch movement.
    updateSize(clientX: number, clientY: number) {
      if (!this.isResizing) return;

      const isHzl = config.horizontal;
      const delta = isHzl ? clientX - this.startX : clientY - this.startY;
      // Minimum height/width of 20px.
      const newSize = Math.max(20, this[isHzl ? 'initialWidth' : 'initialHeight'] + delta);

      adapter.element?.style.setProperty(`--${prefixCls}-all-day-bar-size`, `${newSize}px`);
    },

    // Mouse event handlers.
    handleMouseDown(e: MouseEvent) {
      this.startResize(e.clientX, e.clientY);
    },

    handleMouseMove(e: MouseEvent) {
      allDayResizer.updateSize(e.clientX, e.clientY);
    },

    // Touch event handlers.
    handleTouchStart(e: TouchEvent) {
      if (e.touches?.[0]) this.startResize(e.touches[0].clientX, e.touches[0].clientY);
    },

    handleTouchMove(e: TouchEvent) {
      if (e.touches?.[0]) {
        allDayResizer.updateSize(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault(); // Prevent scrolling while resizing.
      }
    },
  };
  return allDayResizer;
}
