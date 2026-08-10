import { InjectionKey, Slots, VNode } from 'vue';

export interface CardContext {
  hasMeta: boolean;
  hasGrid: boolean;
  slots: Slots;
  renderActions: (vns: VNode[]) => VNode;
}

export const cardInjectionKey: InjectionKey<CardContext> = Symbol('SDCard');
