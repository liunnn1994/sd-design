<template>
  <sd-space direction="vertical" size="large">
    <sd-switch v-model="value" checked-value="yes" unchecked-value="no" />
    <div>当前值： {{ value }}</div>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
</script>
