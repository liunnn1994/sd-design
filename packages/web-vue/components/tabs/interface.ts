import type { TabData as CoreTabData } from '@sdata/web-core/tabs/types';

import type { Slots } from 'vue';
export type {
  TabsPosition,
  TabsType,
  TabTriggerEvent,
  ScrollPosition,
} from '@sdata/web-core/tabs/types';
export interface TabData extends CoreTabData<Slots> {}
