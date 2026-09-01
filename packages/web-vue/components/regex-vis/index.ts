import type { App } from 'vue';

import type { SDOptions, SFCWithInstall } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _RegexVis from './regex-vis.vue';

const RegexVis = Object.assign(_RegexVis, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _RegexVis.name, _RegexVis);
  },
}) as SFCWithInstall<typeof _RegexVis>;

export type RegexVisInstance = InstanceType<typeof _RegexVis>;
export type {
  RegexVisError,
  RegexVisFlag,
  RegexVisNode,
  RegexVisProps,
  RegexVisSelectInfo,
  RegexVisSlots,
} from './types';

export default RegexVis;
