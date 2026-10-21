import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import { createSenderRecorder, type UseRecorderOptions } from '@sdata/web-core/sender/recorder';

import type { SenderAllowSpeech } from './types';

import { useI18n } from '../locale';
import Recorder from './recorder-core';

export type { UseRecorderOptions } from '@sdata/web-core/sender/recorder';

export function useRecorder(
  allowSpeech: MaybeRefOrGetter<SenderAllowSpeech | undefined>,
  options: UseRecorderOptions = {},
) {
  const { t } = useI18n();
  const config = computed(() => toValue(allowSpeech));
  const supported = shallowRef(false);
  const recording = shallowRef(false);
  const level = shallowRef(0);
  const requesting = shallowRef(false);
  const stopping = shallowRef(false);
  const permissionDenied = shallowRef(false);
  const captureError = shallowRef<string>();
  const recorder = shallowRef<ReturnType<typeof Recorder>>();
  const controller = createSenderRecorder(
    {
      get config() {
        return config.value;
      },
      get available(): boolean {
        return available.value;
      },
      get supported() {
        return supported.value;
      },
      set supported(value) {
        supported.value = value;
      },
      get recording() {
        return recording.value;
      },
      set recording(value) {
        recording.value = value;
      },
      get level() {
        return level.value;
      },
      set level(value) {
        level.value = value;
      },
      get requesting() {
        return requesting.value;
      },
      set requesting(value) {
        requesting.value = value;
      },
      get stopping() {
        return stopping.value;
      },
      set stopping(value) {
        stopping.value = value;
      },
      get permissionDenied() {
        return permissionDenied.value;
      },
      set permissionDenied(value) {
        permissionDenied.value = value;
      },
      get captureError() {
        return captureError.value;
      },
      set captureError(value) {
        captureError.value = value;
      },
      get recorder() {
        return recorder.value;
      },
      set recorder(value) {
        recorder.value = value;
      },
    },
    Recorder,
    options,
  );
  const available = computed(controller.available);
  const statusText = computed(() => t(controller.statusKey()));
  onMounted(controller.mount);
  watch(() => Boolean(config.value), controller.syncEnabled);
  onBeforeUnmount(controller.dispose);
  return {
    Recorder,
    available,
    recorder,
    recording,
    level,
    requesting,
    stopping,
    statusText,
    trigger: controller.trigger,
  };
}
