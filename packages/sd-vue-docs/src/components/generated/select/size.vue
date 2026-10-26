<template>
  <sd-space direction="vertical" size="large">
    <sd-radio-group type="button" v-model="size">
      <sd-radio value="mini">迷你</sd-radio>
      <sd-radio value="small">小</sd-radio>
      <sd-radio value="medium">中</sd-radio>
      <sd-radio value="large">大</sd-radio>
    </sd-radio-group>
    <sd-select
      default-value="北京"
      class="sd:w-80"
      :size="size"
      placeholder="请选择…"
      :options="options"
    />
    <sd-select
      :default-value="['北京', '上海']"
      class="sd:w-80"
      :size="size"
      placeholder="请选择…"
      multiple
      :options="allOptions"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import type { Size } from '@sdata/web-vue';

  import { ref } from 'vue';

  const size = ref<Size>('medium');
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
</script>
