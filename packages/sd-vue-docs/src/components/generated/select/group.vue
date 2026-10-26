<template>
  <sd-space direction="vertical" size="large">
    <sd-select class="sd:w-80" placeholder="请选择…" :options="groupOptions" />
    <sd-select class="sd:w-80" placeholder="请选择…" multiple :options="groupOptions" />
  </sd-space>
</template>

<script setup lang="ts">
  const groupOptions = [
    {
      isGroup: true,
      label: '分组 1',
      options: ['北京', '上海'],
    },
    {
      isGroup: true,
      label: '分组 2',
      options: ['广州', { label: '禁用', value: '禁用', disabled: true }, '深圳'],
    },
    {
      isGroup: true,
      label: '分组 3',
      options: ['成都', '武汉'],
    },
  ];
</script>
