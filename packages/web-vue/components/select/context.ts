import type { InjectionKey } from 'vue';

import type { FilterOption } from './interface';

export interface SelectContext {
  multiple?: boolean | undefined;
  valueKey?: string | undefined;
  inputValue?: string | undefined;
  filterOption?: FilterOption | undefined;
  component?: string | undefined;
  valueKeys: string[];
  activeKey: string | undefined;
  onSelect: (key: string, ev: Event) => void;
  setActiveKey: (key?: string) => void;
}

export const selectInjectionKey: InjectionKey<SelectContext> = Symbol('SDSelectContext');
