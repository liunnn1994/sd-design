<template>
  <sd-space direction="vertical" size="large">
    <sd-select class="sd:w-full" placeholder="请选择…" :bordered="false" :options="options" />
    <sd-select
      :default-value="['北京', '上海']"
      class="sd:w-90"
      placeholder="请选择…"
      multiple
      :bordered="false"
      :options="borderOptions"
    />
  </sd-space>
</template>

<script setup lang="ts">
  const options = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
  const borderOptions = [
    '北京',
    { label: '上海', value: '上海', tagProps: { color: 'red' } },
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '武汉',
  ];
</script>
