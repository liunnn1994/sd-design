<script setup lang="ts">
  import type { Config, Driver as TourController } from 'driver.js';

  import type { VNodeChild } from 'vue';
  import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';

  import { driver } from '@sdata/web-core/tour/engine';
  import {
    createTourPopover,
    getTourConfig,
    getTourSlotProps,
  } from '@sdata/web-core/tour/foundation';
  import { useResizeObserver } from '@vueuse/core';

  import type { TourPopoverDom as PopoverDOM, TourSlotProps } from './types';

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
  const slotProps = computed<TourSlotProps | undefined>(() =>
    getTourSlotProps(instance, popover.value),
  );
  const getConfig = () => getTourConfig(props);
  const instance: TourController = driver(getConfig());
  watch(getConfig, (config) => instance.setConfig(config), { deep: true });
  const foundation = createTourPopover({
    driver: instance,
    slots,
    get popover() {
      return popover.value;
    },
    set popover(value) {
      popover.value = value;
    },
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (frame) => cancelAnimationFrame(frame),
    observe(callback) {
      const observer = new MutationObserver(callback);
      observer.observe(document.body, { childList: true });
      return () => observer.disconnect();
    },
  });
  onMounted(foundation.connect);
  useResizeObserver(() => popover.value?.wrapper, foundation.scheduleRefresh);
  onBeforeUnmount(foundation.dispose);

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
