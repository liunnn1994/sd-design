<script setup lang="ts">
  import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue';

  import { createElement } from 'react';
  import { createRoot, type Root } from 'react-dom/client';

  import type { ThemePreviewProps } from './theme-preview-types';

  import ThemeDemo from '../react/home/ThemeDemo';
  import ThemePreviewPanel from '../react/home/ThemePreviewPanel';
  import ThemeWorkspacePage from '../react/home/ThemeWorkspacePage';

  const props = defineProps<
    ThemePreviewProps & { kind?: 'panel' | 'workspace' | 'demo'; mobile?: boolean; path?: string }
  >();
  const host = useTemplateRef<HTMLDivElement>('host');
  let root: Root | undefined;
  function render() {
    if (props.kind === 'workspace')
      root?.render(
        createElement(ThemeWorkspacePage, {
          theme: props.theme,
          themeMode: props.themeMode ?? 'light',
          mobile: props.mobile,
        }),
      );
    else if (props.kind === 'demo')
      root?.render(createElement(ThemeDemo, { theme: props.theme, path: props.path ?? '' }));
    else root?.render(createElement(ThemePreviewPanel, { ...props }));
  }
  onMounted(() => {
    root = createRoot(host.value!);
    render();
  });
  watch(() => ({ ...props }), render, { deep: true });
  onBeforeUnmount(() => root?.unmount());
</script>

<template><div ref="host" data-framework="react" /></template>
