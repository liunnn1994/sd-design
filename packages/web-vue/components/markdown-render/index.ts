import type { App } from 'vue';

import type { SDOptions, SFCWithInstall } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _MarkdownRender from './markdown-render.vue';
const MarkdownRender = Object.assign(_MarkdownRender, {
  install(app: App, options?: SDOptions) {
    setGlobalConfig(app, options);
    app.component(getComponentPrefix(options) + _MarkdownRender.name, _MarkdownRender);
  },
}) as SFCWithInstall<typeof _MarkdownRender>;
export type MarkdownRenderInstance = InstanceType<typeof _MarkdownRender>;
export type {
  MarkdownRenderProps,
  MarkdownRenderEmits,
  MarkdownRenderSlots,
  MarkdownRenderMethods,
} from './types';
export default MarkdownRender;
