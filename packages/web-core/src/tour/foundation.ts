import { omitBy } from 'es-toolkit';

import type { TourConfig, TourController, TourPopoverDom, TourSlotProps } from './types.js';

export function getTourConfig(props: TourConfig): TourConfig {
  return omitBy(props, (value) => value === undefined);
}

export function getTourSlotProps(
  driver: TourController,
  popover: TourPopoverDom | undefined,
): TourSlotProps | undefined {
  if (!popover) return undefined;
  const step = driver.getActiveStep();
  if (!step) return undefined;
  return {
    driver,
    step,
    index: driver.getActiveIndex(),
    state: driver.getState(),
    element: driver.getActiveElement(),
  };
}

export function createTourPopover(adapter: {
  readonly driver: TourController;
  readonly slots: { title?: unknown; description?: unknown; footer?: unknown; progress?: unknown };
  popover: TourPopoverDom | undefined;
  requestFrame(callback: () => void): number;
  cancelFrame(frame: number): void;
  observe(callback: () => void): () => void;
}) {
  let refreshFrame: number | undefined;
  let disconnect: (() => void) | undefined;
  function scheduleRefresh() {
    if (refreshFrame !== undefined) return;
    const refresh = () => {
      refreshFrame = undefined;
      if (!adapter.popover?.wrapper.isConnected || !adapter.driver.isActive()) return;
      // During a native transition refresh still uses the preceding step's geometry.
      if (adapter.driver.getState().__transitionCallback) {
        refreshFrame = adapter.requestFrame(refresh);
        return;
      }
      adapter.driver.refresh();
    };
    refreshFrame = adapter.requestFrame(refresh);
  }
  function syncPopover() {
    const current = adapter.driver.getState('popover');
    if (!current?.wrapper.isConnected) {
      adapter.popover = undefined;
      return;
    }
    if (current === adapter.popover) return;
    for (const name of ['title', 'description', 'footer', 'progress'] as const) {
      if (!adapter.slots[name] || (name === 'progress' && adapter.slots.footer)) continue;
      current[name].replaceChildren();
      current[name].style.display = name === 'footer' ? 'flex' : 'block';
      if (name === 'progress') current.footer.style.display = 'flex';
    }
    adapter.popover = current;
    scheduleRefresh();
  }
  return {
    scheduleRefresh,
    connect() {
      disconnect = adapter.observe(syncPopover);
    },
    dispose() {
      disconnect?.();
      if (refreshFrame !== undefined) adapter.cancelFrame(refreshFrame);
      adapter.driver.destroy();
    },
  };
}
