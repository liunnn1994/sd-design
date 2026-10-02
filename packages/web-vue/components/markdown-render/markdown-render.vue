<template>
  <UpstreamMarkdownRender
    ref="renderer"
    v-bind="{ ...props, ...$attrs }"
    :class="cls"
    :is-dark="resolvedDark"
    @copy="emit('copy', $event)"
    @copy-code="emit('copy-code', $event)"
    @click="(event, referenceId) => emit('click', event, referenceId)"
    @mouseover="emit('mouseover', $event)"
    @mouseout="emit('mouseout', $event)"
    @handle-artifact-click="emit('handleArtifactClick', $event)"
    @virtual-state-change="emit('virtual-state-change', $event)"
    @height-change="emit('height-change', $event)"
    @render-settled="emit('render-settled', $event)"
    @render-final="emit('render-final', $event)"
    @anchor-change="emit('anchor-change', $event)"
  />
</template>
<script setup lang="ts">
  import { computed, inject, provide, ref } from 'vue';

  import { MarkdownRender as UpstreamMarkdownRender } from 'markstream-vue';

  import type {
    MarkdownRenderProps,
    MarkdownRenderEmits,
    MarkdownRenderMethods,
    UpstreamMarkdownRenderInstance,
  } from './types';

  import { useThemeMode } from '../_hooks/use-theme-mode';
  import { getPrefixCls } from '../_utils/global-config';
  import { inheritedThemeInjectionKey } from '../config-provider/context';
  import { markdownContextKey, provideMarkdownComponents } from './context';
  import { markdownComponents } from './nodes';
  defineOptions({ name: 'MarkdownRender', inheritAttrs: false });
  /**
   * 这里只为「布尔或布尔字面量联合」属性显式写入 undefined，其余默认值一律交给上游。
   * SFC 编译器会把 `flag?: boolean` 声明成 `{ type: Boolean }`，Vue 的布尔 casting 会把
   * 未传入的布尔属性读成 false；写 undefined 可以让「未传」保持未传，改由上游组件
   * 决定默认值（含 codeBlockStream=true、smoothStreaming='auto' 等），避免复制一份
   * 上游默认值后在上游升级时静默漂移。
   */
  const props = withDefaults(defineProps<MarkdownRenderProps>(), {
    final: undefined,
    debugPerformance: undefined,
    viewportPriority: undefined,
    codeBlockStream: undefined,
    renderCodeBlocksAsPre: undefined,
    showTooltips: undefined,
    isDark: undefined,
    typewriter: undefined,
    smoothStreaming: undefined,
    fade: undefined,
    batchRendering: undefined,
    deferNodesUntilVisible: undefined,
    nodeVirtual: undefined,
    renderAsFragment: undefined,
  });
  /** @zh 事件名称和载荷与上游一致，每次仅转发一次。 @en Forward upstream events exactly once. */
  const emit = defineEmits<MarkdownRenderEmits>();
  const renderer = ref<UpstreamMarkdownRenderInstance | null>(null);
  const element = computed(() =>
    typeof HTMLElement !== 'undefined' && renderer.value?.$el instanceof HTMLElement
      ? renderer.value.$el
      : null,
  );
  const themeMode = useThemeMode(element);
  const inheritedTheme = inject(inheritedThemeInjectionKey, undefined);
  const resolvedDark = computed(
    () => props.isDark ?? (inheritedTheme?.mode.value ?? themeMode.value) === 'dark',
  );
  const cls = computed(() => [getPrefixCls('markdown-render')]);
  provideMarkdownComponents(markdownComponents, () => props.customId);
  provide(
    markdownContextKey,
    computed(() => ({ ...props, isDark: resolvedDark.value })),
  );
  defineExpose<MarkdownRenderMethods>({
    getVirtualMetrics: (...args) => renderer.value!.getVirtualMetrics(...args),
    captureVirtualState: (...args) => renderer.value!.captureVirtualState(...args),
    restoreVirtualState: (...args) => renderer.value!.restoreVirtualState(...args),
    forceMeasure: (...args) => renderer.value!.forceMeasure(...args),
    settle: (...args) => renderer.value!.settle(...args),
    scrollToNode: (...args) => renderer.value!.scrollToNode(...args),
  });
</script>
