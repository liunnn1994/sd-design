<template>
  <RenderFirstChild />
</template>

<script setup lang="ts">
  import type { ComponentPublicInstance, VNode } from 'vue';
  import { cloneVNode, computed, onMounted, onUnmounted, ref, watch } from 'vue';

  import ResizeObserver from 'resize-observer-polyfill';

  import { isComponentInstance } from '../_utils/is';
  import { getFirstComponent } from '../_utils/vue-utils';

  defineOptions({ name: 'ResizeObserver' });

  const emit = defineEmits<{
    /** resize 事件 */
    resize: [entry: ResizeObserverEntry];
  }>();
  const slots = defineSlots<{
    default?: () => VNode[];
  }>();
  const componentRef = ref<HTMLElement | ComponentPublicInstance>();
  const element = computed<HTMLElement | undefined>(() =>
    isComponentInstance(componentRef.value) ? componentRef.value.$el : componentRef.value,
  );
  let resizeObserver: ResizeObserver | null;
  const createResizeObserver = (target: HTMLElement) => {
    if (!target || target.nodeType !== 1) return;
    resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      emit('resize', entries[0]);
    });
    resizeObserver.observe(target);
  };
  const destroyResizeObserver = () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  };
  const RenderFirstChild = () => {
    const firstChild = getFirstComponent(slots.default?.() ?? []);
    return firstChild ? cloneVNode(firstChild, { ref: componentRef }, true) : null;
  };

  watch(element, (currentElement) => {
    if (resizeObserver) destroyResizeObserver();
    if (currentElement) createResizeObserver(currentElement);
  });
  onMounted(() => {
    if (element.value) createResizeObserver(element.value);
  });
  onUnmounted(destroyResizeObserver);
</script>
