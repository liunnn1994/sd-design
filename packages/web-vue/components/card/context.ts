import type { createCardFoundation } from '@sdata/web-core/card/foundation';

import type { InjectionKey, Slots } from 'vue';

export interface CardContext extends ReturnType<typeof createCardFoundation> {
  slots: Slots;
}

export const cardInjectionKey: InjectionKey<CardContext> = Symbol('SDCard');
