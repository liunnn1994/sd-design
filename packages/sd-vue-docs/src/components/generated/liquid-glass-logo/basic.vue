<script setup lang="ts">
  import { useTemplateRef } from 'vue';

  import { Button, LiquidGlassLogo, PageHeader } from '@sdata/web-vue';
  const glass = useTemplateRef('glass');
</script>
<template>
  <PageHeader :show-back="false" subtitle="Vue 组件库">
    <template #title>
      <LiquidGlassLogo
        ref="glass"
        logo="/logo-icon.png"
        logo-color="original"
        mark="logo"
        ending="wordmark"
        text="Design"
        :font-size="30"
        :logo-size="32"
        :logo-scale="1"
        :tile="false"
        background="transparent"
        aria-label="SD Design 标志"
      />
    </template>
    <template #extra><Button type="primary" @click="glass?.replay()">重新播放</Button></template>
  </PageHeader>
</template>
