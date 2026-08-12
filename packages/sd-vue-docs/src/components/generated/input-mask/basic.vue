<template>
  <div class="sd:flex sd:flex-col sd:items-start sd:gap-2">
    <sd-input-mask v-model="value" mask="9999-99-99" :mask-char="null" placeholder="YYYY-MM-DD" />
    <span class="text-sm text-slate-500">当前值：{{ value || '尚未输入' }}</span>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');
</script>
