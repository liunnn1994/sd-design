import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { getComponentPrefix, setGlobalConfig } from '../_utils/global-config';
import _LiquidGlassLogo from './liquid-glass-logo.vue';

const LiquidGlassLogo = Object.assign(_LiquidGlassLogo, {
  install(app: App, options?: SDOptions) {
    setGlobalConfig(app, options);
    app.component(getComponentPrefix(options) + _LiquidGlassLogo.name, _LiquidGlassLogo);
  },
});
export type LiquidGlassLogoInstance = InstanceType<typeof _LiquidGlassLogo>;
export type { LiquidGlassLogoProps, LiquidGlassLogoExposed } from './types';
export type { LiquidGlassLogoTuning } from '@sdata/web-core/liquid-glass-logo/types';
export {
  liquidGlassLogoDefaults,
  liquidGlassLogoDuration,
  liquidGlassLogoThemes,
  liquidGlassLogoNoteLogo,
  liquidGlassLogoReferenceMark,
} from '@sdata/web-core/liquid-glass-logo/foundation';
export default LiquidGlassLogo;
