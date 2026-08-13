<template>
  <sd-space direction="vertical" size="large">
    <sd-number-flow :value="revenue" :format="{ maximumFractionDigits: 0 }">
      <template #prefix><span class="label">本月收入</span></template>
      <template #suffix><span class="unit">元</span></template>
    </sd-number-flow>
    <sd-button type="primary" @click="randomize">切换随机数</sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const revenue = shallowRef(128600);

  function randomize() {
    revenue.value = Math.floor(Math.random() * 1_000_000);
  }
</script>

<style scoped>
  .label {
    color: var(--sd-color-text-2);
    font-size: 14px;
  }
  .unit {
    color: var(--sd-color-text-2);
    font-size: 14px;
  }
</style>
