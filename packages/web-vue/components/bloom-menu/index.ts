import type { App } from 'vue';

import type { SDOptions, SFCWithInstall } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _BloomMenu from './bloom-menu.vue';

export type { BloomMenuItem, BloomMenuOffset } from './types';

const BloomMenu = Object.assign(_BloomMenu, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _BloomMenu.name, _BloomMenu);
  },
}) as SFCWithInstall<typeof _BloomMenu>;

export type BloomMenuInstance = InstanceType<typeof _BloomMenu>;

export default BloomMenu;
