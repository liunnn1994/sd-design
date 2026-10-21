import type { NumberFlowGroupChild } from '@sdata/web-core/number-flow/group';

import type { ComputedRef, InjectionKey } from 'vue';

import type { NumberFlowValue } from './types';

export interface GroupChild extends NumberFlowGroupChild {
  value: ComputedRef<NumberFlowValue>;
}

export const GROUP_KEY: InjectionKey<{
  register: (child: GroupChild) => () => void;
}> = Symbol('NumberFlowGroup');
