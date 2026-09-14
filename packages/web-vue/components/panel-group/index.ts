import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _PanelGroup from './panel-group.vue';
import _PanelSeparator from './panel-separator.vue';
import _Panel from './panel.vue';

const PanelGroup = Object.assign(_PanelGroup, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _PanelGroup.name, _PanelGroup);
  },
});

const Panel = Object.assign(_Panel, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _Panel.name, _Panel);
  },
});

const PanelSeparator = Object.assign(_PanelSeparator, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);

    app.component(componentPrefix + _PanelSeparator.name, _PanelSeparator);
  },
});

export type PanelGroupInstance = InstanceType<typeof _PanelGroup>;
export type PanelInstance = InstanceType<typeof _Panel>;
export type PanelSeparatorInstance = InstanceType<typeof _PanelSeparator>;
export type { PanelFold, PanelPose, PanelSize, PanelSlotProps, PanelTransition } from './types';

export { Panel, PanelSeparator };

export default PanelGroup;
