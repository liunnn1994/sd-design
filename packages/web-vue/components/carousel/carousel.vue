<template>
  <div
    :class="cls"
    role="region"
    aria-roledescription="carousel"
    :aria-label="t('a11y.carousel')"
    tabindex="0"
    v-on="eventListeners"
    @keydown="onKeydown"
  >
    <div :class="contentCls">
      <VNodeRenderer :content="getChildren()" />
    </div>
    <div v-if="hasIndicator" :class="indicatorCls">
      <CarouselIndicator
        :class="props.indicatorClass"
        :type="props.indicatorType"
        :count="components.length"
        :active-index="mergedIndexes.mergedIndex"
        :position="props.indicatorPosition"
        :trigger="props.trigger"
        @select="onSelect"
      />
    </div>
    <CarouselArrow
      v-if="hasArrow"
      :class="props.arrowClass"
      :direction="props.direction"
      :show-arrow="props.showArrow"
      @previous-click="onPreviousClick"
      @next-click="onNextClick"
    />
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    onBeforeUnmount,
    provide,
    reactive,
    ref,
    toRef,
    useSlots,
    watchEffect,
    type PropType,
    type VNodeChild,
  } from 'vue';

  import type {
    CarouselArrowType,
    CarouselAutoPlayConfig,
    CarouselIndicatorPosition,
    CarouselIndicatorType,
    CarouselTriggerEvent,
  } from './interface';

  import { useChildrenComponents } from '../_hooks/use-children-components';
  import { Direction } from '../_utils/constant';
  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber, isObject } from '../_utils/is';
  import { KEYBOARD_KEY } from '../_utils/keyboard';
  import { useI18n } from '../locale';
  import CarouselArrow from './carousel-arrow.vue';
  import CarouselIndicator from './carousel-indicator.vue';
  import { carouselInjectionKey } from './context';

  const DEFAULT_AUTO_PLAY = {
    interval: 3000,
    hoverToPause: true,
  };

  const VNodeRenderer = (_props: { content?: VNodeChild }) => _props.content;

  defineOptions({ name: 'Carousel' });

  const props = defineProps({
    current: Number,
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    autoPlay: {
      type: [Boolean, Object] as PropType<boolean | CarouselAutoPlayConfig>,
      default: false,
    },
    moveSpeed: {
      type: Number,
      default: 500,
    },
    animationName: {
      type: String as PropType<'slide' | 'fade' | 'card'>,
      default: 'slide',
    },
    trigger: {
      type: String as PropType<CarouselTriggerEvent>,
      default: 'click',
    },
    direction: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
    showArrow: {
      type: String as PropType<CarouselArrowType>,
      default: 'always',
    },
    arrowClass: {
      type: String,
      default: '',
    },
    indicatorType: {
      type: String as PropType<CarouselIndicatorType>,
      default: 'dot',
    },
    indicatorPosition: {
      type: String as PropType<CarouselIndicatorPosition>,
      default: 'bottom',
    },
    indicatorClass: {
      type: String,
      default: '',
    },
    transitionTimingFunction: {
      type: String,
      default: 'cubic-bezier(0.34, 0.69, 0.1, 1)',
    },
  });

  const emit = defineEmits({
    'update:current': (_index: number) => true,
    'change': (_index: number, _prevIndex: number, _isManual: boolean) => true,
  });

  const slots = useSlots();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('carousel');
  const isPause = ref(false);
  const previousIndex = ref<number>();
  const slideDirection = ref<'positive' | 'negative'>();
  const computedAutoPlay = computed<CarouselAutoPlayConfig>(() => {
    if (isObject(props.autoPlay)) return { ...DEFAULT_AUTO_PLAY, ...props.autoPlay };
    return props.autoPlay ? DEFAULT_AUTO_PLAY : {};
  });
  let intervalTimer = 0;
  let animationTimer = 0;
  const { children, components } = useChildrenComponents('CarouselItem');
  const innerIndex = ref(props.defaultCurrent - 1);
  const mergedIndexes = computed(() => {
    const childrenLength = components.value.length;
    const mergedIndex = isNumber(props.current)
      ? getValidIndex(props.current - 1, childrenLength)
      : innerIndex.value;
    return {
      mergedIndex,
      mergedPrevIndex: getValidIndex(mergedIndex - 1, childrenLength),
      mergedNextIndex: getValidIndex(mergedIndex + 1, childrenLength),
    };
  });

  const carouselContext = reactive({
    items: components,
    slideTo,
    mergedIndexes,
    previousIndex,
    animationName: toRef(props, 'animationName'),
    slideDirection,
    transitionTimingFunction: toRef(props, 'transitionTimingFunction'),
    moveSpeed: toRef(props, 'moveSpeed'),
  });
  provide(carouselInjectionKey, carouselContext);

  const clearTimer = () => {
    if (intervalTimer) window.clearInterval(intervalTimer);
  };

  watchEffect(() => {
    const { interval } = computedAutoPlay.value || {};
    const { mergedNextIndex } = mergedIndexes.value;
    const shouldInterval = components.value.length > 1 && !isPause.value && Boolean(interval);
    clearTimer();
    if (shouldInterval) {
      intervalTimer = window.setInterval(() => slideTo({ targetIndex: mergedNextIndex }), interval);
    }
  });

  onBeforeUnmount(clearTimer);

  function getValidIndex(index: number, length: number): number {
    const indexNumber = +index;
    return typeof indexNumber === 'number' && !Number.isNaN(indexNumber)
      ? (indexNumber + length) % length
      : index;
  }

  function slideTo({
    targetIndex,
    isNegative = false,
    isManual = false,
  }: {
    targetIndex: number;
    isNegative?: boolean;
    isManual?: boolean;
  }) {
    if (!animationTimer && targetIndex !== mergedIndexes.value.mergedIndex) {
      previousIndex.value = innerIndex.value;
      innerIndex.value = targetIndex;
      slideDirection.value = isNegative ? 'negative' : 'positive';
      animationTimer = window.setTimeout(() => {
        animationTimer = 0;
      }, props.moveSpeed);
      emit('update:current', innerIndex.value + 1);
      emit('change', innerIndex.value + 1, previousIndex.value + 1, isManual);
    }
  }

  const onPreviousClick = () =>
    slideTo({
      targetIndex: mergedIndexes.value.mergedPrevIndex,
      isNegative: true,
      isManual: true,
    });
  const onNextClick = () =>
    slideTo({ targetIndex: mergedIndexes.value.mergedNextIndex, isManual: true });
  const onSelect = (index: number) =>
    slideTo({
      targetIndex: index,
      isNegative: index < mergedIndexes.value.mergedIndex,
      isManual: true,
    });

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === KEYBOARD_KEY.ARROW_RIGHT || event.key === KEYBOARD_KEY.ARROW_DOWN) {
      event.preventDefault();
      onNextClick();
    } else if (event.key === KEYBOARD_KEY.ARROW_LEFT || event.key === KEYBOARD_KEY.ARROW_UP) {
      event.preventDefault();
      onPreviousClick();
    }
  };

  const eventListeners = computed(() =>
    computedAutoPlay.value.hoverToPause
      ? {
          mouseenter: () => {
            isPause.value = true;
          },
          mouseleave: () => {
            isPause.value = false;
          },
        }
      : {},
  );
  const hasIndicator = computed(
    () => props.indicatorType !== 'never' && components.value.length > 1,
  );
  const hasArrow = computed(() => props.showArrow !== 'never' && components.value.length > 1);
  const cls = computed(() => [
    prefixCls,
    `${prefixCls}-indicator-position-${props.indicatorPosition}`,
  ]);
  const contentCls = computed(() => [
    `${prefixCls}-${props.animationName}`,
    `${prefixCls}-${props.direction}`,
    { [`${prefixCls}-negative`]: slideDirection.value === 'negative' },
  ]);
  const indicatorCls = computed(() => [
    `${prefixCls}-indicator-wrapper`,
    `${prefixCls}-indicator-wrapper-${props.indicatorPosition}`,
  ]);

  const getChildren = () => {
    children.value = slots.default?.();
    return children.value;
  };
</script>
