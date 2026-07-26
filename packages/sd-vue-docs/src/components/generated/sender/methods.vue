<template>
  <div class="sender-demo">
    <div class="sender-demo-actions">
      <sd-button size="small" @click="senderRef?.insert('请简洁回答：', 'start')">
        开头插入
      </sd-button>
      <sd-button size="small" @click="senderRef?.insert('，并给出示例', 'end')">
        末尾插入
      </sd-button>
      <sd-button size="small" @click="senderRef?.focus({ cursor: 'all' })"> 全选聚焦 </sd-button>
      <sd-button size="small" type="text" @click="clear">清空</sd-button>
      <sd-button size="small" type="text" @click="readValue">读取内容</sd-button>
    </div>
    <sd-sender ref="senderRef" default-value="介绍一下 VueUse" />
    <sd-alert type="info">getValue()：{{ currentValue || '暂无内容' }}</sd-alert>
  </div>
</template>

<script setup lang="ts">
  import type { SenderInstance } from '@sdata/web-vue';

  import { ref } from 'vue';

  const senderRef = ref<SenderInstance>();
  const currentValue = ref('');

  function clear() {
    senderRef.value?.clear();
    readValue();
  }

  function readValue() {
    currentValue.value = senderRef.value?.getValue().value ?? '';
  }
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 12px;
  }

  .sender-demo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
