<template>
  <sd-space direction="vertical" size="large">
    <sd-select class="sd:w-80" placeholder="请选择…" :options="options">
      <template #label="{ data }">
        <span><icon-plus />{{ data?.label }}</span>
      </template>
    </sd-select>
  </sd-space>
</template>

<script setup lang="ts">
  import { IconPlus } from '@sdata/web-vue/es/icon/index.js';

  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
</script>
