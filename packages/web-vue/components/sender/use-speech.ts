import { computed, shallowRef, toValue, watch, type MaybeRefOrGetter } from 'vue';

import { usePermission, useSpeechRecognition, useUserMedia } from '@vueuse/core';

import type { SenderAllowSpeech } from './types';

const isPermissionDeniedError = (error: unknown) =>
  error instanceof DOMException
    ? error.name === 'NotAllowedError' || error.name === 'SecurityError'
    : error instanceof Error &&
      (error.name === 'NotAllowedError' || error.name === 'SecurityError');

export function useSpeech(
  allowSpeech: MaybeRefOrGetter<SenderAllowSpeech | undefined>,
  onTranscript: (transcript: string) => void,
) {
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
    if (requesting.value) return '正在请求麦克风权限';
    if (permissionDenied.value) return '麦克风权限已被拒绝，请在浏览器设置中允许';
    if (!controlled.value && !isSpeechSupported.value) return '当前浏览器不支持语音输入';
    if (recording.value) return '停止语音输入';
    if (permissionRequestError.value?.name === 'NotFoundError') return '未检测到可用麦克风';
    if (permissionRequestError.value) return '无法访问麦克风，请检查浏览器设置';

    const recognitionErrorCode =
      recognitionError.value && 'error' in recognitionError.value
        ? recognitionError.value.error
        : undefined;
    if (recognitionErrorCode === 'audio-capture') return '未检测到可用麦克风';
    if (recognitionErrorCode === 'no-speech') return '未检测到语音，请重试';
    if (recognitionError.value) return '语音识别失败，请重试';
    return '开始语音输入';
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
