<template>
  <div class="sender-demo">
    <sd-sender v-model="value" placeholder="输入消息，按 Enter 发送" @submit="handleSubmit" />
    <sd-alert v-if="lastMessage" type="success"> 最近发送：{{ lastMessage }} </sd-alert>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
  const lastMessage = ref('');

  function handleSubmit(message: string) {
    lastMessage.value = message;
    value.value = '';
  }
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 12px;
  }
</style>
