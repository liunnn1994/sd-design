import { onBeforeUnmount, watch, type Ref } from 'vue';

import { useDraggable, type DraggableEvent } from 'vue-draggable-plus';

/** Keep Vue (including virtualized lists) in charge of DOM order. */
export default function useDragSort(
  root: Ref<HTMLElement | null | undefined>,
  options: {
    draggable: string;
    handle: string;
    onStart: (item: HTMLElement, event: DragEvent) => void;
    onOver: (item: HTMLElement | undefined, event: DragEvent) => void;
    onEnd: (event: DragEvent, cancelled: boolean) => void;
  },
) {
  let active = false;
  let fallbackElement: HTMLElement | null = null;
  let cancelled = false;
  let restoreSelection: (() => void) | undefined;
  let restoreLayout: (() => void) | undefined;
  let lastEvent: DragEvent;
  const originalEvent = (event: DraggableEvent) =>
    (event as DraggableEvent & { originalEvent: Event }).originalEvent;

  function dragEvent(type: string, event: Event): DragEvent {
    if (event instanceof DragEvent) return event;
    const point =
      'touches' in event
        ? ((event as TouchEvent).touches[0] ?? (event as TouchEvent).changedTouches[0])
        : (event as MouseEvent);
    return new DragEvent(type, { clientX: point?.clientX, clientY: point?.clientY });
  }

  function preventSelection(event: Event) {
    if (event.cancelable) event.preventDefault();
    event.stopPropagation();
  }

  function lockSelection(event: Event) {
    // Cancelling pointerdown suppresses the mouseup Sortable needs to finish.
    // Block selection with CSS/selectstart while preserving compatibility events.
    event.stopPropagation();
    if (restoreSelection) return;
    const style = document.body.style;
    const properties = ['user-select', '-webkit-user-select'];
    const previous = properties.map((property) => [
      property,
      style.getPropertyValue(property),
      style.getPropertyPriority(property),
    ]);
    properties.forEach((property) => style.setProperty(property, 'none', 'important'));
    document.addEventListener('selectstart', preventSelection, true);
    restoreSelection = () => {
      previous.forEach(([property, value, priority]) => {
        if (value) style.setProperty(property, value, priority);
        else style.removeProperty(property);
      });
      document.removeEventListener('selectstart', preventSelection, true);
      restoreSelection = undefined;
    };
  }

  function over(event: Event) {
    if (!active) return;
    // Keep propagation to Sortable's document listeners for fallback dragging.
    if (event.cancelable) event.preventDefault();
    lastEvent = dragEvent('dragover', event);
    const element = document.elementFromPoint(lastEvent.clientX, lastEvent.clientY);
    let item = element?.closest<HTMLElement>(options.draggable);
    // Virtua disables pointer events while scrolling. Hit-test mounted rows
    // geometrically so auto-scroll and a drop before scroll-end still work.
    if (!item && element && root.value?.contains(element)) {
      item = Array.from(root.value.querySelectorAll<HTMLElement>(options.draggable))
        .reverse()
        .find((row) => {
          const rect = row.getBoundingClientRect();
          return (
            rect.width > 0 &&
            rect.height > 0 &&
            lastEvent.clientX >= rect.left &&
            lastEvent.clientX <= rect.right &&
            lastEvent.clientY >= rect.top &&
            lastEvent.clientY <= rect.bottom
          );
        });
    }
    options.onOver(item && root.value?.contains(item) ? item : undefined, lastEvent);
  }

  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape') cancelled = true;
  }

  function cleanup() {
    active = false;
    restoreSelection?.();
    fallbackElement?.remove();
    fallbackElement = null;
    document.removeEventListener('mousemove', over, true);
    document.removeEventListener('pointermove', over, true);
    document.removeEventListener('touchmove', over, true);
    document.removeEventListener('keydown', keydown, true);
  }

  const draggable = useDraggable(root, {
    immediate: false,
    draggable: options.draggable,
    handle: options.handle,
    // A body-level clone survives recycling of the source virtual row.
    forceFallback: true,
    fallbackOnBody: true,
    onMove: () => false,
    dragoverBubble: false,
    dropBubble: false,
    onChoose(event) {
      lockSelection(originalEvent(event));
    },
    onUnchoose() {
      restoreSelection?.();
      restoreLayout?.();
      restoreLayout = undefined;
    },
    onStart(event) {
      active = true;
      window.getSelection()?.removeAllRanges();
      fallbackElement = document.querySelector<HTMLElement>('.sortable-fallback');
      cancelled = false;
      lastEvent = dragEvent('dragstart', originalEvent(event));
      options.onStart(event.item, lastEvent);
      document.addEventListener('mousemove', over, true);
      document.addEventListener('pointermove', over, true);
      document.addEventListener('touchmove', over, { capture: true, passive: false });
      document.addEventListener('keydown', keydown, true);
    },
    onEnd(event) {
      over(originalEvent(event));
      cleanup();
      options.onEnd(
        dragEvent('dragend', originalEvent(event) ?? lastEvent),
        cancelled || originalEvent(event)?.type === 'touchcancel',
      );
    },
  });
  // Virtualizers wrap each row. Bind to its actual parent at gesture start,
  // before Sortable receives the bubbling pointerdown event.
  function prepare(event: Event) {
    if (active || !(event.target instanceof Element)) return;
    const handle = event.target.closest(options.handle);
    const item = handle?.closest<HTMLElement>(options.draggable);
    if (item && root.value?.contains(item) && item.parentElement) {
      restoreLayout?.();
      restoreLayout = undefined;
      const style = getComputedStyle(item);
      if (style.display === 'contents' || style.display === 'grid') {
        const display = item.style.display;
        const columns = item.style.gridTemplateColumns;
        const gridColumns =
          style.display === 'contents'
            ? getComputedStyle(item.parentElement).gridTemplateColumns
            : style.gridTemplateColumns;
        item.style.display = 'grid';
        item.style.gridTemplateColumns = gridColumns;
        restoreLayout = () => {
          item.style.display = display;
          item.style.gridTemplateColumns = columns;
        };
      }
      draggable.start(item.parentElement);
    }
  }
  watch(
    root,
    (element, previous) => {
      previous?.removeEventListener('pointerdown', prepare, true);
      element?.addEventListener('pointerdown', prepare, true);
    },
    { flush: 'post' },
  );
  onBeforeUnmount(() => {
    root.value?.removeEventListener('pointerdown', prepare, true);
    restoreLayout?.();
    cleanup();
  });
}
