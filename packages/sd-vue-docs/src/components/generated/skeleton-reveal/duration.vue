<script setup lang="ts">
  import { useTemplateRef } from 'vue';

  import { Button, SkeletonReveal } from '@sdata/web-vue';
  const reveal = useTemplateRef('reveal');
</script>
<template>
  <div style="display: grid; gap: 16px"
    ><Button @click="reveal?.replay()">播放较慢的入场</Button
    ><SkeletonReveal ref="reveal" :autoplay="false" :duration="2400"
      ><div style="padding: 24px; border: 1px solid var(--sd-color-border-2); border-radius: 8px"
        ><h3>让界面逐渐成形</h3><p>自定义时长；动画结束后不再运行。</p></div
      ></SkeletonReveal
    ></div
  >
</template>
