<template>
  <sd-space direction="vertical" align="start">
    <sd-input-mask v-model="value" mask="9999-99-99" :mask-char="null" placeholder="YYYY-MM-DD" />
    <span class="text-sm text-slate-500">当前值：{{ value || '尚未输入' }}</span>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
</script>
