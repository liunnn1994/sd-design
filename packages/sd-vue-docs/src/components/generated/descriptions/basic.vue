<template>
  <sd-space direction="vertical" size="large" fill>
    <sd-descriptions :data="data" title="用户信息" layout="inline-horizontal" />
    <sd-descriptions title="用户信息" :column="{ xs: 1, md: 3, lg: 4 }">
      <sd-descriptions-item
        v-for="item of data"
        :label="typeof item.label === 'string' ? item.label : undefined"
        :span="item.span ?? 1"
      >
        <sd-tag>{{ item.value }}</sd-tag>
      </sd-descriptions-item>
    </sd-descriptions>
  </sd-space>
</template>

<script setup lang="ts">
  import type { DescData } from '@sdata/web-vue';

  const data: DescData[] = [
    {
      label: '姓名',
      value: '苏格拉底',
      span: 3,
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
