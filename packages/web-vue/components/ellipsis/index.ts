import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';
import type { EllipsisTooltipProps } from './interface';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _Ellipsis from './ellipsis.vue';
import _PerformantEllipsis from './performant-ellipsis.vue';

export type { EllipsisTooltipProps };

const Ellipsis = Object.assign(_Ellipsis, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Ellipsis.name, _Ellipsis);
  },
});

export const PerformantEllipsis = Object.assign(_PerformantEllipsis, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _PerformantEllipsis.name, _PerformantEllipsis);
  },
});

export type EllipsisInstance = InstanceType<typeof _Ellipsis>;
export type PerformantEllipsisInstance = InstanceType<typeof _PerformantEllipsis>;

export default Ellipsis;
