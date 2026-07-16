import { InjectionKey } from 'vue';

import type { ScrollbarProps } from '../scrollbar';

import { TabData, TabTriggerEvent } from './interface';

export interface TabsContext {
  lazyLoad: boolean;
  destroyOnHide: boolean;
  activeKey: string | number;
  addItem: (id: number, data: TabData) => void;
  removeItem: (id: number) => void;
  trigger: TabTriggerEvent;
  scrollbar: ScrollbarProps | false;
}

export const tabsInjectionKey: InjectionKey<TabsContext> = Symbol('SDTabs');
