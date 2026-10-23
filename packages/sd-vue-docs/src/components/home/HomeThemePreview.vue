<script setup lang="ts">
  import { computed, ref } from 'vue';

  import {
    buildThemeRuntimePayload,
    getThemePreset,
    themePresets,
  } from '../theme/theme-playground';
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
        <a href="/guides/theme-editor/">查看主题 JSON 约定</a>
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

        <ThemePreviewPanel
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

<style lang="scss" scoped>
  .theme-preview {
    display: grid;
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 32px;
  }

  .theme-preview__aside,
  .theme-preview__surface {
    min-width: 0;
  }

  .theme-preview__aside {
    display: grid;
    gap: 8px;
    align-content: start;
  }

  .theme-preview__option {
    display: grid;
    gap: 6px;
    padding: 16px;
    color: var(--sd-color-text-1);
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition:
      background 160ms ease-out,
      border-color 160ms ease-out;
  }

  .theme-preview__option strong {
    font-size: 14px;
  }

  .theme-preview__option span,
  .theme-preview__option small {
    color: var(--sd-color-text-2);
    font-size: 12px;
    line-height: 1.6;
  }

  .theme-preview__option:hover {
    background: var(--sd-color-fill-1);
  }

  .theme-preview__option.is-active {
    background: var(--sd-color-primary-light-1);
    border-color: var(--sd-color-border-2);
  }

  .theme-preview__option:focus-visible {
    outline: 2px solid rgb(var(--sd-primary-6));
    outline-offset: 2px;
  }

  .theme-preview__doc-links {
    margin-top: 16px;
    padding-inline: 16px;
  }

  .theme-preview__doc-links a {
    color: rgb(var(--sd-primary-7));
    font-size: 13px;
    text-decoration: none;
  }

  .theme-preview__surface {
    display: grid;
    gap: 24px;
    padding: 24px;
    color: var(--home-preview-text);
    background: var(--home-preview-surface);
    border: 1px solid var(--home-preview-border);
    border-radius: 12px;
  }

  .theme-preview__summary {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: space-between;
  }

  .theme-preview__summary h3 {
    margin: 0;
    font-weight: 600;
    font-size: 20px;
  }

  .theme-preview__summary p {
    margin: 8px 0 0;
    color: var(--home-preview-text-muted);
    font-size: 13px;
    line-height: 1.75;
  }

  .theme-preview__summary .theme-preview__eyebrow {
    margin: 0 0 8px;
    color: var(--home-preview-accent);
    font-size: 12px;
  }

  @media (width < 50rem) {
    .theme-preview {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .theme-preview__surface {
      padding: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-preview__option {
      transition: none;
    }
  }
</style>
