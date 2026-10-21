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
    watch,
    watchEffect,
    type PropType,
    type VNodeChild,
  } from 'vue';

  import {
    createCarousel,
    getCarouselAutoPlay,
    getCarouselIndexes,
  } from '@sdata/web-core/carousel/foundation';

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
  import { useI18n } from '../locale';
  import CarouselArrow from './carousel-arrow.vue';
  import CarouselIndicator from './carousel-indicator.vue';
  import { carouselInjectionKey } from './context';

  const VNodeRenderer = (_props: { content?: VNodeChild }) => _props.content;

  defineOptions({ name: 'Carousel' });

  const props = defineProps({
    /**
     * @zh 当前幻灯片下标（受控）
     * @en Index of the current slide (controlled)
     */
    current: Number,
    /**
     * @zh 默认幻灯片下标（非受控）
     * @en Index of the initially active slide (uncontrolled state)
     */
    defaultCurrent: {
      type: Number,
      default: 1,
    },
    /**
     * @zh 是否自动播放，可配置间隔等参数
     * @en Whether to autoplay; accepts interval and related options
     */
    autoPlay: {
      type: [Boolean, Object] as PropType<boolean | CarouselAutoPlayConfig>,
      default: false,
    },
    /**
     * @zh 切换动画的时长（毫秒）
     * @en Duration of the slide transition in milliseconds
     */
    moveSpeed: {
      type: Number,
      default: 500,
    },
    /**
     * @zh 切换动画类型
     * @en Transition used when sliding
     */
    animationName: {
      type: String as PropType<'slide' | 'fade' | 'card'>,
      default: 'slide',
    },
    /**
     * @zh 切换的触发方式
     * @en Trigger behaviour of the carousel
     */
    trigger: {
      type: String as PropType<CarouselTriggerEvent>,
      default: 'click',
    },
    /**
     * @zh 幻灯片排列方向
     * @en Direction the slides are laid out in
     */
    direction: {
      type: String as PropType<Direction>,
      default: 'horizontal',
    },
    /**
     * @zh 是否显示左右箭头
     * @en Whether to show the previous/next arrows
     */
    showArrow: {
      type: String as PropType<CarouselArrowType>,
      default: 'always',
    },
    /**
     * @zh 箭头的类名
     * @en Class name of the arrows
     */
    arrowClass: {
      type: String,
      default: '',
    },
    /**
     * @zh 指示器的类型
     * @en Type of the indicators
     */
    indicatorType: {
      type: String as PropType<CarouselIndicatorType>,
      default: 'dot',
    },
    /**
     * @zh 指示器的位置
     * @en Position of the indicators
     */
    indicatorPosition: {
      type: String as PropType<CarouselIndicatorPosition>,
      default: 'bottom',
    },
    /**
     * @zh 指示器的类名
     * @en Class name of the indicators
     */
    indicatorClass: {
      type: String,
      default: '',
    },
    /**
     * @zh 切换动画的缓动函数
     * @en Easing function of the slide transition
     */
    transitionTimingFunction: {
      type: String,
      default: 'cubic-bezier(0.34, 0.69, 0.1, 1)',
    },
  });

  const emit = defineEmits<{
    'update:current': [_index: number];
    /**
     * @zh 幻灯片切换时触发
     * @en Trigger when the slide changes
     */
    'change': [_index: number, _prevIndex: number, _isManual: boolean];
  }>();

  const slots = useSlots();
  const { t } = useI18n();
  const prefixCls = getPrefixCls('carousel');
  const isPause = ref(false);
  const previousIndex = ref<number>();
  const slideDirection = ref<'positive' | 'negative'>();
  const computedAutoPlay = computed(() => getCarouselAutoPlay(props.autoPlay));
  const { children, components } = useChildrenComponents('CarouselItem');
  const innerIndex = ref(props.defaultCurrent - 1);
  const mergedIndexes = computed(() =>
    getCarouselIndexes(props.current, innerIndex.value, components.value.length),
  );
  const foundation = createCarousel({
    props,
    get count() {
      return components.value.length;
    },
    get indexes() {
      return mergedIndexes.value;
    },
    get autoPlay() {
      return computedAutoPlay.value;
    },
    get innerIndex() {
      return innerIndex.value;
    },
    set innerIndex(value) {
      innerIndex.value = value;
    },
    get previousIndex() {
      return previousIndex.value;
    },
    set previousIndex(value) {
      previousIndex.value = value;
    },
    get slideDirection() {
      return slideDirection.value;
    },
    set slideDirection(value) {
      slideDirection.value = value;
    },
    get paused() {
      return isPause.value;
    },
    set paused(value) {
      isPause.value = value;
    },
    setInterval: (callback, delay) => window.setInterval(callback, delay),
    clearInterval: (timer) => window.clearInterval(timer),
    setTimeout: (callback, delay) => window.setTimeout(callback, delay),
    clearTimeout: (timer) => window.clearTimeout(timer),
    onUpdate: (index) => emit('update:current', index),
    onChange: (index, previous, manual) => emit('change', index, previous, manual),
  });
  watch([() => props.current, () => components.value.length], foundation.syncIndex);
  const slideTo = foundation.slideTo;

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

  watchEffect(foundation.syncAutoPlay);
  onBeforeUnmount(foundation.dispose);
  const onPreviousClick = foundation.prev;
  const onNextClick = foundation.next;
  const onSelect = foundation.select;
  const onKeydown = foundation.keydown;
  const eventListeners = { mouseenter: foundation.enter, mouseleave: foundation.leave };
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
  /**
   * @zh 切换到上一张
   * @en Go to the previous slide
   */
  const prev = () => onPreviousClick();
  /**
   * @zh 切换到下一张
   * @en Go to the next slide
   */
  const next = () => onNextClick();
  /**
   * @zh 切换到指定 slide（从 1 开始，与 current/change 的序号一致）
   * @en Go to the given slide (1-based, consistent with current/change)
   */
  const goTo = (index: number) => foundation.goTo(index);

  defineExpose({ prev, next, goTo });
</script>
