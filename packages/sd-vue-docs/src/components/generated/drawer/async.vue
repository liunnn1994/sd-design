<template>
  <sd-button @click="handleClick">Open Drawer</sd-button>
  <sd-drawer
    v-model:visible="visible"
    @before-ok="handleBeforeOk"
    @cancel="handleCancel"
    unmountOnClose
  >
    <template #title> Title </template>
    <div
      >You can customize modal body text by the current situation. This modal will be closed
      immediately once you press the OK button.</div
    >
  </sd-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const visible = ref(false);

  const handleClick = () => {
    visible.value = true;
  };

  const handleBeforeOk = (done: (closed: boolean) => void) => {
    window.setTimeout(() => {
      done(true);
    }, 3000);
  };

  const handleCancel = () => {
    visible.value = false;
  };
</script>
