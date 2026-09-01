<template>
  <div class="regex-vis-demo">
    <div class="regex-vis-demo-actions">
      <sd-button
        v-for="item in patterns"
        :key="item.label"
        :type="value === item.value ? 'primary' : 'secondary'"
        @click="value = item.value"
      >
        {{ item.label }}
      </sd-button>
    </div>
    <sd-regex-vis v-model="value" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const patterns = [
    { label: '邮箱', value: '^[\\w.-]+@[\\w.-]+\\.[a-z]{2,}$' },
    { label: '日期', value: '^(\\d{4})-(\\d{2})-(\\d{2})$' },
    { label: '错误示例', value: '(unclosed' },
  ];
  const value = ref(patterns[0].value);
</script>

<style scoped>
  .regex-vis-demo {
    display: grid;
    gap: 16px;
  }

  .regex-vis-demo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
