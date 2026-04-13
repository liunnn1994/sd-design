import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _Link from './link.vue';

const Link = Object.assign(_Link, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Link.name, _Link);
  },
});

export type LinkInstance = InstanceType<typeof _Link>;

export default Link;
