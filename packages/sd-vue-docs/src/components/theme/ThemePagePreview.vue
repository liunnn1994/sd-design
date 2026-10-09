<script setup lang="ts">
  import type { SdThemeConfig } from '@sdata/web-vue';

  import ThemePreviewCanvas from './ThemePreviewCanvas.vue';
  import ThemeWorkspacePage from './ThemeWorkspacePage.vue';
  defineProps<{ theme: SdThemeConfig; themeMode: 'light' | 'dark'; mobile?: boolean }>();
</script>

<template>
  <sd-config-provider :theme="theme" :theme-mode="themeMode">
    <ThemeWorkspacePage v-if="mobile" :theme="theme" :theme-mode="themeMode" mobile />
    <ThemePreviewCanvas v-else
      ><ThemeWorkspacePage :theme="theme" :theme-mode="themeMode"
    /></ThemePreviewCanvas>
  </sd-config-provider>
</template>
