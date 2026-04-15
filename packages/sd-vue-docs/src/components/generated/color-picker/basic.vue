<template>
  <sd-space>
    <sd-color-picker v-model="value" />
    <sd-color-picker defaultValue="#165DFF" showText disabledAlpha />
  </sd-space>
</template>

<script setup>
  import { ref } from 'vue';
  const value = ref('#165DFF');
</script>
