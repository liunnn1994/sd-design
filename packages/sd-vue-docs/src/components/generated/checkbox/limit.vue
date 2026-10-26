<template>
  <sd-space direction="vertical" size="large">
    <sd-checkbox-group :max="2" v-model="value1" :options="plainOptions" />
    <sd-checkbox-group :max="2" :default-value="['1']">
      <sd-checkbox value="1" disabled>选项 1</sd-checkbox>
      <sd-checkbox value="2">选项 2</sd-checkbox>
      <sd-checkbox value="3">选项 3</sd-checkbox>
      <sd-checkbox value="4">选项 4</sd-checkbox>
    </sd-checkbox-group>
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const value1 = ref(['普通选项 1']);
  const plainOptions = ['普通选项 1', '普通选项 2', '普通选项 3', '普通选项 4'];
</script>
