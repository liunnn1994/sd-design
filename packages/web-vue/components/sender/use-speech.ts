import { computed, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue';

import { usePermission, useSpeechRecognition, useUserMedia } from '@vueuse/core';

import type { SenderAllowSpeech } from './types';

import { useI18n } from '../locale';

const isPermissionDeniedError = (error: unknown) =>
  error instanceof DOMException
    ? error.name === 'NotAllowedError' || error.name === 'SecurityError'
    : error instanceof Error &&
      (error.name === 'NotAllowedError' || error.name === 'SecurityError');

export function useSpeech(
  allowSpeech: MaybeRefOrGetter<SenderAllowSpeech | undefined>,
  onTranscript: (transcript: string) => void,
) {
  const { t } = useI18n();
  const config = computed(() => toValue(allowSpeech));
  const controlled = computed(
    () => typeof config.value === 'object' && typeof config.value.recording === 'boolean',
  );
  const forceBreak = shallowRef(false);
  const requesting = shallowRef(false);
  const microphoneAuthorized = shallowRef(false);
  const permissionRequestError = shallowRef<Error>();
  const permissionDeniedByRequest = shallowRef(false);

  const permission = usePermission('microphone');
  const {
    isSupported: isUserMediaSupported,
    start: requestMicrophone,
    stop: stopMicrophone,
  } = useUserMedia({
    constraints: {
      audio: true,
      video: false,
    },
  });
  const {
    isSupported: isSpeechSupported,
    isListening,
    isFinal,
    result,
    error: recognitionError,
    start: startRecognition,
    stop: stopRecognition,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: false,
    lang: () => (typeof navigator === 'undefined' ? 'zh-CN' : navigator.language || 'zh-CN'),
  });

  const permissionDenied = computed(
    () => permission.value === 'denied' || permissionDeniedByRequest.value,
  );
  const recording = computed(() =>
    controlled.value && typeof config.value === 'object'
      ? Boolean(config.value.recording)
      : isListening.value,
  );
  const available = computed(
    () =>
      Boolean(config.value) &&
      (controlled.value || Boolean(isSpeechSupported.value && !permissionDenied.value)),
  );
  const statusText = computed(() => {
    if (requesting.value) return t('sender.speech.requestingPermission');
    if (permissionDenied.value) return t('sender.speech.permissionDenied');
    if (!controlled.value && !isSpeechSupported.value) return t('sender.speech.unsupported');
    if (recording.value) return t('sender.speech.stop');
    if (permissionRequestError.value?.name === 'NotFoundError')
      return t('sender.speech.noMicrophone');
    if (permissionRequestError.value) return t('sender.speech.microphoneUnavailable');

    const recognitionErrorCode =
      recognitionError.value && 'error' in recognitionError.value
        ? recognitionError.value.error
        : undefined;
    if (recognitionErrorCode === 'audio-capture') return t('sender.speech.noMicrophone');
    if (recognitionErrorCode === 'no-speech') return t('sender.speech.noSpeech');
    if (recognitionError.value) return t('sender.speech.recognitionFailed');
    return t('sender.speech.start');
  });

  const ensureMicrophonePermission = async () => {
    if (
      microphoneAuthorized.value ||
      permission.value === 'granted' ||
      !isUserMediaSupported.value
    ) {
      return true;
    }

    requesting.value = true;
    permissionRequestError.value = undefined;
    try {
      await requestMicrophone();
      microphoneAuthorized.value = true;
      permissionDeniedByRequest.value = false;
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      permissionRequestError.value = normalizedError;
      permissionDeniedByRequest.value = isPermissionDeniedError(error);
      return false;
    } finally {
      stopMicrophone();
      requesting.value = false;
    }
  };

  const trigger = async (breakRecording = false) => {
    if (breakRecording && !recording.value) return;
    forceBreak.value = breakRecording;

    if (controlled.value && typeof config.value === 'object') {
      config.value.onRecordingChange(!recording.value);
      return;
    }

    if (recording.value) {
      stopRecognition();
      if (typeof config.value === 'object') config.value.onRecordingChange(false);
      return;
    }
    if (requesting.value || !available.value) return;
    if (!(await ensureMicrophonePermission())) return;

    result.value = '';
    recognitionError.value = undefined;
    startRecognition();
    if (typeof config.value === 'object') config.value.onRecordingChange(true);
  };

  watch(result, (transcript) => {
    if (!transcript || !isFinal.value) return;
    if (!forceBreak.value) onTranscript(transcript);
    forceBreak.value = false;
  });

  watch(recognitionError, (nextError) => {
    if (
      nextError &&
      'error' in nextError &&
      (nextError.error === 'not-allowed' || nextError.error === 'service-not-allowed')
    ) {
      permissionDeniedByRequest.value = true;
    }
  });

  watch(permission, (nextPermission) => {
    if (nextPermission === 'granted') {
      microphoneAuthorized.value = true;
      permissionDeniedByRequest.value = false;
    } else if (nextPermission === 'denied') {
      microphoneAuthorized.value = false;
      if (isListening.value) stopRecognition();
    }
  });

  watch(controlled, (nextControlled) => {
    if (nextControlled && isListening.value) stopRecognition();
  });

  return {
    available,
    recording,
    requesting,
    statusText,
    trigger,
  };
}
