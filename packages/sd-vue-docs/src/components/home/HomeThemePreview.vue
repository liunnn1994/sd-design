<script setup lang="ts">
  import { computed, ref } from 'vue';

  import { frameworkHref, type DocsFramework } from '../../utils/framework-navigation';
  import ReactThemePreview from '../theme/ReactThemePreview.vue';
  import {
    buildThemeRuntimePayload,
    getThemePreset,
    themePresets,
  } from '../theme/theme-playground';
  const { framework = 'vue' } = defineProps<{ framework?: DocsFramework }>();

  import ThemePreviewPanel from '../theme/ThemePreviewPanel.vue';

  const activeThemeKey = ref(themePresets[0].key);

  const activeTheme = computed(() => {
    return getThemePreset(activeThemeKey.value);
  });

  const activeRuntimePayload = computed(() => {
    return buildThemeRuntimePayload(activeTheme.value.theme, activeTheme.value.mode);
  });

  const previewSurfaceStyle = computed(() => {
    return {
      '--home-preview-accent': 'rgb(var(--sd-primary-6))',
      '--home-preview-surface': 'var(--sd-color-bg-2)',
      '--home-preview-surface-elevated': 'var(--sd-color-bg-5)',
      '--home-preview-text': 'var(--sd-color-text-1)',
      '--home-preview-text-muted': 'var(--sd-color-text-3)',
      '--home-preview-border': 'var(--sd-color-border-2)',
    };
  });
</script>

<template>
  <div class="theme-preview">
    <aside class="theme-preview__aside">
      <button
        v-for="themeOption in themePresets"
        :key="themeOption.key"
        type="button"
        class="theme-preview__option"
        :class="{ 'is-active': themeOption.key === activeThemeKey }"
        @click="activeThemeKey = themeOption.key"
      >
        <strong>{{ themeOption.name }}</strong>
        <span>{{ themeOption.summary }}</span>
        <small>{{ themeOption.description }}</small>
      </button>

      <div class="theme-preview__doc-links">
        <a :href="frameworkHref('/guides/theme-editor/', framework)">查看主题 JSON 约定</a>
      </div>
    </aside>

    <sd-config-provider :theme="activeRuntimePayload.theme" :theme-mode="activeRuntimePayload.mode">
      <div class="theme-preview__surface" :style="previewSurfaceStyle">
        <div class="theme-preview__summary">
          <div>
            <p class="theme-preview__eyebrow">实时预览</p>
            <h3>{{ activeTheme.name }}</h3>
            <p> 该模块内可独立切换主题并实时预览，不会影响组件展示区与外部文档主题状态。 </p>
          </div>

          <sd-tag color="blue">{{ activeTheme.summary }}</sd-tag>
        </div>

        <ReactThemePreview
          v-if="framework === 'react'"
          :preset="activeTheme"
          :theme="activeRuntimePayload.theme"
          :theme-mode="activeRuntimePayload.mode"
          compact
        />
        <ThemePreviewPanel
          v-else
          :preset="activeTheme"
          :theme="activeRuntimePayload.theme"
          :theme-mode="activeRuntimePayload.mode"
          :inherit-provider="true"
          compact
        />
      </div>
    </sd-config-provider>
  </div>
</template>

<style lang="scss" src="./HomeThemePreview.scss"></style>
