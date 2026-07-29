<template>
  <div class="sender-speech-demo">
    <sd-sender
      ref="senderRef"
      v-model="value"
      :allow-speech="recorderOptions"
      placeholder="点击语音按钮开始采集音频"
    />
    <div class="sender-speech-demo-status" aria-live="polite">
      <span data-cy="speech-status">状态：{{ status }}</span>
      <span data-cy="speech-cycles">启停次数：{{ cycles }}</span>
      <span>采样率：{{ sampleRate || '-' }} Hz</span>
      <span data-cy="speech-chunks">数据块：{{ chunks }}</span>
      <span>已采集：{{ bytes }} 字节</span>
    </div>
    <p class="sender-speech-demo-tip">
      示例直接使用 recorder-core 的 onProcess 读取单声道 Int16 PCM，实例上的完整 Recorder API
      也可通过 Sender ref 访问。
    </p>
  </div>
</template>

<script setup lang="ts">
  import type { RecorderCoreOptions, SenderRef } from '@sdata/web-vue';

  import { ref, watch } from 'vue';

  const senderRef = ref<SenderRef>();
  const value = ref('');
  const status = ref('等待录音');
  const sampleRate = ref(0);
  const chunks = ref(0);
  const bytes = ref(0);
  const cycles = ref(0);

  const recorderOptions: RecorderCoreOptions = {
    type: 'pcm',
    sampleRate: 16_000,
    bitRate: 16,
    onProcess(
      buffers: Int16Array[],
      _powerLevel: number,
      _bufferDuration: number,
      bufferSampleRate: number,
      newBufferIdx: number,
    ) {
      const nextBuffers = buffers.slice(newBufferIdx);
      sampleRate.value = bufferSampleRate;
      chunks.value += nextBuffers.length;
      bytes.value += nextBuffers.reduce((total, buffer) => total + buffer.byteLength, 0);
    },
  };

  watch(
    () => senderRef.value?.recording,
    (recording, previousRecording) => {
      if (recording) {
        status.value = '正在采集';
        chunks.value = 0;
        bytes.value = 0;
      } else if (previousRecording) {
        cycles.value += 1;
        status.value = '已停止';
      }
    },
  );
</script>

<style scoped>
  .sender-speech-demo {
    display: grid;
    gap: 12px;
  }

  .sender-speech-demo-status {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    color: var(--sd-color-text-2);
    font-size: 13px;
  }

  .sender-speech-demo-tip {
    margin: 0;
    color: var(--sd-color-text-3);
    font-size: 13px;
    line-height: 1.5;
  }
</style>
