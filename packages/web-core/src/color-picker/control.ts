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
  function position(event: MouseEvent) {
    if (!adapter.block) return;
    const rect = adapter.block.getBoundingClientRect();
    const next: [number, number] = [
      getControlPercent(event.clientX - rect.x, rect.width),
      getControlPercent(event.clientY - rect.y, rect.height),
    ];
    if (next[0] !== value()[0] || next[1] !== value()[1]) change(next);
  }
  function stop() {
    adapter.setActive(false);
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', stop);
    window.removeEventListener('contextmenu', stop);
  }
  function move(event: MouseEvent) {
    event.preventDefault();
    if (event.buttons > 0) position(event);
    else stop();
  }
  return {
    down(event: MouseEvent) {
      event.preventDefault();
      adapter.setActive(true);
      position(event);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', stop);
      window.addEventListener('contextmenu', stop);
    },
    dispose() {
      stop();
      change.cancel();
    },
  };
}

export function createGradientThumb(adapter: {
  readonly props: {
    disabled?: boolean;
    onSelect?: () => void;
    onMove?: (clientX: number) => void;
    onRemove?: () => void;
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
