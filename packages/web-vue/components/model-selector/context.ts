import type { ComputedRef, InjectionKey, Ref } from 'vue';

import type { ModelSelectorItemData } from './types';

export interface ModelSelectorContext {
  activeDescendant: ComputedRef<string | undefined>;
  activeId: Ref<symbol | undefined>;
  getVisibleItems: (groupId?: symbol) => ModelSelectorItemData[];
  itemsVersion: Ref<number>;
  listId: string;
  moveActive: (offset: number) => void;
  query: Ref<string>;
  registerItem: (item: ModelSelectorItemData) => void;
  selectActive: (event: Event) => void;
  selectItem: (item: ModelSelectorItemData, event: Event) => void;
  setActive: (id?: symbol) => void;
  setVisible: (visible: boolean) => void;
  unregisterItem: (id: symbol) => void;
  updateItem: (item: ModelSelectorItemData) => void;
  visible: ComputedRef<boolean>;
  visibleItemCount: ComputedRef<number>;
}

export interface ModelSelectorGroupContext {
  id: symbol;
}

export const modelSelectorInjectionKey: InjectionKey<ModelSelectorContext> =
  Symbol('model-selector');
export const modelSelectorGroupInjectionKey: InjectionKey<ModelSelectorGroupContext> =
  Symbol('model-selector-group');
