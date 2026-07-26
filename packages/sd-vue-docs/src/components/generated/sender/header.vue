<template>
  <div class="sender-demo">
    <sd-button type="outline" @click="open = !open">
      {{ open ? '收起引用' : '展开引用' }}
    </sd-button>
    <sd-sender v-model="value" placeholder="针对引用内容提问">
      <template #header>
        <sd-sender-header v-model:open="open" title="引用内容">
          Ant Design X Sender 的头部面板支持平滑展开和收起。
        </sd-sender-header>
      </template>
    </sd-sender>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const open = ref(true);
  const value = ref('');
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 12px;
  }

  .sender-demo > button {
    justify-self: start;
  }
</style>
