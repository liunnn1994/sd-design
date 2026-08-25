<template>
  <sd-inline-clamp
    text="summer-campaign-panorama-final.jpeg"
    :split="splitFileName"
    location="middle"
    class="clamp-demo"
  />
</template>

<script setup lang="ts">
  import type { InlineClampSplit } from '@sdata/web-vue';

  const splitFileName: InlineClampSplit = (text) => {
    const extension = text.match(/\.[^.]+$/)?.[0];
    return extension ? { body: text.slice(0, -extension.length), end: extension } : { body: text };
  };
</script>

<style scoped>
  .clamp-demo {
    display: block;
    width: min(100%, 12rem);
  }
</style>
