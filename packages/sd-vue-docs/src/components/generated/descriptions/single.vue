<template>
  <sd-radio-group type="button" v-model="size">
    <sd-radio value="mini">迷你</sd-radio>
    <sd-radio value="small">小</sd-radio>
    <sd-radio value="medium">中</sd-radio>
    <sd-radio value="large">大</sd-radio>
  </sd-radio-group>
  <sd-descriptions class="sd:mt-5" :data="data" :size="size" title="用户信息" :column="1" />
</template>

<script setup lang="ts">
  import type { DescData, Size } from '@sdata/web-vue';

  import { ref } from 'vue';

  const size = ref<Size>('medium');

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
