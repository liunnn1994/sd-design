<script setup lang="ts">
  import type { SdThemeConfig } from '@sdata/web-vue';

  import { computed, shallowRef } from 'vue';

  import { componentLabel, themeCatalog } from './editor-model';
  import ThemeTokenPanel from './ThemeTokenPanel.vue';

  const { theme, component = '' } = defineProps<{ theme: SdThemeConfig; component?: string }>();
  const emit = defineEmits<{
    change: [theme: SdThemeConfig];
    token: [key: string, value: string | undefined, component: string];
    component: [name: string];
  }>();
  const search = shallowRef('');
  const names = computed(() =>
    themeCatalog.components
      .map((item) => item.name)
      .filter((name) =>
        `${name} ${componentLabel(name)}`.toLowerCase().includes(search.value.toLowerCase()),
      ),
  );
  function resetScope() {
    if (!component) emit('change', { ...theme, tokens: {} });
    else {
      const components = { ...theme.components };
      delete components[component];
      emit('change', { ...theme, components });
    }
  }
</script>

<template>
  <div class="detail-panel">
    <p>独立样式只影响所选组件；恢复跟随整体后，会使用品牌设置。</p>
    <sd-input
      v-model="search"
      placeholder="搜索组件"
      :input-attrs="{ 'aria-label': '搜索组件' }"
      allow-clear
    />
    <sd-select
      :model-value="component"
      aria-label="微调对象"
      :options="[
        { value: '', label: '整体精确设置' },
        ...names.map((name) => ({ value: name, label: componentLabel(name) })),
      ]"
      @change="emit('component', String($event))"
    />
    <sd-button size="small" @click="resetScope">{{
      component ? '恢复跟随整体' : '清除整体精确设置'
    }}</sd-button>
    <ThemeTokenPanel
      :key="component"
      :theme="theme"
      :component="component"
      @change="(key, value) => emit('token', key, value, component)"
      @component="emit('component', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
  .detail-panel {
    display: grid;
    gap: 12px;
    padding-top: 16px;
  }

  p {
    margin: 0;
    color: var(--sl-color-gray-2);
    font-size: 13px;
  }
</style>
