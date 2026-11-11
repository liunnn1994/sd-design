export type TreeSwipeDirection = 'none' | 'left' | 'right' | 'up' | 'down';
export interface TreeGestureEvents {
  longPress?(event: PointerEvent): void;
  swipeStart?(event: TouchEvent, direction: TreeSwipeDirection): void;
  swipe?(event: TouchEvent, direction: TreeSwipeDirection): void;
  swipeEnd?(event: TouchEvent, direction: TreeSwipeDirection): void;
}

/** Match Tree's VueUse defaults while keeping listeners and timers framework independent. */
export function createTreeGestures(element: HTMLElement, events: TreeGestureEvents) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let press: { x: number; y: number } | undefined;
  let start = { x: 0, y: 0 };
  let end = start;
  let swiping = false;
  const clear = () => {
    clearTimeout(timer);
    timer = undefined;
    press = undefined;
  };
  const down = (event: PointerEvent) => {
    clear();
    press = { x: event.clientX, y: event.clientY };
    timer = setTimeout(() => events.longPress?.(event), 500);
  };
  const move = (event: PointerEvent) => {
    if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) >= 10) clear();
  };
  const direction = (): TreeSwipeDirection => {
    const x = start.x - end.x,
      y = start.y - end.y;
    if (Math.max(Math.abs(x), Math.abs(y)) < 50) return 'none';
    return Math.abs(x) > Math.abs(y) ? (x > 0 ? 'left' : 'right') : y > 0 ? 'up' : 'down';
  };
  const touchStart = (event: TouchEvent) => {
    if (event.touches.length !== 1) return;
    start = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    end = start;
    events.swipeStart?.(event, 'none');
  };
  const touchMove = (event: TouchEvent) => {
    if (event.touches.length !== 1) return;
    end = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    if (direction() !== 'none') swiping = true;
    if (swiping) events.swipe?.(event, direction());
  };
  const touchEnd = (event: TouchEvent) => {
    if (swiping) events.swipeEnd?.(event, direction());
    swiping = false;
  };
  element.addEventListener('pointerdown', down);
  element.addEventListener('pointermove', move);
  for (const name of ['pointerup', 'pointerleave', 'pointercancel'])
    element.addEventListener(name, clear);
  element.addEventListener('touchstart', touchStart, { passive: true });
  element.addEventListener('touchmove', touchMove, { passive: true });
  element.addEventListener('touchend', touchEnd, { passive: true });
  element.addEventListener('touchcancel', touchEnd, { passive: true });
  return () => {
    clear();
    element.removeEventListener('pointerdown', down);
    element.removeEventListener('pointermove', move);
    for (const name of ['pointerup', 'pointerleave', 'pointercancel'])
      element.removeEventListener(name, clear);
    element.removeEventListener('touchstart', touchStart);
    element.removeEventListener('touchmove', touchMove);
    element.removeEventListener('touchend', touchEnd);
    element.removeEventListener('touchcancel', touchEnd);
  };
}
