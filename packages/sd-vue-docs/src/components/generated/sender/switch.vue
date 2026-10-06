<template>
  <div class="sender-demo">
    <sd-sender v-model="value" placeholder="输入问题，选择回答模式" @submit="handleSubmit">
      <template #footer>
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
      </template>
    </sd-sender>
    <sd-alert v-if="submitted" type="info">{{ submitted }}</sd-alert>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('介绍一下 Vue 3 的响应式原理');
  const submitted = ref('');
  const deepThinking = ref(false);
  const webSearch = ref(false);

  function handleSubmit(text: string) {
    submitted.value = `${deepThinking.value ? '深度思考' : '快速回答'} · ${webSearch.value ? '联网搜索' : '离线回答'}：${text}`;
  }
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
