<template>
  <a-space direction="vertical">
    <a-switch v-model="triggerProps.popupVisible">
      <template #checked> ON </template>
      <template #unchecked>OFF</template>
    </a-switch>
    <a-color-picker defaultValue="#165DFF" :trigger-props="triggerProps" />
  </a-space>
</template>

<script setup>
  import { ref } from 'vue';

  const triggerProps = ref({
    popupVisible: false,
    unmountOnClose: true,
    renderToBody: false,
    position: 'rt',
  });
</script>
