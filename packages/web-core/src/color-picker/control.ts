import { createPointerDrag } from '../_utils/pointer-drag.js';
import { throttleByRaf } from '../_utils/throttle-by-raf.js';

export function getControlPercent(value: number, max: number) {
  if (value < 0) return 0;
  if (value > max) return 1;
  return value / max;
}
export function createColorControl(adapter: {
  readonly block: HTMLDivElement | undefined;
  value(): [number, number];
  onChange(value: [number, number]): void;
  setActive(value: boolean): void;
}) {
  const { value, onChange } = adapter;
  const change = throttleByRaf(onChange);
  function position(event: PointerEvent) {
    if (!adapter.block) return;
    const rect = adapter.block.getBoundingClientRect();
    const next: [number, number] = [
      getControlPercent(event.clientX - rect.x, rect.width),
      getControlPercent(event.clientY - rect.y, rect.height),
    ];
    if (next[0] !== value()[0] || next[1] !== value()[1]) change(next);
  }
  const drag = createPointerDrag(position, () => adapter.setActive(false));
  return {
    down(event: PointerEvent, handle?: HTMLElement) {
      if (!drag.start(event, handle)) return;
      event.preventDefault();
      adapter.setActive(true);
      position(event);
    },
    dispose() {
      drag.stop();
      adapter.setActive(false);
      change.cancel();
    },
  };
}

export function createGradientThumb(adapter: {
  readonly props: {
    disabled?: boolean | undefined;
    onSelect?: (() => void) | undefined;
    onMove?: ((clientX: number) => void) | undefined;
    onRemove?: (() => void) | undefined;
  };
  schedule(callback: () => void): void;
}) {
  let ignoreClick = false;
  return {
    start() {
      adapter.props.onSelect?.();
      ignoreClick = false;
    },
    move(clientX: number) {
      ignoreClick = true;
      adapter.props.onMove?.(clientX);
    },
    end() {
      adapter.schedule(() => {
        ignoreClick = false;
      });
    },
    click(event: MouseEvent) {
      event.stopPropagation();
      if (adapter.props.disabled) return;
      if (!ignoreClick) adapter.props.onSelect?.();
    },
    keydown(event: KeyboardEvent) {
      if (adapter.props.disabled) return;
      if (event.key === 'Delete' || event.key === 'Backspace') adapter.props.onRemove?.();
    },
  };
}
