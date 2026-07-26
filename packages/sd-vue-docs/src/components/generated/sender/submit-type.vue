<template>
  <div class="sender-demo">
    <section>
      <div class="sender-demo-label">Enter 发送，Shift + Enter 换行</div>
      <sd-sender
        v-model="enterValue"
        placeholder="按 Enter 发送"
        @submit="handleSubmit('Enter', $event)"
      />
    </section>
    <section>
      <div class="sender-demo-label">Shift + Enter 发送，Enter 换行</div>
      <sd-sender
        v-model="shiftEnterValue"
        submit-type="shiftEnter"
        placeholder="按 Shift + Enter 发送"
        @submit="handleSubmit('Shift + Enter', $event)"
      />
    </section>
    <sd-alert v-if="lastMessage" type="success">{{ lastMessage }}</sd-alert>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const enterValue = ref('');
  const shiftEnterValue = ref('');
  const lastMessage = ref('');

  function handleSubmit(shortcut: string, value: string) {
    lastMessage.value = `${shortcut} 已发送：${value}`;
  }
</script>

<style scoped>
  .sender-demo {
    display: grid;
    gap: 16px;
  }

  .sender-demo section {
    display: grid;
    gap: 8px;
  }

  .sender-demo-label {
    color: var(--sd-color-text-2);
    font-size: 13px;
  }
</style>
