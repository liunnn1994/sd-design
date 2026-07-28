<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('09:30:00');
</script>

<template>
  <sd-time-picker v-model="value">
    <template #trigger="{ displayValue, popupVisible }">
      <sd-button type="primary">
        {{ displayValue || '选择时间' }}（{{ popupVisible ? '收起' : '展开' }}）
      </sd-button>
    </template>
  </sd-time-picker>
</template>
