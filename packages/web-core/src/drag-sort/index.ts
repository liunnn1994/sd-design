import Sortable, { type SortableEvent } from 'sortablejs';

const dragSortRoot = 'data-drag-sort-root';
const dragCursor = 'data-sd-dragging';

export function getDragRowRect(row: HTMLElement) {
  const element = getComputedStyle(row).display === 'contents' ? row.firstElementChild : row;
  return (element ?? row).getBoundingClientRect();
}

/** Keep the framework (including virtualized lists) in charge of DOM order. */
export function createDragSort(
  root: HTMLElement,
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
  let animationFrame = 0;
  const rowAnimations = new Set<Animation>();
  const originalEvent = (event: SortableEvent) =>
    (event as SortableEvent & { originalEvent: Event }).originalEvent;

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
    if (!item && element && root?.contains(element)) {
      item = Array.from(root.querySelectorAll<HTMLElement>(options.draggable))
        .reverse()
        .find((row) => {
          const rect = getDragRowRect(row);
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
    options.onOver(item && root?.contains(item) ? item : undefined, lastEvent);
  }

  function keydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      cancelled = true;
      document.body.removeAttribute(dragCursor);
    }
  }

  function cleanup() {
    if (active) document.body.removeAttribute(dragCursor);
    active = false;
    restoreSelection?.();
    fallbackElement?.remove();
    fallbackElement = null;
    document.removeEventListener('mousemove', over, true);
    document.removeEventListener('pointermove', over, true);
    document.removeEventListener('touchmove', over, true);
    document.removeEventListener('keydown', keydown, true);
  }

  function measureRows() {
    const rows = new Map<string, { top: number; elements: Element[] }>();
    for (const row of root.querySelectorAll<HTMLElement>('[data-drag-sort-key]')) {
      if (row.closest(`[${dragSortRoot}]`) !== root) continue;
      // Table rows using display: contents have no box of their own.
      const elements = getComputedStyle(row).display === 'contents' ? [...row.children] : [row];
      const rect = elements[0]?.getBoundingClientRect();
      if (rect?.height) rows.set(row.dataset.dragSortKey!, { top: rect.top, elements });
    }
    return rows;
  }

  function animateReorder() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const before = measureRows();
    // Measure again after the framework applies the controlled drop update.
    animationFrame = requestAnimationFrame(() => {
      for (const [key, { top, elements }] of measureRows()) {
        const previous = before.get(key);
        if (!previous || previous.top === top) continue;
        for (const element of elements) {
          const animation = element.animate(
            [{ translate: `0 ${previous.top - top}px` }, { translate: 'none' }],
            { duration: 150, easing: 'ease-out' },
          );
          rowAnimations.add(animation);
          animation.onfinish = animation.oncancel = () => {
            rowAnimations.delete(animation);
          };
        }
      }
    });
  }

  function stopAnimations() {
    cancelAnimationFrame(animationFrame);
    for (const animation of rowAnimations) animation.cancel();
    rowAnimations.clear();
  }

  let sortable: Sortable | undefined;
  const sortOptions: Sortable.Options = {
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
      document.body.setAttribute(dragCursor, '');
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
      const release = originalEvent(event);
      over(release);
      cleanup();
      const dropCancelled =
        cancelled || release?.type === 'touchcancel' || release?.type === 'pointercancel';
      if (!dropCancelled) animateReorder();
      options.onEnd(dragEvent('dragend', release ?? lastEvent), dropCancelled);
    },
  };
  // Virtualizers wrap each row. Bind to its actual parent at gesture start,
  // before Sortable receives the bubbling pointerdown event.
  function prepare(event: Event) {
    if (active || !(event.target instanceof Element)) return;
    const handle = event.target.closest(options.handle);
    const item = handle?.closest<HTMLElement>(options.draggable);
    if (item && root?.contains(item) && item.parentElement) {
      stopAnimations();
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
      if (sortable?.el !== item.parentElement) {
        sortable?.destroy();
        const instance = new Sortable(item.parentElement, sortOptions) as Sortable & {
          _emulateDragOver(): void;
        };
        const emulateDragOver = instance._emulateDragOver;
        // shortcut: Sortable 1.15 dereferences the detached source row; remove when upstream guards it.
        instance._emulateDragOver = () => {
          if (Sortable.dragged?.isConnected) emulateDragOver.call(instance);
        };
        sortable = instance;
      }
    }
  }
  root.setAttribute(dragSortRoot, '');
  root.addEventListener('pointerdown', prepare, true);
  return {
    destroy() {
      root.removeEventListener('pointerdown', prepare, true);
      root.removeAttribute(dragSortRoot);
      sortable?.destroy();
      restoreLayout?.();
      cleanup();
      stopAnimations();
    },
  };
}
