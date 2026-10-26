<template>
  <div class="sd:mb-2.5">
    <sd-switch v-model="scrollbar" />
    虚拟滚动条
  </div>
  <sd-space direction="vertical" size="large">
    <sd-select
      :default-value="['北京', '上海']"
      class="sd:w-90"
      placeholder="请选择…"
      multiple
      :scrollbar="scrollbar"
      :options="options"
    />
    <sd-select
      :default-value="['北京', '上海', '广州']"
      class="sd:w-90"
      placeholder="请选择…"
      multiple
      :max-tag-count="2"
      allow-clear
      :scrollbar="scrollbar"
      :options="options"
    />
    <sd-select
      :default-value="['北京', '上海']"
      class="sd:w-90"
      placeholder="请选择…"
      multiple
      :limit="2"
      :scrollbar="scrollbar"
      :options="options"
    />
  </sd-space>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const scrollbar = ref(true);
  const options = [
    '北京',
    { label: '上海', value: '上海', tagProps: { color: 'red' } },
    '广州',
    { label: '禁用', value: '禁用', disabled: true },
    '深圳',
    '武汉',
  ];
</script>
