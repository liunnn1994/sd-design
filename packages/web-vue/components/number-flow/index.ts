import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import { continuous } from './continuous';
import _NumberFlowGroup from './number-flow-group.vue';
import _NumberFlow from './number-flow.vue';
export { useCanAnimate } from './use-can-animate';

const NumberFlow = Object.assign(_NumberFlow, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _NumberFlow.name, _NumberFlow);
    app.component(componentPrefix + _NumberFlowGroup.name, _NumberFlowGroup);
  },
});

const NumberFlowGroup = _NumberFlowGroup;

export { NumberFlowGroup, continuous };
export type NumberFlowInstance = InstanceType<typeof _NumberFlow>;
export type NumberFlowGroupInstance = InstanceType<typeof _NumberFlowGroup>;
export type {
  NumberFlowDigitContext,
  NumberFlowDigitOptions,
  NumberFlowDigits,
  NumberFlowExposed,
  NumberFlowFormat,
  NumberFlowPlugin,
  NumberFlowPluginContext,
  NumberFlowProps,
  NumberFlowStyle,
  NumberFlowTrend,
  NumberFlowValue,
} from './types';

export default NumberFlow;
