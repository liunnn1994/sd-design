import type { PanelOptions } from '@sdata/web-core/panel-group/panel';

import { createPanel as createCorePanel } from '@sdata/web-core/panel-group/panel';

import type { EngineGroup } from './group';

import { MotionValue } from './motion';
export type * from '@sdata/web-core/panel-group/panel';

export const createPanel = (group: EngineGroup, initial: PanelOptions) =>
  createCorePanel(group, initial, {
    createMotionValue: (value) => new MotionValue(value),
    dev: import.meta.env.DEV,
  });
