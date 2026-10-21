<template>
  <ResizeObserver @resize="updatePositionThrottle">
    <div ref="wrapperRef">
      <div v-if="isFixed" :style="placeholderStyles" />
      <div ref="contentRef" :class="classNames" :style="fixedStyles">
        <ResizeObserver @resize="updatePositionThrottle">
          <slot />
        </ResizeObserver>
      </div>
    </div>
  </ResizeObserver>
</template>

<script setup lang="ts">
  import type { CSSProperties, PropType, Ref } from 'vue';
  import { ref, watch, watchEffect, computed, onMounted, onBeforeUnmount } from 'vue';

  import { createAffix } from '@sdata/web-core/affix/foundation';

  import ResizeObserver from '../_components/resize-observer.vue';
  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'Affix' });

  const emit = defineEmits<{
    /**
     * @zh 固定状态发生改变时触发
     * @en Triggered when the fixed state changes
     * @param {boolean} fixed
     */
    change: [_fixed: boolean];
  }>();

  const props = defineProps({
    /**
     * @zh 距离窗口顶部达到指定偏移量后触发
     * @en Triggered when the specified offset is reached from the top of the window
     */
    offsetTop: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 距离窗口底部达到指定偏移量后触发
     * @en Triggered when the specified offset is reached from the bottom of the window
     */
    offsetBottom: {
      type: Number,
    },
    /**
     * @zh 滚动容器，默认是 `window`
     * @en Scroll container, default is `window`
     */
    target: {
      type: [String, Object, Function] as PropType<string | HTMLElement | Window>,
    },
    /**
     * @zh `target`的外层滚动元素，默认是 `window`。`Affix `将会监听该元素的滚动事件，并实时更新固钉的位置。主要是为了解决 `target` 属性指定为非 `window` 元素时，如果外层元素滚动，可能会导致固钉跑出容器问题
     * @en The outer scroll element of `target`, the default is `window`. `Affix` will monitor the scroll event of the element and update the position of the anchor in real time. The main purpose is to solve the problem that if the outer element scrolls when the target attribute is specified as a non-window element, it may cause the nail to escape from the container.
     */
    targetContainer: {
      type: [String, Object, Function] as PropType<string | HTMLElement | Window>,
    },
  });

  const prefixCls = getPrefixCls('affix');
  const wrapperRef = ref<HTMLElement>();
  const contentRef = ref<HTMLElement>();
  const targetRef = ref<HTMLElement | Window>();
  const isFixed = ref(false);
  const placeholderStyles: Ref<CSSProperties> = ref({});
  const fixedStyles: Ref<CSSProperties> = ref({});
  const classNames = computed(() => ({ [prefixCls]: isFixed.value }));

  const foundation = createAffix({
    props,
    get wrapper() {
      return wrapperRef.value;
    },
    get content() {
      return contentRef.value;
    },
    get fixed() {
      return isFixed.value;
    },
    get target() {
      return targetRef.value;
    },
    set target(value) {
      targetRef.value = value;
    },
    setFixed(value) {
      isFixed.value = value;
    },
    onChange: (value) => emit('change', value),
    setPlaceholder(value) {
      placeholderStyles.value = value;
    },
    setStyle(value) {
      fixedStyles.value = value;
    },
  });
  const updatePositionThrottle = foundation.update;
  watch(() => [props.offsetTop, props.offsetBottom], updatePositionThrottle);
  watch(
    () => props.target,
    () => updatePositionThrottle(),
    { flush: 'post' },
  );
  onMounted(() => {
    watchEffect((onInvalidate) => {
      onInvalidate(foundation.bindTarget());
    });
    watchEffect((onInvalidate) => {
      const dispose = foundation.bindContainer();
      if (dispose) onInvalidate(dispose);
    });
  });
  onBeforeUnmount(foundation.dispose);

  /**
   * @zh 更新位置
   * @en Update position
   * @public
   */
  const updatePosition = () => {
    updatePositionThrottle();
  };

  defineExpose({ updatePosition });
</script>
