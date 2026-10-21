<template>
  <span ref="root" v-bind="nodeEvents" :class="prefixCls">
    <Image
      v-if="src && !node.loading"
      :key="src"
      :src="src"
      :alt="node.alt"
      :title="node.title ?? undefined"
      :loading="lazy ? 'lazy' : 'eager'"
      :show-loader="usePlaceholder"
      :hide-footer="true"
      @load="handleLoad"
      @error="handleError"
      @click="handleClick"
    />
    <span v-if="node.title" :class="`${prefixCls}-caption`">{{ node.title }}</span>
    <slot v-if="usePlaceholder && !loaded && !failed" name="placeholder" v-bind="slotProps" />
    <slot v-if="failed" name="error" v-bind="slotProps" />
  </span>
</template>
<script setup lang="ts">
  import type { ImageNodeProps, ImageNode } from 'markstream-vue';

  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';

  import { createMarkdownImageFoundation } from '@sdata/web-core/markdown/image';
  import { useMarkstreamNodeLifecycle } from 'markstream-vue';

  import { getPrefixCls } from '../../_utils/global-config';
  import Image from '../../image';
  import { useNodeEvents } from './use-node-events';
  defineOptions({ inheritAttrs: false });
  const nodeEvents = useNodeEvents();
  const {
    node,
    indexKey = '',
    fallbackSrc = '',
    lazy = false,
    usePlaceholder = true,
  } = defineProps<ImageNodeProps & { indexKey?: string | number }>();
  defineSlots<InstanceType<typeof ImageNode>['$slots']>();
  const emit = defineEmits<{
    load: [src: string];
    error: [src: string];
    click: [payload: [MouseEvent, string]];
  }>();
  const prefixCls = getPrefixCls('markdown-render-image');
  const root = ref<HTMLElement | null>(null);
  const fallback = ref(false);
  const loaded = ref(false);
  const failed = ref(false);

  const lifecycle = useMarkstreamNodeLifecycle();
  const foundation = createMarkdownImageFoundation(
    {
      get fallback() {
        return fallback.value;
      },
      set fallback(value) {
        fallback.value = value;
      },
      get loaded() {
        return loaded.value;
      },
      set loaded(value) {
        loaded.value = value;
      },
      get failed() {
        return failed.value;
      },
      set failed(value) {
        failed.value = value;
      },
      get nodeSrc() {
        return node.src;
      },
      get fallbackSrc() {
        return fallbackSrc;
      },
      get indexKey() {
        return indexKey;
      },
      get src(): string {
        return src.value;
      },
      get root() {
        return root.value;
      },
    },
    lifecycle,
    nextTick,
    (value) => emit('load', value),
    (value) => emit('error', value),
    (payload) => emit('click', payload),
  );
  const src = computed(foundation.getSrc);
  const { handleLoad, handleError, handleClick, settlePending } = foundation;

  const slotProps = computed(() => ({
    node,
    displaySrc: src.value,
    imageLoaded: loaded.value,
    hasError: failed.value,
    fallbackSrc,
    lazy,
  }));
  watch(
    () => [node.src, node.loading, fallbackSrc, indexKey],
    (_value, _previous, onCleanup) => foundation.reset(onCleanup),
    { immediate: true },
  );

  onBeforeUnmount(() => settlePending());
</script>
