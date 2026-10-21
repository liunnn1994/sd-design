import type { VoiceGlowProps as CoreVoiceGlowProps } from '@sdata/web-core/voice-glow/types';

import type { CSSProperties } from 'vue';
export type * from '@sdata/web-core/voice-glow/types';
// vue-docgen-api cannot follow the generic base; retain its published documented attributes here.
export interface VoiceGlowProps extends CoreVoiceGlowProps<CSSProperties> {
  /**
   * @zh 内层光晕的不透明度（0–1）
   * @en Opacity of the inner glow, 0–1
   */
  innerOpacity?: number;
  /**
   * @zh 外层光晕的不透明度（0–1）
   * @en Opacity of the outer bloom, 0–1
   */
  bloomOpacity?: number;
}
