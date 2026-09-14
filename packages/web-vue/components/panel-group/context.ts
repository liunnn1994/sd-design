// PanelGroup 上下文：主组件向 Panel / PanelSeparator 注入引擎组对象。
import { inject, provide } from 'vue';
import type { InjectionKey } from 'vue';

import type { EngineGroup } from './core/group';

const PanelGroupKey: InjectionKey<EngineGroup> = Symbol('PanelGroupKey');

export const providePanelGroup = (group: EngineGroup) => provide(PanelGroupKey, group);

export const usePanelGroup = () => {
  const group = inject(PanelGroupKey, undefined);
  if (!group) {
    throw new Error('Panel 组件必须位于 PanelGroup 内使用');
  }

  return group;
};

/** PanelGroup 自身用于判断是否嵌套。 */
export const injectParentPanelGroup = () => inject(PanelGroupKey, undefined);
