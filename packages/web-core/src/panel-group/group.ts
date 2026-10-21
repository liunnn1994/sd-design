import type { Axes, Orientation, Side } from './axes.js';
import type { PanelController } from './panel.js';

import { AXES } from './axes.js';
import { emitter } from './utils.js';

export interface EngineGroup {
  axes: Axes;
  disabled: boolean;
  onMoveStart?: (event: PointerEvent) => void;
  onMoving?: (event: PointerEvent) => void;
  onMoveEnd?: (event: PointerEvent) => void;
  fill: {
    anchor: 'flex-start' | 'flex-end';
    size: number | '100%';
  };
  notify: () => void;
  panels: Map<Side, PanelController>;
  subscribe: (listener: () => void) => () => void;
}

export const createEngineGroup = (
  orientation: Orientation = 'horizontal',
  adapter: {
    axes?: Axes;
    fill?: EngineGroup['fill'];
  } = {},
): EngineGroup => {
  const bus = emitter();
  // Preserve raw controller identity in the panel registry.
  const group: EngineGroup = {
    axes: adapter.axes ?? { ...AXES[orientation] },
    disabled: false,
    fill: adapter.fill ?? { anchor: 'flex-start', size: '100%' },
    notify: () => bus.emit(),
    panels: new Map(),
    subscribe: bus.subscribe,
  };

  return group;
};
