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
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

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
</style>
