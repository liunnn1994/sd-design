<script setup lang="ts">
  import type { SdThemeConfig } from '@sdata/web-vue';

  import ThemePreviewCanvas from './ThemePreviewCanvas.vue';
  import ThemeWorkspacePage from './ThemeWorkspacePage.vue';
  defineProps<{ theme: SdThemeConfig; themeMode: 'light' | 'dark' }>();
</script>

<template>
  <sd-config-provider :theme="theme" :theme-mode="themeMode">
    <ThemePreviewCanvas
      ><ThemeWorkspacePage :theme="theme" :theme-mode="themeMode"
    /></ThemePreviewCanvas>
  </sd-config-provider>
</template>
