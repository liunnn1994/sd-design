export interface SliderDragAdapter {
  getTarget(): EventTarget;
  isDisabled(): boolean;
  setDragging(value: boolean): void;
  onStart(): void;
  onMove(x: number, y: number): void;
  onEnd(): void;
}

export function createSliderDragFoundation(adapter: SliderDragAdapter) {
  const move = (event: Event) => {
    const point = event.type.startsWith('touch')
      ? (event as TouchEvent).touches[0]
      : (event as MouseEvent);
    adapter.onMove(point.clientX, point.clientY);
  };
  const events: [string, EventListener][] = [
    ['mousemove', move],
    ['touchmove', move],
    ['mouseup', end],
    ['contextmenu', end],
    ['touchend', end],
    ['touchcancel', end],
  ];
  function cleanup() {
    adapter.setDragging(false);
    for (const [type, listener] of events)
      adapter.getTarget().removeEventListener(type, listener, false);
  }
  function end() {
    cleanup();
    adapter.onEnd();
  }
  function start(event: Pick<Event, 'preventDefault'>) {
    if (adapter.isDisabled()) return;
    event.preventDefault();
    adapter.setDragging(true);
    for (const [type, listener] of events)
      adapter.getTarget().addEventListener(type, listener, false);
    adapter.onStart();
  }
  return { start, cleanup };
}
