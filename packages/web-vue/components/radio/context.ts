import type { RadioType } from '@sdata/web-core/radio/types';

import type { InjectionKey, Slots } from 'vue';

import type { Size } from '../_utils/constant';
export { RADIO_TYPES } from '@sdata/web-core/radio/types';
export type { RadioType } from '@sdata/web-core/radio/types';

export interface RadioGroupContext {
  name: 'SDRadioGroup';
  /** 共享的 HTML name，用于原生 radio 的方向键分组导航 */
  inputName?: string;
  value: string | number | boolean;
  size: Size;
  type: RadioType;
  disabled: boolean;
  changeCount: number;
  slots: Slots;
  handleChange: (value: string | number | boolean, e: Event) => void;
}

export const radioGroupKey: InjectionKey<RadioGroupContext> = Symbol('RadioGroup');
