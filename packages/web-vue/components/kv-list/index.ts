import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _KvList from './kv-list.vue';

const KvList = Object.assign(_KvList, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _KvList.name, _KvList);
  },
});

export type KvListInstance = InstanceType<typeof _KvList>;
export type {
  KvListFieldSlotProps,
  KvListItem,
  KvListKeyProps,
  KvListRowActionsSlotProps,
  KvListType,
  KvListValueProps,
} from './types';

export default KvList;
