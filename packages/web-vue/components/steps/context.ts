import type { StepsState } from '@sdata/web-core/steps/foundation';

import type { InjectionKey } from 'vue';

import type { StepData } from './interface';
export interface StepsContext extends StepsState {
  addItem: (step: number, data: StepData) => void;
  removeItem: (step: number) => void;
  parentCls: string;
}
export const stepsInjectionKey: InjectionKey<StepsContext> = Symbol('SDSteps');
