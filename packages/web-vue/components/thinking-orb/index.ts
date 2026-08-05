import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _ThinkingOrb from './thinking-orb.vue';

const ThinkingOrb = Object.assign(_ThinkingOrb, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _ThinkingOrb.name, _ThinkingOrb);
  },
});

export type ThinkingOrbInstance = InstanceType<typeof _ThinkingOrb>;
export type {
  ThinkingOrbProps,
  ThinkingOrbSize,
  ThinkingOrbState,
  ThinkingOrbTheme,
} from './types';

export default ThinkingOrb;
