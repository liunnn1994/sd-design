import type { App } from 'vue';

import type { SDOptions } from '../_utils/types';

import { setGlobalConfig, getComponentPrefix } from '../_utils/global-config';
import _VoiceGlow from './voice-glow.vue';

const VoiceGlow = Object.assign(_VoiceGlow, {
  install: (app: App, options?: SDOptions) => {
    setGlobalConfig(app, options);
    app.component(getComponentPrefix(options) + _VoiceGlow.name, _VoiceGlow);
  },
});

export type VoiceGlowInstance = InstanceType<typeof _VoiceGlow>;
export type {
  VoiceGlowProps,
  VoiceGlowType,
  VoiceGlowTheme,
  VoiceGlowColorVariant,
  VoiceGlowLevel,
} from './types';
export { useVoiceMicrophone } from './use-voice-microphone';
export type {
  UseVoiceMicrophoneOptions,
  UseVoiceMicrophoneResult,
  VoiceMicrophoneState,
} from './use-voice-microphone';
export {
  voiceDefaults,
  voiceTypePresets,
  resolveVoiceDefaults,
  resolveVoiceStyle,
} from './presets';
export default VoiceGlow;
