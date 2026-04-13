import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _Scrollbar from './scrollbar.vue';

const Scrollbar = Object.assign(_Scrollbar, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Scrollbar.name, _Scrollbar);
  },
});

export type ScrollbarInstance = InstanceType<typeof _Scrollbar>;
export type { ScrollbarProps } from './interface';

export default Scrollbar;
