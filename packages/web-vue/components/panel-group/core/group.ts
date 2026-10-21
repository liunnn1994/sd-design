import { reactive } from 'vue';

import { createEngineGroup as createCoreGroup } from '@sdata/web-core/panel-group/group';

import type { Axes, Orientation } from './axes';

import { AXES } from './axes';
export type { EngineGroup } from '@sdata/web-core/panel-group/group';

export const createEngineGroup = (orientation: Orientation = 'horizontal') =>
  createCoreGroup(orientation, {
    axes: reactive<Axes>({ ...AXES[orientation] }),
    fill: reactive({ anchor: 'flex-start' as const, size: '100%' as number | '100%' }),
  });
