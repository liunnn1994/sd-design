<script setup lang="ts">
  import { computed } from 'vue';

  import { normalizeTheme } from '@sdata/web-vue';

  import type { ThemeConfig, ThemePreset } from './theme-playground';

  const props = defineProps<{
    preset: ThemePreset;
    theme: ThemeConfig;
    themeMode?: 'light' | 'dark';
    compact?: boolean;
    inheritProvider?: boolean;
  }>();

  const heroMetric = computed(
    () =>
      Object.keys(normalizeTheme(props.theme).tokens).length +
      Object.values(props.theme.components ?? {}).reduce(
        (sum, tokens) => sum + Object.keys(tokens).length,
        0,
      ),
  );

  const wrapperClass = computed(() => {
    return [`theme-preview-panel`, `is-${props.preset.key}`, props.compact ? 'is-compact' : ''];
  });

  const spotlightStyle = computed(() => {
    return {
      '--theme-preview-primary': 'rgb(var(--sd-primary-6))',
      '--theme-preview-background': 'var(--sd-color-bg-2)',
      '--theme-preview-surface': 'var(--sd-color-bg-5)',
      '--theme-preview-text': 'var(--sd-color-text-1)',
      '--theme-preview-text-muted': 'var(--sd-color-text-3)',
      '--theme-preview-border': 'var(--sd-color-border-2)',
    };
  });

  const effectiveThemeMode = computed(() => {
    return props.themeMode ?? props.preset.mode ?? 'light';
  });

  const themeGroupOptions = [{ label: '默认分组', value: 'default' }];
</script>

<template>
  <sd-config-provider v-if="!inheritProvider" :theme="theme" :theme-mode="effectiveThemeMode">
    <section :class="wrapperClass" :style="spotlightStyle">
      <header class="theme-preview-panel__hero">
        <div>
          <p class="theme-preview-panel__eyebrow">{{ preset.name }}</p>
          <h3>{{ preset.summary }}</h3>
          <p>{{ preset.description }}</p>
        </div>

        <sd-card class="theme-preview-panel__metric" :bordered="false">
          <strong>{{ heroMetric }}</strong>
          <span>个样式变量已覆盖</span>
        </sd-card>
      </header>

      <div class="theme-preview-panel__grid">
        <sd-card title="主题动作" class="theme-preview-panel__card">
          <sd-space wrap>
            <sd-button type="primary">发布主题</sd-button>
            <sd-button>保存草稿</sd-button>
            <sd-button type="secondary">导出 JSON</sd-button>
          </sd-space>

          <sd-space wrap style="margin-top: 16px">
            <sd-tag color="blue">预览中</sd-tag>
            <sd-tag color="green">已同步</sd-tag>
            <sd-tag color="orange">待评审</sd-tag>
          </sd-space>
        </sd-card>

        <sd-card title="表单与反馈" class="theme-preview-panel__card">
          <sd-space direction="vertical" fill>
            <sd-input placeholder="搜索 token 或组件" allow-clear />
            <sd-select placeholder="选择主题分组" :options="themeGroupOptions" />
            <sd-alert type="success">ConfigProvider 已接收新的 theme 对象。</sd-alert>
          </sd-space>
        </sd-card>
      </div>
    </section>
  </sd-config-provider>
  <section v-else :class="wrapperClass" :style="spotlightStyle">
    <header class="theme-preview-panel__hero">
      <div>
        <p class="theme-preview-panel__eyebrow">{{ preset.name }}</p>
        <h3>{{ preset.summary }}</h3>
        <p>{{ preset.description }}</p>
      </div>

      <sd-card class="theme-preview-panel__metric" :bordered="false">
        <strong>{{ heroMetric }}</strong>
        <span>个样式变量已覆盖</span>
      </sd-card>
    </header>

    <div class="theme-preview-panel__grid">
      <sd-card title="主题动作" class="theme-preview-panel__card">
        <sd-space wrap>
          <sd-button type="primary">发布主题</sd-button>
          <sd-button>保存草稿</sd-button>
          <sd-button type="secondary">导出 JSON</sd-button>
        </sd-space>

        <sd-space wrap style="margin-top: 16px">
          <sd-tag color="blue">预览中</sd-tag>
          <sd-tag color="green">已同步</sd-tag>
          <sd-tag color="orange">待评审</sd-tag>
        </sd-space>
      </sd-card>

      <sd-card title="表单与反馈" class="theme-preview-panel__card">
        <sd-space direction="vertical" fill>
          <sd-input placeholder="搜索 token 或组件" allow-clear />
          <sd-select placeholder="选择主题分组" :options="themeGroupOptions" />
          <sd-alert type="success">ConfigProvider 已接收新的 theme 对象。</sd-alert>
        </sd-space>
      </sd-card>
    </div>
  </section>
</template>

<style lang="scss" src="./ThemePreviewPanel.scss"></style>
