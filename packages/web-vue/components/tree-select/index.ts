import { App } from 'vue';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import { SDOptions } from '../_utils/types';
import _TreeSelect from './tree-select.vue';

const TreeSelect = Object.assign(_TreeSelect, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _TreeSelect.name, _TreeSelect);
  },
});

export type TreeSelectInstance = InstanceType<typeof _TreeSelect>;

export default TreeSelect;
