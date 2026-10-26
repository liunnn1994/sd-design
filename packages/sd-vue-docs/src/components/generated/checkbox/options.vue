<template>
  <sd-space direction="vertical" size="large">
    <sd-checkbox-group v-model="value1" :options="plainOptions" />
    <sd-checkbox-group v-model="value2" :options="options" />
    <sd-checkbox-group v-model="value2" :options="options">
      <template #label="{ data }">
        <sd-tag>{{ data.label }}</sd-tag>
      </template>
    </sd-checkbox-group>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value1 = ref(['普通选项 1']);
  const plainOptions = ['普通选项 1', '普通选项 2', '普通选项 3'];

  const value2 = ref(['1']);
  const options = [
    { label: '选项 1', value: '1' },
    { label: '选项 2', value: '2' },
    { label: '选项 3', value: '3', disabled: true },
  ];
</script>
