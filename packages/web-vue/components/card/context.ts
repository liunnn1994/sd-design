import type { InjectionKey, Slots } from 'vue';

export interface CardContext {
  metaCount: number;
  gridCount: number;
  hasMeta: boolean;
  hasGrid: boolean;
  slots: Slots;
}

export const cardInjectionKey: InjectionKey<CardContext> = Symbol('SDCard');
