import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import type { SenderAllowSpeech } from './types';

import { useI18n } from '../locale';
import Recorder from './recorder-core';

export interface UseRecorderOptions {
  onStop?: (blob: Blob, duration: number, mime: string) => void;
  onError?: (message: string, isUserNotAllow: boolean) => void;
}

export function useRecorder(
  allowSpeech: MaybeRefOrGetter<SenderAllowSpeech | undefined>,
  options: UseRecorderOptions = {},
) {
  const { t } = useI18n();
  const config = computed(() => toValue(allowSpeech));
  const supported = shallowRef(false);
  const recording = shallowRef(false);
  const requesting = shallowRef(false);
  const stopping = shallowRef(false);
  const permissionDenied = shallowRef(false);
  const captureError = shallowRef<string>();
  const recorder = shallowRef<ReturnType<typeof Recorder>>();
  let mounted = false;
  let supportChecked = false;
  let disposed = false;

  const available = computed(
    () => Boolean(config.value) && supported.value && !permissionDenied.value,
  );
  const statusText = computed(() => {
    if (requesting.value) return t('sender.speech.requestingPermission');
    if (permissionDenied.value) return t('sender.speech.permissionDenied');
    if (captureError.value) return t('sender.speech.microphoneUnavailable');
    if (!supported.value) return t('sender.speech.unsupported');
    if (recording.value) return t('sender.speech.stop');
    return t('sender.speech.start');
  });

  const close = () => {
    recorder.value?.close();
    recorder.value = undefined;
    recording.value = false;
    requesting.value = false;
    stopping.value = false;
  };

  const stop = () => {
    const current = recorder.value;
    if (!current || !recording.value || requesting.value || stopping.value) return;
    stopping.value = true;
    const finish = () => {
      recording.value = false;
      requesting.value = false;
      stopping.value = false;
      recorder.value = undefined;
    };
    current.stop(
      (blob: Blob, duration: number, mime: string) => {
        if (disposed) return;
        options.onStop?.(blob, duration, mime);
        finish();
      },
      (message: string) => {
        if (disposed) return;
        options.onError?.(message, false);
        finish();
      },
      true,
    );
  };

  const start = () => {
    if (!available.value || requesting.value || recording.value || stopping.value) return;
    requesting.value = true;
    permissionDenied.value = false;
    captureError.value = undefined;
    const recorderOptions = typeof config.value === 'object' ? config.value : {};
    const current = Recorder(recorderOptions);
    recorder.value = current;
    current.open(
      () => {
        // open 进行中若被 close（禁用/卸载）或被新的 start 取代，recorder.value 已不再是 current，
        // 此时视为过期：关闭实例但不切换状态，避免禁用后仍开始录音。
        if (disposed || recorder.value !== current) {
          current.close();
          return;
        }
        current.start();
        recording.value = true;
        requesting.value = false;
      },
      (message: string, isUserNotAllow: boolean) => {
        current.close();
        if (disposed || recorder.value !== current) return;
        recorder.value = undefined;
        permissionDenied.value = isUserNotAllow;
        if (!isUserNotAllow) captureError.value = message;
        recording.value = false;
        requesting.value = false;
        options.onError?.(message, isUserNotAllow);
      },
    );
  };

  const trigger = () => {
    if (recording.value) stop();
    else start();
  };

  const checkSupport = () => {
    if (supportChecked) return;
    supportChecked = true;
    supported.value = Recorder.Support();
  };

  onMounted(() => {
    mounted = true;
    if (config.value) checkSupport();
  });

  watch(
    () => Boolean(config.value),
    (enabled) => {
      if (enabled && mounted) checkSupport();
      else if (!enabled) close();
    },
  );

  onBeforeUnmount(() => {
    disposed = true;
    close();
  });

  return {
    Recorder,
    available,
    recorder,
    recording,
    requesting,
    stopping,
    statusText,
    trigger,
  };
}
