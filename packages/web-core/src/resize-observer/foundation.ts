export interface ResizeObserverAdapter {
  observe(target: Element, listener: (entries: readonly ResizeObserverEntry[]) => void): () => void;
  requestFrame(callback: () => void): number;
  cancelFrame(frame: number): void;
  onResize(entry: ResizeObserverEntry): void;
}

/** Deliver outside native observation so listeners may safely change ancestor geometry. */
export function createResizeObserverFoundation(adapter: ResizeObserverAdapter) {
  let stopObserving: (() => void) | undefined;
  let frame: number | undefined;
  let pending: ResizeObserverEntry | undefined;
  let generation = 0;

  function disconnect() {
    generation++;
    stopObserving?.();
    stopObserving = undefined;
    if (frame !== undefined) adapter.cancelFrame(frame);
    frame = undefined;
    pending = undefined;
  }

  function observe(target: Element | undefined) {
    disconnect();
    if (!target) return;
    const currentGeneration = generation;
    stopObserving = adapter.observe(target, (entries) => {
      if (currentGeneration !== generation || !entries[0]) return;
      pending = entries[0];
      if (frame !== undefined) return;
      frame = adapter.requestFrame(() => {
        if (currentGeneration !== generation) return;
        frame = undefined;
        const entry = pending;
        pending = undefined;
        if (entry) adapter.onResize(entry);
      });
    });
  }
  return { observe, disconnect };
}
