<script setup lang="ts">
  import { computed, shallowRef, watchEffect } from 'vue';

  import { Tag } from '@sdata/web-vue';
  import {
    useDocumentVisibility,
    useElementVisibility,
    useIntervalFn,
    usePreferredReducedMotion,
  } from '@vueuse/core';
  import { AnimatePresence, motion } from 'motion-v';

  const root = shallowRef<HTMLElement>();
  const visible = useElementVisibility(root);
  const documentVisibility = useDocumentVisibility();
  const reduced = usePreferredReducedMotion();
  const index = shallowRef(0);
  const frameworks = ['Vue', 'React'];
  const running = computed(
    () => visible.value && documentVisibility.value === 'visible' && reduced.value !== 'reduce',
  );
  const timer = useIntervalFn(
    () => {
      index.value = 1 - index.value;
    },
    3200,
    { immediate: false },
  );
  watchEffect(() => {
    if (running.value) timer.resume();
    else timer.pause();
  });
</script>
<template>
  <div ref="root" class="home-framework">
    <span>用你熟悉的方式构建</span>
    <span class="home-framework__window" aria-hidden="true">
      <AnimatePresence mode="wait" :initial="false">
        <motion.span
          :key="index"
          :initial="{ opacity: 0, y: 12 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -12 }"
          :transition="{ duration: reduced === 'reduce' ? 0 : 0.22 }"
        >
          <strong>{{ frameworks[index] }}</strong
          ><Tag size="small" :color="index === 0 ? 'green' : 'orange'">{{
            index === 0 ? '现在可用' : '即将到来'
          }}</Tag>
        </motion.span>
      </AnimatePresence>
    </span>
    <span class="sr-only">Vue 现在可用，React 即将到来。</span>
  </div>
</template>
<style lang="scss" scoped>
  .home-framework {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    margin-top: 24px;
    color: var(--sd-color-text-2);
    font-size: 13px;

    &__window {
      display: inline-grid;
      width: 158px;
      height: 36px;
      overflow: hidden;
      text-align: left;
    }

    &__window > span {
      display: flex;
      grid-area: 1 / 1;
      gap: 10px;
      align-items: center;
    }

    strong {
      color: var(--sd-color-text-1);
      font-size: 19px;
      line-height: 1;
    }

    @media (width < 36rem) {
      gap: 6px;
      font-size: 12px;

      &__window {
        width: 146px;
      }
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    white-space: nowrap;
    clip-path: inset(50%);
  }
</style>
