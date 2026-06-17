import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _BorderBeam from './border-beam.vue';

export type {
  BorderBeamSize,
  BorderBeamTheme,
  BorderBeamColorVariant,
  SizeConfig,
  ThemeColors,
} from './types';

const BorderBeam = Object.assign(_BorderBeam, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _BorderBeam.name, _BorderBeam);
  },
});

export type BorderBeamInstance = InstanceType<typeof _BorderBeam>;

export default BorderBeam;
