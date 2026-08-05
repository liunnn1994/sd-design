<template>
  <sd-space direction="vertical" align="start">
    <sd-thinking-orb state="solving" :paused="paused" :speed="speed" />
    <sd-space>
      <sd-button @click="paused = !paused">{{ paused ? '继续' : '暂停' }}</sd-button>
      <sd-button @click="speed = speed === 1 ? 1.8 : 1">切换速度</sd-button>
    </sd-space>
  </sd-space>
</template>

<script setup lang="ts">
  import { shallowRef } from 'vue';

  const paused = shallowRef(false);
  const speed = shallowRef(1);
</script>
