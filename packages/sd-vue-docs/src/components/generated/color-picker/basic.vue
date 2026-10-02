<template>
  <sd-space>
    <sd-color-picker v-model="value" clearable />
    <sd-color-picker defaultValue="#165DFF" enableAlpha format="RGBA" />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  const value = ref('#165DFF');
</script>
