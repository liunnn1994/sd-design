<template>
  <RenderFirstChild />
</template>

<script setup lang="ts">
  import type { ComponentPublicInstance, VNode } from 'vue';
  import { cloneVNode, computed, onMounted, onUnmounted, ref, watch } from 'vue';

  import { isComponentInstance } from '../_utils/is';
  import { createResizeObserverController } from '../_utils/resize-observer';
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
  const observer = createResizeObserverController((entry) => emit('resize', entry));
  const observe = (target: HTMLElement | undefined) =>
    observer.observe(target?.nodeType === 1 ? target : undefined);
  const RenderFirstChild = () => {
    const firstChild = getFirstComponent(slots.default?.() ?? []);
    return firstChild ? cloneVNode(firstChild, { ref: componentRef }, true) : null;
  };

  watch(element, observe);
  onMounted(() => observe(element.value));
  onUnmounted(observer.disconnect);
</script>
