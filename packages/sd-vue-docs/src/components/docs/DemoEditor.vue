<script setup lang="ts">
  import type { Component } from 'vue';
  import { onBeforeUnmount, shallowRef, useId } from 'vue';

  import type { DocsFramework } from '../../utils/framework-navigation';

  const props = withDefaults(
    defineProps<{
      source: string;
      mainFile: string;
      framework?: DocsFramework;
      files?: Record<string, string>;
    }>(),
    { framework: 'vue', files: () => ({}) },
  );

  const expanded = shallowRef(false);
  const panel = shallowRef<Component>();
  const loading = shallowRef(false);
  const loadError = shallowRef('');
  const panelId = `demo-editor-${useId()}`;
  let disposed = false;

  async function toggleEditor() {
    expanded.value = !expanded.value;
    if (!expanded.value || panel.value || loading.value) return;
    loading.value = true;
    loadError.value = '';
    try {
      const module =
        props.framework === 'react'
          ? await import('./ReactReplPanel.vue')
          : await import('./VueReplPanel.vue');
      if (!disposed) panel.value = module.default;
    } catch (error) {
      if (!disposed) loadError.value = error instanceof Error ? error.message : '编辑器加载失败';
    } finally {
      if (!disposed) loading.value = false;
    }
  }

  onBeforeUnmount(() => {
    disposed = true;
  });
</script>

<template>
  <div class="demo-editor" :data-framework="framework">
    <div class="demo-editor__toolbar">
      <button
        class="demo-editor__button"
        type="button"
        :aria-expanded="expanded"
        :aria-controls="panelId"
        @click="toggleEditor"
      >
        {{ expanded ? '收起' : '在线编辑' }}
      </button>
    </div>
    <div v-show="expanded" :id="panelId" class="demo-editor__panel">
      <div v-if="loading" class="demo-editor__state" role="status">编辑器加载中…</div>
      <div
        v-else-if="loadError"
        class="demo-editor__state demo-editor__state--error"
        role="alert"
        >{{ loadError }}</div
      >
      <component :is="panel" v-if="panel" :source="source" :main-file="mainFile" :files="files" />
    </div>
  </div>
</template>

<style lang="scss">
  .demo-editor {
    &__toolbar {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      background: var(--sl-color-gray-7);
    }

    &__button {
      min-height: 32px;
      margin-left: auto;
      padding: 0 12px;
      color: var(--sd-color-text-2);
      font: inherit;
      font-size: 14px;
      background: var(--sd-color-fill-2);
      border: 0;
      border-radius: 8px;
      cursor: pointer;

      &:hover {
        color: rgb(var(--sd-primary-6));
        background: var(--sd-color-primary-light-1);
      }

      &:focus-visible {
        outline: 2px solid rgb(var(--sd-primary-6));
        outline-offset: 2px;
      }
    }

    &__panel {
      border-top: 1px solid var(--sl-color-gray-5);
    }

    &__state {
      padding: 1rem;
      color: var(--sl-color-gray-2);
    }

    &__state--error {
      color: rgb(var(--sd-danger-6));
    }
  }
</style>
