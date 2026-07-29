<template>
  <div class="sender-speech-demo">
    <sd-sender
      ref="senderRef"
      v-model="value"
      :allow-speech="{ bufferSize: 2048 }"
      :readonly="finalizing ? '正在等待模拟后端返回最终识别结果' : false"
      :slot-config="slotConfig"
      placeholder="点击语音按钮开始采集音频"
      @speech-start="handleStart"
      @speech-data="handleData"
      @speech-end="handleEnd"
      @speech-error="handleError"
    />
    <div class="sender-speech-demo-status" aria-live="polite">
      <span data-cy="speech-status">状态：{{ status }}</span>
      <span data-cy="speech-cycles">启停次数：{{ cycles }}</span>
      <span data-cy="speech-context">AudioContext：{{ audioContextId || '-' }}</span>
      <span>采样率：{{ sampleRate || '-' }} Hz</span>
      <span data-cy="speech-chunks">数据块：{{ chunks }}</span>
      <span>已采集：{{ bytes }} 字节</span>
    </div>
    <div class="sender-speech-demo-debug" aria-label="模拟语音后端返回">
      <strong>后端返回模拟</strong>
      <sd-button size="small" :disabled="!finalizing" @click="simulatePartial">
        模拟中间结果
      </sd-button>
      <sd-button size="small" :disabled="!finalizing" @click="simulateCompleted">
        模拟完成
      </sd-button>
      <sd-button size="small" status="danger" :disabled="!finalizing" @click="simulateError">
        模拟错误
      </sd-button>
    </div>
    <p class="sender-speech-demo-tip">
      此示例使用词槽模式下的
      RichTextEditor。停止采集后会进入只读收尾状态，请通过右下角按钮模拟后端返回，
      用于排查连续启停、编辑器只读切换与 AudioWorklet 生命周期问题。
    </p>
  </div>
</template>

<script setup lang="ts">
  import type {
    SenderRef,
    SenderSlotConfig,
    SenderSpeechDataEvent,
    SenderSpeechEndEvent,
    SenderSpeechErrorEvent,
    SenderSpeechStartEvent,
  } from '@sdata/web-vue';

  import { ref, useTemplateRef } from 'vue';

  const value = ref('');
  const senderRef = useTemplateRef<SenderRef>('senderRef');
  const slotConfig: SenderSlotConfig[] = [];
  const status = ref('等待录音');
  const finalizing = ref(false);
  const sampleRate = ref(0);
  const chunks = ref(0);
  const bytes = ref(0);
  const cycles = ref(0);
  const audioContextId = ref(0);
  const audioContextIds = new WeakMap<AudioContext, number>();
  let nextAudioContextId = 1;

  const handleStart = (event: SenderSpeechStartEvent) => {
    status.value = '正在采集';
    finalizing.value = false;
    sampleRate.value = event.sampleRate ?? 0;
    chunks.value = 0;
    bytes.value = 0;
    if (event.audioContext) {
      if (!audioContextIds.has(event.audioContext)) {
        audioContextIds.set(event.audioContext, nextAudioContextId);
        nextAudioContextId += 1;
      }
      audioContextId.value = audioContextIds.get(event.audioContext) ?? 0;
    }
  };

  const handleData = (event: SenderSpeechDataEvent) => {
    chunks.value += 1;
    bytes.value += event.buffer.byteLength;
  };

  const handleEnd = (event: SenderSpeechEndEvent) => {
    cycles.value += 1;
    finalizing.value = true;
    status.value = `等待后端完成（${event.reason}）`;
  };

  const handleError = (event: SenderSpeechErrorEvent) => {
    finalizing.value = false;
    status.value = `采集失败：${event.error.message}`;
  };

  const simulatePartial = () => {
    senderRef.value?.insert('语音片段', 'end');
    status.value = '已收到中间结果';
  };

  const simulateCompleted = () => {
    senderRef.value?.insert('最终结果', 'end');
    finalizing.value = false;
    status.value = '后端处理完成';
  };

  const simulateError = () => {
    finalizing.value = false;
    status.value = '后端返回错误';
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

  .sender-speech-demo-debug {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    background: var(--sd-color-bg-1);
    border: 1px solid var(--sd-color-border);
    border-radius: var(--sd-border-radius-medium);
    box-shadow: var(--sd-shadow-2);
  }
</style>
