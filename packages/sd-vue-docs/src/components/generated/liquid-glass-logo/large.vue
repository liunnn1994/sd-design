<script setup lang="ts">
  import { useTemplateRef } from 'vue';

  import { Button, LiquidGlassLogo, Space } from '@sdata/web-vue';
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
      :height="256"
      aria-label="SD Design 标志"
    />
  </Space>
</template>
