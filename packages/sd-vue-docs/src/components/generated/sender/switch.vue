<template>
  <div class="sender-demo">
    <div class="sender-demo-switches">
      <sd-sender-switch v-model="deepThinking">
        <template #checked>深度思考</template>
        <template #unchecked>快速回答</template>
      </sd-sender-switch>
      <sd-sender-switch v-model="webSearch">
        <template #checked>已联网</template>
        <template #unchecked>联网搜索</template>
      </sd-sender-switch>
    </div>
    <sd-sender v-model="value" allow-speech placeholder="点击语音按钮开始真实语音输入" />
    <p class="sender-demo-tip">
      首次点击语音按钮时，浏览器会申请麦克风权限；允许后，识别结果会自动写入输入框。
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
  const deepThinking = ref(false);
  const webSearch = ref(false);
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 12px;
  }

  .sender-demo-switches {
    display: flex;
    gap: 8px;
  }

  .sender-demo-tip {
    margin: 0;
    color: var(--sd-color-text-3);
    font-size: 13px;
    line-height: 1.5;
  }
</style>
