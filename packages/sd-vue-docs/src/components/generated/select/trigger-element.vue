<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('Beijing');
  const options = ['Beijing', 'Shanghai', 'Guangzhou', 'Chengdu'];
</script>

<template>
  <sd-select v-model="value" :options="options">
    <template #trigger="{ displayValue, selectedOptions, popupVisible }">
      <sd-button type="primary">
        当前城市：{{ displayValue || '未选择' }} （{{ selectedOptions.length }} 项，{{
          popupVisible ? '收起' : '展开'
        }}）
      </sd-button>
    </template>
  </sd-select>
</template>
