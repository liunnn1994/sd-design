// 引擎组状态。移植自 vendor/motion-panels 的 core/group.ts，
// fill 状态改用 Vue 响应式承载，供 Vue 层直接绑定。
import { reactive } from 'vue';

import type { Axes, Orientation, Side } from './axes';
import type { PanelController } from './panel';

import { AXES } from './axes';
import { emitter } from './utils';

export interface EngineGroup {
  axes: Axes;
  fill: {
    anchor: 'flex-start' | 'flex-end';
    size: number | '100%';
  };
  notify: () => void;
  panels: Map<Side, PanelController>;
  subscribe: (listener: () => void) => () => void;
}

export const createEngineGroup = (orientation: Orientation = 'horizontal'): EngineGroup => {
  const bus = emitter();
  // 仅 fill 需要响应式（pinned 面板绑定它）；panels 保持原始 Map，
  // 避免 reactive 深度代理导致引擎内部 `panel === controller` 比较失效。
  const group: EngineGroup = {
    axes: AXES[orientation],
    fill: reactive({ anchor: 'flex-start', size: '100%' as number | '100%' }),
    notify: () => bus.emit(),
    panels: new Map(),
    subscribe: bus.subscribe,
  };

  return group;
};
