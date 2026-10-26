<template>
  <sd-space direction="vertical" size="large">
    <sd-select class="sd:w-80" placeholder="请选择…" :options="cityOptions" />
    <sd-select class="sd:w-80" placeholder="请选择…" :options="boolOptions" />
    <sd-select
      defaultValue="北京"
      class="sd:w-80"
      placeholder="请选择…"
      disabled
      :options="cityOptions"
    />
    <sd-select v-model="value" class="sd:w-80" placeholder="请选择…" :options="data" />
    <div>选中值： {{ value }}</div>
    <sd-select
      class="sd:w-40"
      placeholder="选择框"
      :trigger-props="{ autoFitPopupMinWidth: true }"
      :options="longOptions"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const cityOptions = ['北京', '上海', '广州', { label: '禁用', disabled: true }];
  const boolOptions = [
    { value: true, label: '是' },
    { value: false, label: '否' },
  ];
  const longOptions = [
    '北京—北京—北京',
    '上海',
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
  ];

  const value = ref();
  const data = [
    {
      value: 'beijing',
      label: '北京',
      other: 'extra',
    },
    {
      value: 'shanghai',
      label: '上海',
      other: 'extra',
    },
    {
      value: 'guangzhou',
      label: '广州',
      other: 'extra',
    },
    {
      value: 'chengdu',
      label: '成都',
      other: 'extra',
    },
  ];
</script>
