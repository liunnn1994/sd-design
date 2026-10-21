import type { UnknownRecord } from 'type-fest';

import type { RecorderCoreOptions } from './recorder-engine.js';
export type SenderAllowSpeech = boolean | RecorderCoreOptions | UnknownRecord;
export interface UseRecorderOptions {
  onStop?: (blob: Blob, duration: number, mime: string) => void;
  onError?: (message: string, isUserNotAllow: boolean) => void;
}
export interface SenderRecorderSession {
  open(success: () => void, error: (message: string, denied: boolean) => void): void;
  start(): void;
  close(): void;
  stop(
    success: (blob: Blob, duration: number, mime: string) => void,
    error: (message: string) => void,
    close: boolean,
  ): void;
}
export interface SenderRecorderFactory {
  (options: Record<string, unknown>): SenderRecorderSession;
  Support(): boolean;
}
export interface SenderRecorderState {
  config: SenderAllowSpeech | undefined;
  supported: boolean;
  recording: boolean;
  level: number;
  requesting: boolean;
  stopping: boolean;
  permissionDenied: boolean;
  captureError: string | undefined;
  recorder: SenderRecorderSession | undefined;
  readonly available: boolean;
}
export function createSenderRecorder(
  state: SenderRecorderState,
  Recorder: SenderRecorderFactory,
  options: UseRecorderOptions = {},
) {
  let mounted = false;
  let supportChecked = false;
  let disposed = false;
  const available = () => Boolean(state.config) && state.supported && !state.permissionDenied;
  const statusKey = () => {
    if (state.requesting) return 'sender.speech.requestingPermission';
    if (state.permissionDenied) return 'sender.speech.permissionDenied';
    if (state.captureError) return 'sender.speech.microphoneUnavailable';
    if (!state.supported) return 'sender.speech.unsupported';
    if (state.recording) return 'sender.speech.stop';
    return 'sender.speech.start';
  };
  const close = () => {
    state.recorder?.close();
    state.recorder = undefined;
    state.recording = false;
    state.level = 0;
    state.requesting = false;
    state.stopping = false;
  };

  const stop = () => {
    const current = state.recorder;
    if (!current || !state.recording || state.requesting || state.stopping) return;
    state.stopping = true;
    const finish = () => {
      state.recording = false;
      state.level = 0;
      state.requesting = false;
      state.stopping = false;
      state.recorder = undefined;
    };
    current.stop(
      (blob: Blob, duration: number, mime: string) => {
        if (disposed || state.recorder !== current) return;
        options.onStop?.(blob, duration, mime);
        finish();
      },
      (message: string) => {
        if (disposed || state.recorder !== current) return;
        options.onError?.(message, false);
        finish();
      },
      true,
    );
  };

  const start = () => {
    if (!state.available || state.requesting || state.recording || state.stopping) return;
    state.requesting = true;
    state.permissionDenied = false;
    state.captureError = undefined;
    const recorderOptions: Record<string, unknown> =
      state.config && typeof state.config === 'object'
        ? (state.config as Record<string, unknown>)
        : {};
    const originalOnProcess =
      typeof recorderOptions.onProcess === 'function'
        ? (recorderOptions.onProcess as (...args: unknown[]) => void)
        : undefined;
    const current = Recorder({
      ...recorderOptions,
      onProcess: function (this: unknown, ...args: unknown[]) {
        const power = args[1];
        if (typeof power === 'number') state.level = Math.min(1, Math.max(0, power / 100));
        return originalOnProcess?.apply(this, args);
      },
    });
    state.recorder = current;
    current.open(
      () => {
        // open 进行中若被 close（禁用/卸载）或被新的 start 取代，state.recorder 已不再是 current，
        // 此时视为过期：关闭实例但不切换状态，避免禁用后仍开始录音。
        if (disposed || state.recorder !== current) {
          current.close();
          return;
        }
        current.start();
        state.recording = true;
        state.requesting = false;
      },
      (message: string, isUserNotAllow: boolean) => {
        current.close();
        if (disposed || state.recorder !== current) return;
        state.recorder = undefined;
        state.permissionDenied = isUserNotAllow;
        if (!isUserNotAllow) state.captureError = message;
        state.recording = false;
        state.requesting = false;
        options.onError?.(message, isUserNotAllow);
      },
    );
  };

  const trigger = () => {
    if (state.recording) stop();
    else start();
  };

  const checkSupport = () => {
    if (supportChecked) return;
    supportChecked = true;
    state.supported = Recorder.Support();
  };

  return {
    available,
    statusKey,
    trigger,
    mount() {
      mounted = true;
      if (state.config) checkSupport();
    },
    syncEnabled(enabled: boolean) {
      if (enabled && mounted) checkSupport();
      else if (!enabled) close();
    },
    dispose() {
      disposed = true;
      close();
    },
  };
}
