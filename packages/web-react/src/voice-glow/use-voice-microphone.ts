import type {
  UseVoiceMicrophoneOptions,
  VoiceMicrophoneData,
} from '@sdata/web-core/voice-glow/microphone';

import { createVoiceMicrophone } from '@sdata/web-core/voice-glow/microphone';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
export type {
  UseVoiceMicrophoneOptions,
  VoiceMicrophoneState,
} from '@sdata/web-core/voice-glow/microphone';
export interface UseVoiceMicrophoneResult extends VoiceMicrophoneData {
  supported: boolean;
  start(): Promise<MediaStream | null>;
  stop(): void;
}
export function useVoiceMicrophone(
  options: UseVoiceMicrophoneOptions = {},
): UseVoiceMicrophoneResult {
  const latest = useRef(options);
  latest.current = options;
  const [data, setData] = useState<VoiceMicrophoneData>({
    stream: null,
    state: 'unsupported',
    error: null,
  });
  const [supported, setSupported] = useState(false);
  const controller = useRef<ReturnType<typeof createVoiceMicrophone> | null>(null);
  useLayoutEffect(() => {
    let connected = true;
    const state: VoiceMicrophoneData = { stream: null, state: 'unsupported', error: null };
    const publish = () => {
      if (connected) setData({ ...state });
    };
    const current = createVoiceMicrophone(
      {
        get stream() {
          return state.stream;
        },
        set stream(value) {
          state.stream = value;
          publish();
        },
        get state() {
          return state.state;
        },
        set state(value) {
          state.state = value;
          publish();
        },
        get error() {
          return state.error;
        },
        set error(value) {
          state.error = value;
          publish();
        },
      },
      {
        get constraints() {
          return latest.current.constraints;
        },
        get autoStart() {
          return latest.current.autoStart;
        },
      },
    );
    controller.current = current;
    setSupported(current.supported);
    // StrictMode may discard the first connection before an automatic permission request.
    queueMicrotask(() => {
      if (connected) current.mount();
    });
    return () => {
      connected = false;
      current.stop();
      controller.current = null;
    };
  }, []);
  const start = useCallback(() => controller.current?.start() ?? Promise.resolve(null), []);
  const stop = useCallback(() => controller.current?.stop(), []);
  return { ...data, supported, start, stop };
}
