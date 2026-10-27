<script setup lang="ts">
  import { useTemplateRef } from 'vue';

  import { Button, LiquidGlassLogo, Space } from '@sdata/web-vue';
  const background =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%232c5999'/%3E%3Cstop offset='1' stop-color='%23934a77'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath fill='url(%23g)' d='M0 0h800v400H0z'/%3E%3C/svg%3E";
  const glass = useTemplateRef('glass');
</script>
<template>
  <Space direction="vertical" fill :size="16">
    <Button type="primary" @click="glass?.replay()">重新播放</Button>
    <LiquidGlassLogo
      :auto-width="false"
      ref="glass"
      logo="/logo-icon.png"
      logo-color="original"
      :background-image="background"
      :background-tint-opacity="0.15"
      :height="320"
      aria-label="SD Design 品牌展示"
    >
      <template #fallback><span>SD Design · 品牌展示</span></template>
    </LiquidGlassLogo>
  </Space>
</template>
