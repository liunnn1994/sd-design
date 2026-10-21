<template>
  <div
    role="group"
    aria-roledescription="slide"
    :aria-label="t('a11y.slideOf', index + 1, slideCount)"
    :aria-hidden="!isCurrent"
    :class="cls"
    :style="animationStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { getCurrentInstance, inject, computed } from 'vue';

  import { getCarouselItemState, getCarouselAnimationStyle } from '@sdata/web-core/carousel/item';

  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';
  import { carouselInjectionKey, CarouselContext } from './context';

  defineOptions({ name: 'CarouselItem' });

  const { t } = useI18n();

  const prefixCls = getPrefixCls('carousel-item');
  const instance = getCurrentInstance();
  const context = inject<Partial<CarouselContext>>(carouselInjectionKey, {});
  const index = computed(() => context.items?.indexOf(instance?.uid ?? -1) ?? -1);
  const slideCount = computed(() => context.items?.length ?? 0);
  const itemState = computed(() => getCarouselItemState(index.value, context));
  const isCurrent = computed(() => itemState.value.current);
  const cls = computed(() => ({
    [`${prefixCls}-prev`]: itemState.value.prev,
    [`${prefixCls}-next`]: itemState.value.next,
    [`${prefixCls}-current`]: isCurrent.value,
    [`${prefixCls}-slide-in`]: itemState.value.slideIn,
    [`${prefixCls}-slide-out`]: itemState.value.slideOut,
  }));
  const animationStyle = computed(() =>
    getCarouselAnimationStyle(context.transitionTimingFunction, context.moveSpeed),
  );
</script>
