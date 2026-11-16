import { getElementPolygon, isPointInPolygon } from '@zag-js/rect-utils';

export interface HoverIntentOptions {
  getReference(): HTMLElement | null | undefined;
  getFloating(): HTMLElement | null | undefined;
  contains?(target: Node): boolean;
}

const corridors = new WeakMap<Document, Set<ReturnType<typeof createHoverIntent>>>();

/** Shared by portaled hover popups and adjacent Cascader columns. */
export function createHoverIntent(options: HoverIntentOptions) {
  let cleanup: (() => void) | undefined;
  let cancelPending: (() => void) | undefined;
  let pending: (() => void) | undefined;
  let containsPoint: ((event: MouseEvent) => boolean) | undefined;

  function cancel() {
    cancelPending?.();
    cancelPending = undefined;
    cleanup?.();
    cleanup = undefined;
    containsPoint = undefined;
    pending = undefined;
  }

  function enter(event: MouseEvent, open: () => void) {
    cancel();
    const reference = options.getReference();
    const doc = reference?.ownerDocument;
    // React's synthetic mouseenter carries the mouseout event of the previous element.
    if (doc) {
      for (const corridor of corridors.get(doc) ?? []) {
        if (corridor.blocks(event)) {
          const resume = () => {
            cancelPending = undefined;
            open();
          };
          corridor.defer(resume);
          cancelPending = () => corridor.remove(resume);
          return;
        }
      }
    }
    open();
  }

  function leave(event: MouseEvent, close: () => void) {
    cancel();
    const reference = options.getReference();
    const floating = options.getFloating();
    if (!reference || !floating || !floating.isConnected || !floating.getClientRects().length) {
      close();
      return;
    }
    const inside = (target: EventTarget | null) => {
      const node = target as Node | null;
      return (
        !!node &&
        !!(reference.contains(node) || floating.contains(node) || options.contains?.(node))
      );
    };
    if (inside(event.relatedTarget)) return;
    const fromReference = reference.contains(event.target as Node);
    const source = fromReference ? reference : floating;
    const destination = fromReference ? floating : reference;
    const doc = reference.ownerDocument;
    const win = doc.defaultView;
    if (!win) {
      close();
      return;
    }
    const origin = { x: event.clientX, y: event.clientY };
    const sourceRect = source.getBoundingClientRect();
    const rect = destination.getBoundingClientRect();
    const dx = rect.x + rect.width / 2 - (sourceRect.x + sourceRect.width / 2);
    const dy = rect.y + rect.height / 2 - (sourceRect.y + sourceRect.height / 2);
    const side =
      rect.left >= sourceRect.right - 1
        ? 'right'
        : rect.right <= sourceRect.left + 1
          ? 'left'
          : rect.top >= sourceRect.bottom - 1
            ? 'bottom'
            : rect.bottom <= sourceRect.top + 1
              ? 'top'
              : Math.abs(dx) > Math.abs(dy)
                ? dx > 0
                  ? 'right'
                  : 'left'
                : dy > 0
                  ? 'bottom'
                  : 'top';
    if (
      (side === 'right' && origin.x <= sourceRect.left + 1) ||
      (side === 'left' && origin.x >= sourceRect.right - 1) ||
      (side === 'bottom' && origin.y <= sourceRect.top + 1) ||
      (side === 'top' && origin.y >= sourceRect.bottom - 1)
    ) {
      close();
      return;
    }
    // Zag's submenu polygon starts slightly behind the leave point to include its edges.
    const start = {
      x: origin.x + (side === 'right' ? -4 : side === 'left' ? 4 : 0),
      y: origin.y + (side === 'bottom' ? -4 : side === 'top' ? 4 : 0),
    };
    containsPoint = (move) => {
      const bounds = destination.getBoundingClientRect();
      return isPointInPolygon([start, ...getElementPolygon(bounds, side)!], {
        x: move.clientX,
        y: move.clientY,
      });
    };
    if (!containsPoint(event)) {
      containsPoint = undefined;
      close();
      return;
    }
    const active = corridors.get(doc) ?? new Set();
    corridors.set(doc, active);
    active.add(api);
    let timer = 0;
    let previous = origin;
    function finish(landed: boolean) {
      const resume = pending;
      cancel();
      if (!landed) {
        close();
        resume?.();
      }
    }
    const resetTimer = () => {
      win!.clearTimeout(timer);
      timer = win!.setTimeout(() => finish(false), 300);
    };
    const move = (next: MouseEvent) => {
      if (!source.isConnected || !destination.isConnected) return finish(false);
      if (inside(next.target)) return finish(true);
      if (
        (side === 'right' && next.clientX < previous.x - 2) ||
        (side === 'left' && next.clientX > previous.x + 2) ||
        (side === 'bottom' && next.clientY < previous.y - 2) ||
        (side === 'top' && next.clientY > previous.y + 2)
      )
        return finish(false);
      if (!containsPoint?.(next)) return finish(false);
      previous = { x: next.clientX, y: next.clientY };
      resetTimer();
    };
    const interrupt = () => finish(false);
    const pointerDown = (next: MouseEvent) => finish(inside(next.target));
    const keydown = () => finish(true);
    doc.addEventListener('mousemove', move, true);
    doc.addEventListener('pointerdown', pointerDown, true);
    doc.addEventListener('keydown', keydown, true);
    doc.addEventListener('scroll', interrupt, true);
    win.addEventListener('blur', interrupt);
    cleanup = () => {
      win.clearTimeout(timer);
      active.delete(api);
      doc.removeEventListener('mousemove', move, true);
      doc.removeEventListener('pointerdown', pointerDown, true);
      doc.removeEventListener('keydown', keydown, true);
      doc.removeEventListener('scroll', interrupt, true);
      win.removeEventListener('blur', interrupt);
    };
    resetTimer();
  }

  const api = {
    enter,
    leave,
    cancel,
    blocks: (event: MouseEvent) => containsPoint?.(event) ?? false,
    defer: (callback: () => void) => {
      pending = callback;
    },
    remove: (callback: () => void) => {
      if (pending === callback) pending = undefined;
    },
  };
  return api;
}
