import {
  computed,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';

import type {
  SenderAllowSpeech,
  SenderSpeechDataEvent,
  SenderSpeechEndEvent,
  SenderSpeechEndReason,
  SenderSpeechErrorEvent,
  SenderSpeechStartEvent,
  SenderSpeechTransportCloseEvent,
  SenderSpeechTransportMessageEvent,
  SenderSpeechTransportOpenEvent,
} from './types';

import { useI18n } from '../locale';

const DEFAULT_PROCESSOR_NAME = 'sd-sender-audio-processor';
const DEFAULT_BUFFER_SIZE = 4096;
const resolveBufferSize = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.max(128, Math.floor(value))
    : DEFAULT_BUFFER_SIZE;
const WORKLET_SOURCE = `
class SdSenderAudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.bufferSize = Math.max(128, options.processorOptions?.bufferSize || ${DEFAULT_BUFFER_SIZE});
    this.buffer = new Float32Array(this.bufferSize);
    this.offset = 0;
    this.port.onmessage = (event) => {
      if (event.data?.type !== 'flush') return;
      if (this.offset > 0) {
        const chunk = this.buffer.slice(0, this.offset);
        this.port.postMessage(chunk.buffer, [chunk.buffer]);
        this.offset = 0;
      }
      this.port.postMessage({ type: 'flushed' });
    };
  }

  process(inputs) {
    const channels = inputs[0];
    if (!channels?.length) return true;
    const frames = channels[0].length;
    for (let frame = 0; frame < frames; frame += 1) {
      let sample = 0;
      for (let channel = 0; channel < channels.length; channel += 1) {
        sample += channels[channel][frame] || 0;
      }
      this.buffer[this.offset] = sample / channels.length;
      this.offset += 1;
      if (this.offset === this.bufferSize) {
        const chunk = this.buffer;
        this.port.postMessage(chunk.buffer, [chunk.buffer]);
        this.buffer = new Float32Array(this.bufferSize);
        this.offset = 0;
      }
    }
    return true;
  }
}
registerProcessor('${DEFAULT_PROCESSOR_NAME}', SdSenderAudioProcessor);
`;

interface UseSpeechOptions {
  onStart: (event: SenderSpeechStartEvent) => void;
  onData: (event: SenderSpeechDataEvent) => void;
  onEnd: (event: SenderSpeechEndEvent) => void;
  onError: (event: SenderSpeechErrorEvent) => void;
  onTransportOpen: (event: SenderSpeechTransportOpenEvent) => void;
  onTransportMessage: (event: SenderSpeechTransportMessageEvent) => void;
  onTransportClose: (event: SenderSpeechTransportCloseEvent) => void;
}

const isPermissionDeniedError = (error: unknown) =>
  error instanceof DOMException
    ? error.name === 'NotAllowedError' || error.name === 'SecurityError'
    : error instanceof Error &&
      (error.name === 'NotAllowedError' || error.name === 'SecurityError');

export function useSpeech(
  allowSpeech: MaybeRefOrGetter<SenderAllowSpeech | undefined>,
  options: UseSpeechOptions,
) {
  const { t } = useI18n();
  const config = computed(() => toValue(allowSpeech));
  const controlled = computed(
    () =>
      typeof config.value === 'object' &&
      typeof config.value.recording === 'boolean' &&
      typeof config.value.onRecordingChange === 'function',
  );
  const supported = shallowRef(false);
  const internalRecording = shallowRef(false);
  const requesting = shallowRef(false);
  const captureError = shallowRef<SenderSpeechErrorEvent>();
  const stream = shallowRef<MediaStream>();
  const audioContext = shallowRef<AudioContext>();
  const sourceNode = shallowRef<MediaStreamAudioSourceNode>();
  const workletNode = shallowRef<AudioWorkletNode>();
  const socket = shallowRef<WebSocket>();
  const startedAt = shallowRef(0);
  const chunks = shallowRef(0);
  const sequence = shallowRef(0);
  let generatedWorkletUrl: string | undefined;
  let resolveWorkletFlush: (() => void) | undefined;
  let workletReady = false;
  let disposed = false;

  const recording = computed(() =>
    controlled.value && typeof config.value === 'object'
      ? Boolean(config.value.recording)
      : internalRecording.value,
  );
  const available = computed(
    () =>
      Boolean(config.value) &&
      (controlled.value || supported.value) &&
      !(captureError.value && isPermissionDeniedError(captureError.value.error)),
  );
  const statusText = computed(() => {
    if (requesting.value) return t('sender.speech.requestingPermission');
    if (captureError.value && isPermissionDeniedError(captureError.value.error))
      return t('sender.speech.permissionDenied');
    if (!controlled.value && !supported.value) return t('sender.speech.unsupported');
    if (recording.value) return t('sender.speech.stop');
    if (captureError.value?.error.name === 'NotFoundError') return t('sender.speech.noMicrophone');
    if (captureError.value) return t('sender.speech.microphoneUnavailable');
    return t('sender.speech.start');
  });

  const resolveAudioContext = () => {
    const AudioContextConstructor =
      window.AudioContext ??
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContextConstructor) throw new Error('AudioContext is not supported');
    return new AudioContextConstructor();
  };

  const resolveWorkletUrl = () => {
    if (typeof config.value === 'object' && config.value.workletUrl) {
      return config.value.workletUrl;
    }
    generatedWorkletUrl ??= URL.createObjectURL(
      new Blob([WORKLET_SOURCE], { type: 'text/javascript' }),
    );
    return generatedWorkletUrl;
  };

  const connectTransport = (url: string, protocols?: string | string[]) =>
    new Promise<WebSocket>((resolve, reject) => {
      const nextSocket = protocols ? new WebSocket(url, protocols) : new WebSocket(url);
      let opened = false;
      socket.value = nextSocket;
      nextSocket.binaryType = 'arraybuffer';
      nextSocket.onopen = (event) => {
        opened = true;
        options.onTransportOpen({ event, socket: nextSocket });
        resolve(nextSocket);
      };
      nextSocket.onmessage = (event) => options.onTransportMessage({ event, socket: nextSocket });
      nextSocket.onclose = (event) => options.onTransportClose({ event, socket: nextSocket });
      nextSocket.onerror = () => {
        const errorEvent = {
          error: new Error(`Unable to connect to speech URL: ${url}`),
          phase: 'transport' as const,
        };
        if (opened) options.onError(errorEvent);
        else reject(errorEvent.error);
      };
    });

  const flushWorklet = () =>
    new Promise<void>((resolve) => {
      const port = workletNode.value?.port;
      if (!port) {
        resolve();
        return;
      }
      const timeout = window.setTimeout(resolve, 100);
      resolveWorkletFlush = () => {
        window.clearTimeout(timeout);
        resolveWorkletFlush = undefined;
        resolve();
      };
      port.postMessage({ type: 'flush' });
    });

  // 复用 AudioContext：停止时仅断开节点并挂起，不 close，避免反复 create/close 触发
  // Chrome 渲染进程在第二次录音时卡死（AudioWorklet + 0 输出节点的已知问题）。
  const releaseResources = async () => {
    workletNode.value?.disconnect();
    sourceNode.value?.disconnect();
    stream.value?.getTracks().forEach((track) => track.stop());
    if (audioContext.value?.state === 'running') await audioContext.value.suspend();
    if (
      socket.value &&
      (socket.value.readyState === WebSocket.OPEN ||
        socket.value.readyState === WebSocket.CONNECTING)
    ) {
      socket.value.close(1000, 'speech-ended');
    }
    workletNode.value = undefined;
    sourceNode.value = undefined;
    stream.value = undefined;
    socket.value = undefined;
  };

  // 彻底关闭并丢弃 AudioContext（仅卸载或建图失败时调用）。
  const closeAudioContext = async () => {
    if (audioContext.value && audioContext.value.state !== 'closed') {
      await audioContext.value.close();
    }
    audioContext.value = undefined;
    workletReady = false;
  };

  const stopCapture = async (reason: SenderSpeechEndReason = 'manual') => {
    if (!internalRecording.value) return;
    await flushWorklet();
    const endedAt = performance.now();
    internalRecording.value = false;
    if (
      socket.value?.readyState === WebSocket.OPEN &&
      typeof config.value === 'object' &&
      config.value.sendMetadata !== false
    ) {
      socket.value.send(JSON.stringify({ type: 'end', reason }));
    }
    await releaseResources();
    if (typeof config.value === 'object') config.value.onRecordingChange?.(false);
    options.onEnd({
      source: 'capture',
      reason,
      startedAt: startedAt.value,
      endedAt,
      duration: endedAt - startedAt.value,
      chunks: chunks.value,
    });
  };

  const startCapture = async () => {
    if (requesting.value || internalRecording.value || !available.value) return;
    requesting.value = true;
    captureError.value = undefined;
    let phase: SenderSpeechErrorEvent['phase'] = 'permission';
    try {
      const speechConfig = typeof config.value === 'object' ? config.value : undefined;
      const bufferSize = resolveBufferSize(speechConfig?.bufferSize);
      stream.value = await navigator.mediaDevices.getUserMedia({
        audio: speechConfig?.audioConstraints ?? true,
        video: false,
      });
      if (disposed) {
        await releaseResources();
        return;
      }
      if (speechConfig?.url) {
        phase = 'transport';
        await connectTransport(speechConfig.url, speechConfig.protocols);
        if (disposed) {
          await releaseResources();
          return;
        }
      }
      phase = 'audioContext';
      // 复用 AudioContext：首次创建后跨会话保留，仅 resume/suspend，避免反复 create/close
      // 触发 Chrome 渲染进程在第二次录音时卡死。
      let nextAudioContext = audioContext.value;
      if (!nextAudioContext) {
        nextAudioContext = resolveAudioContext();
        audioContext.value = nextAudioContext;
        workletReady = false;
      }
      if (nextAudioContext.state === 'suspended') {
        await nextAudioContext.resume();
      }
      phase = 'audioWorklet';
      if (!workletReady) {
        await nextAudioContext.audioWorklet.addModule(resolveWorkletUrl());
        workletReady = true;
      }
      if (disposed) {
        await releaseResources();
        return;
      }
      const processorName = speechConfig?.processorName ?? DEFAULT_PROCESSOR_NAME;
      const nextWorkletNode = new AudioWorkletNode(nextAudioContext, processorName, {
        numberOfInputs: 1,
        numberOfOutputs: 0,
        channelCount: 1,
        processorOptions: {
          ...speechConfig?.processorOptions,
          bufferSize,
        },
      });
      workletNode.value = nextWorkletNode;
      sourceNode.value = nextAudioContext.createMediaStreamSource(stream.value);
      nextWorkletNode.port.onmessage = (event: MessageEvent<ArrayBuffer | { type: 'flushed' }>) => {
        if (!(event.data instanceof ArrayBuffer) && 'type' in event.data) {
          if (event.data.type === 'flushed') resolveWorkletFlush?.();
          return;
        }
        if (!internalRecording.value) return;
        const buffer = event.data as ArrayBuffer;
        const dataEvent: SenderSpeechDataEvent = {
          buffer,
          sampleRate: nextAudioContext.sampleRate,
          sequence: sequence.value,
          timestamp: performance.now(),
        };
        sequence.value += 1;
        chunks.value += 1;
        options.onData(dataEvent);
        if (socket.value?.readyState === WebSocket.OPEN) socket.value.send(buffer);
      };
      sourceNode.value.connect(nextWorkletNode);
      startedAt.value = performance.now();
      chunks.value = 0;
      sequence.value = 0;
      internalRecording.value = true;
      if (socket.value?.readyState === WebSocket.OPEN && speechConfig?.sendMetadata !== false) {
        socket.value.send(
          JSON.stringify({
            type: 'start',
            format: 'pcm-f32',
            channels: 1,
            sampleRate: nextAudioContext.sampleRate,
            bufferSize,
          }),
        );
      }
      speechConfig?.onRecordingChange?.(true);
      options.onStart({
        source: 'capture',
        startedAt: startedAt.value,
        stream: stream.value,
        audioContext: nextAudioContext,
        sampleRate: nextAudioContext.sampleRate,
      });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      const errorEvent = { error: normalizedError, phase };
      captureError.value = errorEvent;
      options.onError(errorEvent);
      await releaseResources();
      // 建图失败时丢弃可能已损坏的 AudioContext，下次重建
      await closeAudioContext();
    } finally {
      requesting.value = false;
    }
  };

  const trigger = async (breakRecording = false) => {
    if (breakRecording && !recording.value) return;
    if (controlled.value && typeof config.value === 'object') {
      const nextRecording = !recording.value;
      config.value.onRecordingChange?.(nextRecording);
      const now = performance.now();
      if (nextRecording) {
        startedAt.value = now;
        options.onStart({ source: 'controlled', startedAt: now });
      } else {
        options.onEnd({
          source: 'controlled',
          reason: 'controlled',
          startedAt: startedAt.value,
          endedAt: now,
          duration: now - startedAt.value,
          chunks: 0,
        });
      }
      return;
    }
    if (internalRecording.value) await stopCapture();
    else await startCapture();
  };

  onMounted(() => {
    supported.value = Boolean(
      typeof navigator.mediaDevices?.getUserMedia === 'function' &&
      typeof AudioContext !== 'undefined' &&
      typeof AudioWorkletNode !== 'undefined',
    );
  });

  watch(
    () => Boolean(config.value),
    (enabled) => {
      if (!enabled) void stopCapture();
    },
  );

  watch(controlled, (nextControlled) => {
    if (nextControlled) void stopCapture();
  });

  onBeforeUnmount(async () => {
    disposed = true;
    if (internalRecording.value) await stopCapture('unmount');
    else await releaseResources();
    await closeAudioContext();
    if (generatedWorkletUrl) URL.revokeObjectURL(generatedWorkletUrl);
  });

  return {
    available,
    recording,
    requesting,
    statusText,
    trigger,
  };
}
