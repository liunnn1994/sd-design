import { getAudioContext, isAudioSupported } from './audio.js';
export type VoiceMicrophoneState =
  | 'idle'
  | 'requesting'
  | 'live'
  | 'denied'
  | 'unsupported'
  | 'error';

export interface UseVoiceMicrophoneOptions {
  /**
   * @zh 麦克风音频约束
   * @en Microphone audio constraints
   */
  constraints?: MediaTrackConstraints;
  /**
   * @zh 挂载后自动请求权限
   * @en Request permission on mount
   */
  autoStart?: boolean;
}

export interface VoiceMicrophoneData {
  stream: MediaStream | null;
  state: VoiceMicrophoneState;
  error: Error | null;
}
export function createVoiceMicrophone(
  data: VoiceMicrophoneData,
  options: UseVoiceMicrophoneOptions = {},
) {
  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    isAudioSupported();
  data.state = supported ? 'idle' : 'unsupported';
  let requestId = 0;
  const stop = () => {
    requestId += 1;
    data.stream?.getTracks().forEach((track) => track.stop());
    data.stream = null;
    data.state = supported ? 'idle' : 'unsupported';
  };
  const start = async (): Promise<MediaStream | null> => {
    if (!supported) return null;
    if (data.stream) return data.stream;
    const currentRequest = ++requestId;
    data.state = 'requesting';
    data.error = null;
    try {
      getAudioContext();
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
      data.stream = next;
      data.state = 'live';
      next.getAudioTracks().forEach((track) =>
        track.addEventListener('ended', () => {
          if (data.stream !== next) return;
          data.stream = null;
          data.state = 'idle';
        }),
      );
      return next;
    } catch (reason) {
      if (currentRequest !== requestId) return null;
      const nextError = reason instanceof Error ? reason : new Error(String(reason));
      data.error = nextError;
      data.state =
        nextError.name === 'NotAllowedError' || nextError.name === 'SecurityError'
          ? 'denied'
          : 'error';
      return null;
    }
  };
  function mount() {
    if (options.autoStart) void start();
  }
  return { supported, start, stop, mount };
}
