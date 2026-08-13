<template>
  <sd-space direction="vertical" size="large">
    <sd-number-flow :value="value" :plugins="[continuous]" :format="{ minimumIntegerDigits: 3 }" />
    <sd-space>
      <sd-button @click="value -= 1">减一</sd-button>
      <sd-button type="primary" @click="value += 1">加一</sd-button>
      <sd-button @click="randomize">切换随机数</sd-button>
    </sd-space>
  </sd-space>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  import { continuous } from '@sdata/web-vue';

  const value = shallowRef(98);

  function randomize() {
    const next = Math.floor(Math.random() * 1_000);
    value.value = next === value.value ? (next + 1) % 1_000 : next;
  }
</script>
