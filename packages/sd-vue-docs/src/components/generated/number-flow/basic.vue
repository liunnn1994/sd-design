<template>
  <sd-space direction="vertical" size="large">
    <sd-space size="large">
      <sd-number-flow :value="integer" />
      <sd-number-flow :value="percent" :format="{ style: 'percent' }" />
      <sd-number-flow
        :value="currency"
        locales="zh-CN"
        :format="{ style: 'currency', currency: 'CNY' }"
      />
    </sd-space>
    <sd-button type="primary" @click="randomize">切换随机数</sd-button>
  </sd-space>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const integer = shallowRef(123456.78);
  const percent = shallowRef(0.42);
  const currency = shallowRef(1299);

  function randomize() {
    integer.value = Math.random() * 1_000_000;
    percent.value = Math.random();
    currency.value = Math.random() * 10_000;
  }
</script>
