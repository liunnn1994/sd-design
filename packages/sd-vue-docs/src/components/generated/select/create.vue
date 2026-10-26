<template>
  <sd-space direction="vertical" size="large">
    <sd-select class="sd:w-80" placeholder="请选择…" allow-create :options="options" />
    <sd-select class="sd:w-80" placeholder="请选择…" multiple allow-create :options="options" />
  </sd-space>
</template>

<script setup lang="ts">
  const options = [
    '北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '成都',
    '武汉',
  ];
</script>
