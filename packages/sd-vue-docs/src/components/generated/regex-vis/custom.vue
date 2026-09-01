<template>
  <div class="regex-vis-demo">
    <sd-button @click="toggleValue">
      {{ value ? '查看空状态' : '查看自定义错误态' }}
    </sd-button>
    <sd-regex-vis v-model="value">
      <template #empty>
        <span class="custom-state">选择上方按钮，查看自定义错误反馈</span>
      </template>
      <template #error="{ error }">
        <strong>无法生成可视图</strong>
        <span>{{ error.message }}</span>
      </template>
      <template #footer="{ value: currentValue }">
        已输入 {{ currentValue.length }} 个字符
      </template>
    </sd-regex-vis>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value = ref('');

  function toggleValue() {
    value.value = value.value ? '' : '(unclosed';
  }
</script>

<style scoped>
  .regex-vis-demo {
    display: grid;
    gap: 16px;
  }

  .regex-vis-demo > :first-child {
    justify-self: start;
  }

  .custom-state {
    color: var(--sd-color-text-3);
  }
</style>
