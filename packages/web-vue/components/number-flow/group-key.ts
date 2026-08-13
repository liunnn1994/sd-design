import type { ComputedRef, InjectionKey } from 'vue';

import type { NumberFlowValue } from './types';

export interface GroupChild {
  value: ComputedRef<NumberFlowValue>;
  prepare: () => number | undefined;
  commit: (version: number) => boolean;
  start: (version: number) => void;
}

export const GROUP_KEY: InjectionKey<{
  register: (child: GroupChild) => () => void;
}> = Symbol('NumberFlowGroup');
