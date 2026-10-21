import type {
  VoiceMicrophoneState,
  UseVoiceMicrophoneOptions,
} from '@sdata/web-core/voice-glow/microphone';

import { onMounted, onUnmounted, shallowRef, type Ref } from 'vue';

import { createVoiceMicrophone } from '@sdata/web-core/voice-glow/microphone';
export type {
  VoiceMicrophoneState,
  UseVoiceMicrophoneOptions,
} from '@sdata/web-core/voice-glow/microphone';
export interface UseVoiceMicrophoneResult {
  stream: Ref<MediaStream | null>;
  state: Ref<VoiceMicrophoneState>;
  error: Ref<Error | null>;
  supported: boolean;
  start: () => Promise<MediaStream | null>;
  stop: () => void;
}

/** @zh 管理独立 VoiceGlow 的麦克风流；Sender 自行管理录音，无需使用。 */
export function useVoiceMicrophone(
  options: UseVoiceMicrophoneOptions = {},
): UseVoiceMicrophoneResult {
  const stream = shallowRef<MediaStream | null>(null),
    state = shallowRef<VoiceMicrophoneState>('unsupported'),
    error = shallowRef<Error | null>(null);
  const { supported, start, stop, mount } = createVoiceMicrophone(
    {
      get stream() {
        return stream.value;
      },
      set stream(value) {
        stream.value = value;
      },
      get state() {
        return state.value;
      },
      set state(value) {
        state.value = value;
      },
      get error() {
        return error.value;
      },
      set error(value) {
        error.value = value;
      },
    },
    options,
  );
  onMounted(mount);
  onUnmounted(stop);
  return { stream, state, error, supported, start, stop };
}
