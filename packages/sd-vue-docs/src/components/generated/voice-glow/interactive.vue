<template>
  <div class="voice-glow-interactive">
    <sd-voice-glow theme="dark" :level="level" :processing="processing">
      <div class="voice-glow-card">{{ processing ? '处理中…' : `音量：${level}` }}</div>
    </sd-voice-glow>
    <sd-space>
      <sd-button @click="level = level === 0.8 ? 0.2 : 0.8">切换音量</sd-button>
      <sd-button @click="processing = !processing">切换处理状态</sd-button>
    </sd-space>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const level = ref(0.2);
  const processing = ref(false);
</script>

<style scoped>
  .voice-glow-interactive {
    display: grid;
    gap: 28px;
    justify-items: start;
    padding: 28px;
    background: #11121b;
    border-radius: 16px;
  }
  .voice-glow-card {
    min-width: 300px;
    padding: 24px;
    color: #fff;
    background: #232432;
    border-radius: 16px;
  }
</style>
