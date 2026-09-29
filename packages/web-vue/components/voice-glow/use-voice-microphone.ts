import { onMounted, onUnmounted, shallowRef, type Ref } from 'vue';

import { getAudioContext, isAudioSupported } from './audio';

export type VoiceMicrophoneState =
  | 'idle'
  | 'requesting'
  | 'live'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface UseVoiceMicrophoneOptions {
  /** @zh 麦克风音频约束 @en Microphone audio constraints */
  constraints?: MediaTrackConstraints;
  /** @zh 挂载后自动请求权限 @en Request permission on mount */
  autoStart?: boolean;
}

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
  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    isAudioSupported();
  const stream = shallowRef<MediaStream | null>(null);
  const state = shallowRef<VoiceMicrophoneState>(supported ? 'idle' : 'unsupported');
  const error = shallowRef<Error | null>(null);
  let requestId = 0;

  const stop = () => {
    requestId += 1;
    stream.value?.getTracks().forEach((track) => track.stop());
    stream.value = null;
    state.value = supported ? 'idle' : 'unsupported';
  };

  const start = async (): Promise<MediaStream | null> => {
    if (!supported) return null;
    if (stream.value) return stream.value;
    const currentRequest = ++requestId;
    getAudioContext();
    state.value = 'requesting';
    error.value = null;
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          ...options.constraints,
        },
      });
      if (currentRequest !== requestId) {
        next.getTracks().forEach((track) => track.stop());
        return null;
      }
      stream.value = next;
      state.value = 'live';
      next.getAudioTracks().forEach((track) =>
        track.addEventListener('ended', () => {
          if (stream.value !== next) return;
          stream.value = null;
          state.value = 'idle';
        }),
      );
      return next;
    } catch (reason) {
      if (currentRequest !== requestId) return null;
      const nextError = reason instanceof Error ? reason : new Error(String(reason));
      error.value = nextError;
      state.value =
        nextError.name === 'NotAllowedError' || nextError.name === 'SecurityError'
          ? 'denied'
          : 'error';
      return null;
    }
  };

  onMounted(() => {
    if (options.autoStart) void start();
  });
  onUnmounted(stop);

  return { stream, state, error, supported, start, stop };
}
