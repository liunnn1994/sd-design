export function createPointerDrag(move: (event: PointerEvent) => void, end?: () => void) {
  let active: { target: HTMLElement; id: number } | undefined;

  function stop() {
    if (!active) return;
    const { target, id } = active;
    active = undefined;
    target.removeEventListener('pointermove', onMove);
    target.removeEventListener('pointerup', onEnd);
    target.removeEventListener('pointercancel', onEnd);
    target.removeEventListener('lostpointercapture', onEnd);
    target.removeEventListener('contextmenu', onEnd);
    target.ownerDocument?.removeEventListener('lostpointercapture', onDetachedCapture);
    if (target.hasPointerCapture?.(id)) target.releasePointerCapture(id);
  }

  function onMove(event: PointerEvent) {
    if (!active || event.pointerId !== active.id) return;
    // A chorded mouse pointer stays active until its last button is released.
    if (event.pointerType === 'mouse' && (event.buttons & 1) === 0) {
      onEnd(event);
      return;
    }
    move(event);
  }

  function onEnd(event: PointerEvent | MouseEvent) {
    if (
      !active ||
      (event.type !== 'contextmenu' && (event as PointerEvent).pointerId !== active.id)
    )
      return;
    stop();
    end?.();
  }

  function onDetachedCapture(event: PointerEvent) {
    // Removing a capturing handle sends lostpointercapture to its document.
    if (active && !active.target.isConnected && event.target === event.currentTarget) onEnd(event);
  }

  function start(event: PointerEvent, target = event.currentTarget as HTMLElement | null) {
    if (!target || active || event.button !== 0 || event.isPrimary === false) return false;
    try {
      target.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // Script-dispatched events have no active pointer to capture.
      if (!(error instanceof DOMException) || error.name !== 'NotFoundError') throw error;
    }
    active = { target, id: event.pointerId };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onEnd);
    target.addEventListener('pointercancel', onEnd);
    target.addEventListener('lostpointercapture', onEnd);
    target.addEventListener('contextmenu', onEnd);
    target.ownerDocument?.addEventListener('lostpointercapture', onDetachedCapture);
    return true;
  }

  return { start, stop };
}
