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
  let regions: {
    name: 'title' | 'description' | 'footer' | 'progress';
    nodes: ChildNode[];
    display: string;
    active: boolean;
  }[] = [];
  function syncSlots() {
    const current = adapter.popover;
    if (!current?.wrapper.isConnected) return;
    let changed = false;
    for (const region of regions) {
      const active =
        Boolean(adapter.slots[region.name]) &&
        (region.name !== 'progress' || !adapter.slots.footer);
      if (active === region.active) continue;
      region.active = active;
      changed = true;
      const target = current[region.name];
      if (active) {
        // Keep native nodes and their event handlers available when the slot is removed.
        region.nodes.forEach((node) => node.remove());
        target.style.display = region.name === 'footer' ? 'flex' : 'block';
      } else {
        target.append(...region.nodes);
        target.style.display = region.display;
      }
    }
    if (adapter.slots.footer || adapter.slots.progress) current.footer.style.display = 'flex';
    else {
      const footer = regions.find((region) => region.name === 'footer');
      if (footer) current.footer.style.display = footer.display;
    }
    if (changed) scheduleRefresh();
  }
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
    regions = (['title', 'description', 'footer', 'progress'] as const).map((name) => ({
      name,
      nodes: Array.from(current[name].childNodes),
      display: current[name].style.display,
      active: false,
    }));
    adapter.popover = current;
    syncSlots();
    scheduleRefresh();
  }
  return {
    syncSlots,
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
