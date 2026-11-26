import { createPointerDrag } from '../_utils/pointer-drag.js';

export interface SliderDragAdapter {
  isDisabled(): boolean;
  setDragging(value: boolean): void;
  onStart(): void;
  onMove(x: number, y: number): void;
  onEnd(): void;
}

export function createSliderDragFoundation(adapter: SliderDragAdapter) {
  const drag = createPointerDrag(
    (event) => adapter.onMove(event.clientX, event.clientY),
    () => {
      adapter.setDragging(false);
      adapter.onEnd();
    },
  );
  function cleanup() {
    drag.stop();
    adapter.setDragging(false);
  }
  function start(event: PointerEvent, handle?: HTMLElement) {
    if (adapter.isDisabled() || !drag.start(event, handle)) return;
    event.preventDefault();
    adapter.setDragging(true);
    adapter.onStart();
  }
  return { start, cleanup };
}
