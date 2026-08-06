import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _InputMask from './input-mask.vue';

const InputMask = Object.assign(_InputMask, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    const componentPrefix = getComponentPrefix(options);
    app.component(componentPrefix + _InputMask.name, _InputMask);
  },
});

export type InputMaskInstance = InstanceType<typeof _InputMask>;
export type {
  InputMaskBeforeChange,
  InputMaskPattern,
  InputMaskPresetDefinition,
  InputMaskPresetName,
  InputMaskProps,
  InputMaskSelection,
  InputMaskState,
  InputMaskToken,
} from './types';
export { defaultInputMaskFormatChars, formatInputMask } from './mask-engine';
export { inputMaskPresets } from './presets';

export default InputMask;
