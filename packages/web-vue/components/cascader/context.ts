import { InjectionKey, Slots } from 'vue';

import { CascaderOption, CascaderOptionInfo, CascaderSingleValue } from './interface';

export interface CascaderContext {
  onClickOption: (option: CascaderOptionInfo, checked?: boolean) => void;
  setActiveKey: (key?: string) => void;
  setSelectedPath: (key?: string) => void;
  loadOption: (option: CascaderOptionInfo) => void;
  isLoading: (option: CascaderOptionInfo) => boolean;
  formatLabel?: (options: CascaderOption[]) => string;
  separator?: string;
  slots: Slots;
  valueMap: Map<string, CascaderSingleValue>;
  expandTrigger: 'click' | 'hover';
  ellipsis: boolean | 'performant-ellipsis';
}

export const cascaderInjectionKey: InjectionKey<CascaderContext> = Symbol('SDCascader');
