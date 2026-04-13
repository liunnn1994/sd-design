import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _Mention from './mention';

const Mention = Object.assign(_Mention, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Mention.name, _Mention);
  },
});

export type MentionInstance = InstanceType<typeof _Mention>;

export default Mention;
