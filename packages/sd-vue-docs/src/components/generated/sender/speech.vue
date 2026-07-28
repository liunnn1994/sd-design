<template>
  <div class="sender-speech-demo">
    <sd-sender
      v-model="value"
      :allow-speech="{ bufferSize: 2048 }"
      placeholder="点击语音按钮开始采集音频"
      @speech-start="handleStart"
      @speech-data="handleData"
      @speech-end="handleEnd"
      @speech-error="handleError"
    />
    <div class="sender-speech-demo-status" aria-live="polite">
      <span>状态：{{ status }}</span>
      <span>采样率：{{ sampleRate || '-' }} Hz</span>
      <span>数据块：{{ chunks }}</span>
      <span>已采集：{{ bytes }} 字节</span>
    </div>
    <p class="sender-speech-demo-tip">
      示例只展示 AudioWorklet 采集事件，不会调用浏览器语音识别，也不会自动修改输入内容。
    </p>
  </div>
</template>

<script setup lang="ts">
  import type {
    SenderSpeechDataEvent,
    SenderSpeechEndEvent,
    SenderSpeechErrorEvent,
    SenderSpeechStartEvent,
  } from '@sdata/web-vue';

  import { ref } from 'vue';

  const value = ref('');
  const status = ref('等待录音');
  const sampleRate = ref(0);
  const chunks = ref(0);
  const bytes = ref(0);

  const handleStart = (event: SenderSpeechStartEvent) => {
    status.value = '正在采集';
    sampleRate.value = event.sampleRate ?? 0;
    chunks.value = 0;
    bytes.value = 0;
  };

  const handleData = (event: SenderSpeechDataEvent) => {
    chunks.value += 1;
    bytes.value += event.buffer.byteLength;
  };

  const handleEnd = (event: SenderSpeechEndEvent) => {
    status.value = `已结束（${event.reason}）`;
  };

  const handleError = (event: SenderSpeechErrorEvent) => {
    status.value = `采集失败：${event.error.message}`;
  };
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
