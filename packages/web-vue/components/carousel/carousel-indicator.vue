<template>
  <div :class="cls" v-bind="eventHandlers">
    <span
      v-if="type === 'slider'"
      :style="sliderStyle"
      :aria-label="t('a11y.slideOf', activeIndex + 1, count)"
      :class="[`${prefixCls}-item`, `${prefixCls}-item-active`]"
    />
    <template v-else>
      <span
        v-for="(_, index) in Array(count)"
        :key="index"
        role="button"
        tabindex="0"
        :data-index="index"
        :aria-label="t('a11y.goToSlide', index + 1)"
        :aria-current="index === activeIndex ? 'true' : undefined"
        :class="[`${prefixCls}-item`, { [`${prefixCls}-item-active`]: index === activeIndex }]"
        @keydown="onItemKeydown($event, index)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue';
  import { computed } from 'vue';

  import {
    createCarouselIndicator,
    getCarouselSliderStyle,
  } from '@sdata/web-core/carousel/indicator';

  import type {
    CarouselIndicatorPosition,
    CarouselIndicatorType,
    CarouselTriggerEvent,
  } from './interface';

  import { getPrefixCls } from '../_utils/global-config';
  import { useI18n } from '../locale';

  defineOptions({ name: 'Indicator' });

  const props = defineProps({
    count: {
      type: Number,
      default: 2,
    },
    activeIndex: {
      type: Number,
      default: 0,
    },
    type: {
      type: String as PropType<CarouselIndicatorType>,
      default: 'line',
    },
    position: {
      type: String as PropType<CarouselIndicatorPosition>,
      default: 'bottom',
    },
    trigger: {
      type: String as PropType<CarouselTriggerEvent>,
      default: 'click',
    },
  });

  const emit = defineEmits<{
    select: [_index: number];
  }>();

  const { t } = useI18n();

  const prefixCls = getPrefixCls('carousel-indicator');

  const foundation = createCarouselIndicator({ props, onSelect: (index) => emit('select', index) });
  const onClick = foundation.click;
  const onItemKeydown = foundation.keydown;

  const eventHandlers = computed(() => {
    return props.trigger === 'click' ? { onClick } : { onMouseover: onClick };
  });

  const cls = computed(() => [
    `${prefixCls}`,
    `${prefixCls}-${props.type}`,
    `${prefixCls}-${props.position}`,
  ]);

  const sliderStyle = computed(() => getCarouselSliderStyle(props.count, props.activeIndex));
</script>
