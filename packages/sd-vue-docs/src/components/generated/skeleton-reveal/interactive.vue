<script setup lang="ts">
  import { useTemplateRef } from 'vue';

  import { Button, Input, SkeletonReveal, Space } from '@sdata/web-vue';
  const reveal = useTemplateRef('reveal');
</script>
<template>
  <div style="display: grid; gap: 16px"
    ><Space
      ><Button @click="reveal?.replay()">重新播放</Button
      ><Button @click="reveal?.finish()">立即显示</Button></Space
    ><SkeletonReveal ref="reveal" :autoplay="false"
      ><div style="padding: 24px; border: 1px solid var(--sd-color-border-2); border-radius: 8px"
        ><p>点击或聚焦输入框，会直接进入可用状态。</p
        ><Input placeholder="动画不会阻挡你的输入" /></div></SkeletonReveal
  ></div>
</template>
