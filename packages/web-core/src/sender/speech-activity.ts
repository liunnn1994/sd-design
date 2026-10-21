export const DEFAULT_SENDER_SPEECH_THRESHOLD = 0.04;

export interface SenderSpeechActivityState {
  recording: boolean;
  level: number;
  active: boolean;
  options: {
    active?: boolean;
    threshold?: number;
    processing?: boolean;
    level?: unknown;
    stream?: unknown;
  };
}

export function createSenderSpeechActivity(state: SenderSpeechActivityState) {
  let silenceTimer: ReturnType<typeof setTimeout> | undefined;
  return {
    speaking: () =>
      state.recording && state.level > (state.options.threshold ?? DEFAULT_SENDER_SPEECH_THRESHOLD),
    glowActive: () =>
      state.options.active ??
      (Boolean(state.options.processing) ||
        state.options.level !== undefined ||
        state.options.stream != null ||
        state.active),
    update(detected: boolean, isRecording: boolean) {
      clearTimeout(silenceTimer);
      if (!isRecording) state.active = false;
      else if (detected) state.active = true;
      else if (state.active) {
        silenceTimer = setTimeout(() => {
          state.active = false;
        }, 350);
      }
    },
    dispose() {
      clearTimeout(silenceTimer);
    },
  };
}
