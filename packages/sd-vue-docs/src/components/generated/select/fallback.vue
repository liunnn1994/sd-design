<template>
  <sd-space direction="vertical" size="large">
    <sd-select
      defaultValue="Shanxi"
      class="sd:w-80"
      placeholder="请选择…"
      :fallback-option="fallback"
      :options="options"
    />
    <sd-select
      defaultValue="Shanxi"
      class="sd:w-80"
      placeholder="请选择…"
      :fallback-option="fallback"
      :show-extra-options="false"
      :options="options"
    />
    <sd-select
      :default-value="['Shanxi', 'Nanjing', 'Hangzhou']"
      class="sd:w-80"
      placeholder="请选择…"
      multiple
      :fallback-option="fallback"
      :options="allOptions"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import type { SelectFallbackOption } from '@sdata/web-vue';

  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
  const allOptions = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];

  const fallback: SelectFallbackOption = (value) => {
    return {
      value,
      label: `++${value}++`,
    };
  };
</script>
