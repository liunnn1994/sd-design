import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _SkeletonReveal from './skeleton-reveal.vue';

const SkeletonReveal = Object.assign(_SkeletonReveal, {
  install(app: App, options?: SDOptions) {
    setGlobalConfig(app, options);
    app.component(getComponentPrefix(options) + _SkeletonReveal.name, _SkeletonReveal);
  },
});
export type SkeletonRevealInstance = InstanceType<typeof _SkeletonReveal>;
export type { SkeletonRevealProps, SkeletonRevealExposed } from './types';
export default SkeletonReveal;
