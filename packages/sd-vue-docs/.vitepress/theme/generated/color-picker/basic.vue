<template>
  <a-space>
    <a-color-picker v-model="value" />
    <a-color-picker defaultValue="#165DFF" showText disabledAlpha />
  </a-space>
</template>

<script setup>
  import { ref } from 'vue';
  const value = ref('#165DFF');
</script>
