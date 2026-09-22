<script setup lang="ts">
  import type { SdThemeConfig } from '@sdata/web-vue';

  import { computed, onErrorCaptured, shallowRef, watch } from 'vue';

  import { demosFor, loadDemo } from './demo-registry';
  const { theme, component = 'button' } = defineProps<{
    theme: SdThemeConfig;
    component?: string;
  }>();
  const demo = shallowRef('');
  const failure = shallowRef('');
  const zoom = shallowRef('100');
  const demos = computed(() => demosFor(component));
  watch(
    demos,
    (value) => {
      demo.value = value[0]?.path ?? '';
      failure.value = '';
    },
    { immediate: true },
  );
  watch(demo, () => {
    failure.value = '';
  });
  const current = computed(() => loadDemo(demo.value));
  onErrorCaptured((error) => {
    failure.value = error instanceof Error ? error.message : String(error);
    return false;
  });
</script>

<template>
  <sd-config-provider :theme="theme">
    <section class="demo-preview">
      <sd-space class="demo-toolbar" wrap>
        <strong>{{ component }}</strong>
        <sd-select
          v-model="demo"
          class="demo-select"
          aria-label="组件示例"
          allow-search
          :options="demos.map((item) => ({ value: item.path, label: item.name }))"
        />
        <sd-select
          v-model="zoom"
          class="zoom-select"
          aria-label="预览缩放"
          :options="['75', '100', '125'].map((value) => ({ value, label: `${value}%` }))"
        />
        <sd-link class="docs-link" :href="`/components/${component}/`">组件文档 ↗</sd-link>
      </sd-space>
      <div class="demo-surface" :style="{ zoom: Number(zoom) / 100 }" data-testid="theme-demo">
        <sd-alert v-if="failure" type="error">示例加载失败：{{ failure }}</sd-alert>
        <component :is="current" v-else-if="current" :key="demo" />
        <sd-empty
          v-else
          :description="`添加 generated/${component}/*.vue 后将在这里自动显示示例。`"
        />
      </div>
    </section>
  </sd-config-provider>
</template>

<style scoped lang="scss">
  .demo-preview {
    min-width: 0;
    overflow: hidden;
    color: var(--sd-color-text-1);
    background: var(--sd-color-bg-2);
    border: 1px solid var(--sd-color-border-2);
    border-radius: 8px;
  }

  .demo-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    padding: 12px 16px;
    font-size: 12px;
    background: var(--sd-color-bg-2);
  }

  :deep(.demo-select) {
    width: 160px;
  }

  :deep(.zoom-select) {
    width: 88px;
  }

  .docs-link {
    margin-left: auto;
  }

  .demo-surface {
    min-height: 280px;
    padding: 24px;
    overflow: auto;
    color: var(--sd-color-text-1);
    font-size: 14px;
    background: var(--sd-color-bg-2);
  }
</style>
