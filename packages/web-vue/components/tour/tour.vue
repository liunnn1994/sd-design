<script setup lang="ts">
  import type { Config, PopoverDOM, State } from 'driver.js';

  import type { VNodeChild } from 'vue';
  import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';

  import { useResizeObserver } from '@vueuse/core';
  import { driver } from 'driver.js';
  import { omitBy } from 'es-toolkit';

  import type { TourSlotProps } from './types';

  defineOptions({ name: 'Tour', inheritAttrs: false });

  // Vue 会将未传入的 Boolean prop 转为 false；保留 undefined 才能沿用 driver.js 默认值。
  const props = withDefaults(defineProps<Config>(), {
    animate: undefined,
    smoothScroll: undefined,
    allowClose: undefined,
    allowScroll: undefined,
    disableActiveInteraction: undefined,
    advanceOnClick: undefined,
    skipMissingElement: undefined,
    allowKeyboardControl: undefined,
    showProgress: undefined,
  });

  const slots = defineSlots<{
    default?: () => VNodeChild;
    title?: (props: TourSlotProps) => VNodeChild;
    description?: (props: TourSlotProps) => VNodeChild;
    progress?: (props: TourSlotProps) => VNodeChild;
    footer?: (props: TourSlotProps) => VNodeChild;
  }>();
  const popover = shallowRef<PopoverDOM>();
  const slotProps = computed<TourSlotProps | undefined>(() => {
    if (!popover.value) return undefined;
    const step = instance.getActiveStep();
    if (!step) return undefined;
    return {
      driver: instance,
      step,
      index: instance.getActiveIndex(),
      state: instance.getState() as State,
      element: instance.getActiveElement(),
    };
  });

  const getConfig = () => omitBy(props, (value) => value === undefined);
  const instance = driver(getConfig());

  watch(getConfig, (config) => instance.setConfig(config), { deep: true });
  let refreshFrame: number | undefined;
  function scheduleRefresh() {
    if (refreshFrame !== undefined) return;
    const refresh = () => {
      refreshFrame = undefined;
      if (!popover.value?.wrapper.isConnected || !instance.isActive()) return;
      const state: State = instance.getState();
      // 原生过渡完成前 refresh() 仍使用上一步的定位信息。
      if (state.__transitionCallback) {
        refreshFrame = requestAnimationFrame(refresh);
        return;
      }
      instance.refresh();
    };
    refreshFrame = requestAnimationFrame(refresh);
  }

  // driver.js 的全部入口（含步骤级回调、highlight / setSteps）保持原样。
  // 仅观察 body 的直接子节点，接入当前实例创建和移除的浮层。
  let observer: MutationObserver | undefined;
  onMounted(() => {
    observer = new MutationObserver(() => {
      const current: PopoverDOM | undefined = instance.getState('popover');
      if (!current?.wrapper.isConnected) {
        popover.value = undefined;
        return;
      }
      if (current === popover.value) return;
      for (const name of ['title', 'description', 'footer', 'progress'] as const) {
        if (!slots[name] || (name === 'progress' && slots.footer)) continue;
        current[name].replaceChildren();
        current[name].style.display = name === 'footer' ? 'flex' : 'block';
        if (name === 'progress') current.footer.style.display = 'flex';
      }
      popover.value = current;
      scheduleRefresh();
    });
    observer.observe(document.body, { childList: true });
  });
  useResizeObserver(() => popover.value?.wrapper, scheduleRefresh);
  onBeforeUnmount(() => {
    observer?.disconnect();
    if (refreshFrame !== undefined) cancelAnimationFrame(refreshFrame);
    instance.destroy();
  });

  defineExpose(instance);
</script>

<template>
  <slot />
  <template v-if="popover && slotProps">
    <Teleport v-if="slots.title" :to="popover.title">
      <slot name="title" v-bind="slotProps" />
    </Teleport>
    <Teleport v-if="slots.description" :to="popover.description">
      <slot name="description" v-bind="slotProps" />
    </Teleport>
    <Teleport v-if="slots.footer" :to="popover.footer">
      <slot name="footer" v-bind="slotProps" />
    </Teleport>
    <Teleport v-else-if="slots.progress" :to="popover.progress">
      <slot name="progress" v-bind="slotProps" />
    </Teleport>
  </template>
</template>
