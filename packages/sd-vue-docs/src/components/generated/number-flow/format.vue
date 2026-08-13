<template>
  <sd-space direction="vertical" size="large">
    <sd-number-flow
      :value="compactValue"
      locales="zh-CN"
      :format="{ notation: 'compact', maximumFractionDigits: 1 }"
    />
    <sd-number-flow
      :value="progress"
      :format="{ style: 'percent', minimumFractionDigits: 1 }"
      prefix="完成 "
    />
    <sd-button type="primary" @click="randomize">切换随机数</sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const compactValue = shallowRef(9_876_543);
  const progress = shallowRef(0.856);

  function randomize() {
    compactValue.value = Math.floor(Math.random() * 100_000_000);
    progress.value = Math.random();
  }
</script>
