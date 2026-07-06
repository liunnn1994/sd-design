import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _Toolbar from './toolbar.vue';

const Toolbar = Object.assign(_Toolbar, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Toolbar.name, _Toolbar);
  },
});

export type ToolbarInstance = InstanceType<typeof _Toolbar>;
export type {
  ToolbarEmits,
  ToolbarModelValue,
  ToolbarProps,
  ToolbarResetEventHandler,
  ToolbarSearchEventHandler,
} from './types';

export default Toolbar;
