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

  import { sanitizeImageSrc, useMarkstreamNodeLifecycle } from 'markstream-vue';

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
  const src = computed(
    () =>
      sanitizeImageSrc(fallback.value ? fallbackSrc : node.src) ||
      sanitizeImageSrc(fallbackSrc) ||
      '',
  );
  const lifecycle = useMarkstreamNodeLifecycle();
  let pending: { key: string | number } | undefined;
  const settlePending = (request = pending) => {
    if (!request || request !== pending) return;
    pending = undefined;
    lifecycle?.markSettled(request.key);
  };
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
    (_value, _previous, onCleanup) => {
      fallback.value = false;
      loaded.value = false;
      failed.value = !src.value;
      if (src.value) {
        const request = { key: indexKey };
        pending = request;
        lifecycle?.markPending(request.key);
        onCleanup(() => settlePending(request));
      }
    },
    { immediate: true },
  );
  const settle = async () => {
    const request = pending;
    await nextTick();
    if (!request || request !== pending) return;
    if (root.value) lifecycle?.reportHeight(request.key, root.value.offsetHeight);
    settlePending(request);
  };
  function handleLoad() {
    loaded.value = true;
    emit('load', src.value);
    void settle();
  }
  function handleError() {
    if (!fallback.value && sanitizeImageSrc(fallbackSrc) && fallbackSrc !== src.value) {
      fallback.value = true;
      return;
    }
    failed.value = true;
    emit('error', src.value);
    void settle();
  }
  function handleClick(event: MouseEvent) {
    if (loaded.value) emit('click', [event, src.value]);
  }
  onBeforeUnmount(() => settlePending());
</script>
