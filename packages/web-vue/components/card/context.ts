import type { InjectionKey, Slots } from 'vue';

export interface CardContext {
  hasMeta: boolean;
  hasGrid: boolean;
  slots: Slots;
}

export const cardInjectionKey: InjectionKey<CardContext> = Symbol('SDCard');
