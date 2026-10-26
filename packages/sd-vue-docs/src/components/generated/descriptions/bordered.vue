<template>
  <sd-descriptions :data="data" title="用户信息" bordered />
</template>

<script setup lang="ts">
  import type { DescData } from '@sdata/web-vue';

  const data: DescData[] = [
    {
      label: '姓名',
      value: '苏格拉底',
    },
    {
      label: '手机',
      value: '123-1234-1234',
    },
    {
      label: '居住地',
      value: '北京',
    },
    {
      label: '家乡',
      value: '北京',
    },
    {
      label: '地址',
      value: '北京市知春路示例大厦',
    },
  ];
</script>
