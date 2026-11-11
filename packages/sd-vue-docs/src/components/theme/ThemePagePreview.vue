<script setup lang="ts">
  import type { SdThemeConfig } from '@sdata/web-vue';

  import type { DocsFramework } from '../../utils/framework-navigation';

  import ReactThemePreview from './ReactThemePreview.vue';
  import { getThemePreset } from './theme-playground';
  import ThemePreviewCanvas from './ThemePreviewCanvas.vue';
  import ThemeWorkspacePage from './ThemeWorkspacePage.vue';
  defineProps<{
    theme: SdThemeConfig;
    themeMode: 'light' | 'dark';
    mobile?: boolean;
    framework?: DocsFramework;
  }>();
</script>

<template>
  <sd-config-provider :theme="theme" :theme-mode="themeMode">
    <ReactThemePreview
      v-if="framework === 'react' && mobile"
      kind="workspace"
      :preset="getThemePreset('default')"
      :theme="theme"
      :theme-mode="themeMode"
      mobile
    />
    <ThemeWorkspacePage v-else-if="mobile" :theme="theme" :theme-mode="themeMode" mobile />
    <ThemePreviewCanvas v-else
      ><ReactThemePreview
        v-if="framework === 'react'"
        kind="workspace"
        :preset="getThemePreset('default')"
        :theme="theme"
        :theme-mode="themeMode" /><ThemeWorkspacePage v-else :theme="theme" :theme-mode="themeMode"
    /></ThemePreviewCanvas>
  </sd-config-provider>
</template>
