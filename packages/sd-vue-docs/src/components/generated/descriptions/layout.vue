<template>
  <sd-radio-group type="button" v-model="size">
    <sd-radio value="mini">迷你</sd-radio>
    <sd-radio value="small">小</sd-radio>
    <sd-radio value="medium">中</sd-radio>
    <sd-radio value="large">大</sd-radio>
  </sd-radio-group>
  <div class="sd:mt-5 sd:grid sd:gap-6">
    <sd-descriptions :data="data" :size="size" title="用户信息（水平）" bordered />
    <sd-descriptions
      :data="data"
      :size="size"
      title="用户信息（行内水平）"
      layout="inline-horizontal"
      bordered
    />
    <sd-descriptions
      :data="data"
      :size="size"
      title="用户信息（垂直）"
      layout="vertical"
      bordered
    />
    <sd-descriptions
      :data="data"
      :size="size"
      title="用户信息（行内垂直）"
      layout="inline-vertical"
      bordered
    />
  </div>
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
