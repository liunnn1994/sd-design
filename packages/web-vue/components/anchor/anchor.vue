<template>
  <component :is="wrapperComponent" v-bind="wrapperProps">
    <div ref="anchorRef" role="navigation" :aria-label="t('a11y.anchorNav')" :class="cls">
      <div v-if="!lineLess" ref="lineSliderRef" :class="`${prefixCls}-line-slider`" />
      <ul :class="`${prefixCls}-list`">
        <slot />
      </ul>
    </div>
  </component>
</template>

<script setup lang="ts">
  import type { CSSProperties } from 'vue';
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    PropType,
    provide,
    reactive,
    ref,
    watch,
    watchPostEffect,
  } from 'vue';

  import { createAnchor } from '@sdata/web-core/anchor/foundation';

  import { getPrefixCls } from '../_utils/global-config';
  import { isNumber } from '../_utils/is';
  import Affix from '../affix';
  import { useI18n } from '../locale';
  import { anchorInjectionKey } from './context';
  import { BOUNDARY_POSITIONS, type BoundaryPosition } from './utils';

  const DIRECTIONS = ['vertical', 'horizontal'] as const;
  type Direction = (typeof DIRECTIONS)[number];

  defineOptions({ name: 'Anchor' });

  const emit = defineEmits<{
    /**
     * @zh 用户点击链接时触发
     * @en Triggered when the user clicks on the link
     * @property { string | undefined } hash
     * @property {string} preHash
     */
    select: [_hash: string | undefined, _preHash: string];
    /**
     * @zh 链接发生改变时触发
     * @en Triggered when the link changes
     * @property {string} hash
     */
    change: [_hash: string];
  }>();

  const props = defineProps({
    /**
     * @zh 滚动边界值，设置该值为数字后，将会在距离滚动容器 `boundary` 距离时停止滚动。
     * @en Scrolling boundary value. After setting the value to a number, it will stop scrolling when the distance is `boundary` from the scrolling container.
     * @values 'start', 'end', 'center', 'nearest', number
     */
    boundary: {
      type: [Number, String] as PropType<BoundaryPosition | number>,
      default: 'start',
      validator: (value: BoundaryPosition | number) => {
        return isNumber(value) || BOUNDARY_POSITIONS.includes(value);
      },
    },
    /**
     * @zh 是否显示左侧轴线
     * @en Whether to show the left axis
     */
    lineLess: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 是否固定
     * @en Whether to wrap anchor within Affix
     */
    affix: {
      type: Boolean,
      default: false,
    },
    /**
     * @zh 设置 Affix 组件的样式
     * @en The style to be applied to Affix
     */
    affixStyle: {
      type: Object as PropType<CSSProperties>,
    },
    /**
     * @zh 距离窗口顶部的偏移量
     * @en Offset from the top of the viewport
     */
    offsetTop: {
      type: Number,
      default: 0,
    },
    /**
     * @zh 距离窗口底部的偏移量
     * @en Offset from the bottom of the viewport
     */
    offsetBottom: {
      type: Number,
    },
    /**
     * @zh 锚点方向
     * @en Direction
     * @values 'vertical', 'horizontal'
     */
    direction: {
      type: String as PropType<Direction>,
      default: 'vertical',
      validator: (value: string) => ['vertical', 'horizontal'].includes(value),
    },
    /**
     * @zh 锚点区域边界相对于滚动容器顶部的偏移量。未设置时，默认值为滚动容器高度的一半
     * @en The offset of the baseline relative to the top of the container. The value is half of the height of the scrolling container if not specified
     */
    targetOffset: {
      type: Number,
    },
    /**
     * @zh 滚动容器
     * @en Scroll container
     */
    scrollContainer: {
      type: [String, Object] as PropType<string | HTMLElement | Window>,
    },
    /**
     * @zh 是否改变hash。设置为 `false` 时点击锚点不会改变页面的 hash
     * @en Whether to change the hash. When set to `false`, clicking on the anchor will not change the hash of the page
     */
    changeHash: {
      type: Boolean,
      default: true,
    },
    /**
     * @zh 是否使用平滑滚动
     * @en Whether to use smooth scrolling
     */
    smooth: {
      type: Boolean,
      default: true,
    },
  });

  const { t } = useI18n();

  const prefixCls = getPrefixCls('anchor');
  const anchorRef = ref<HTMLElement>();
  const lineSliderRef = ref<HTMLElement>();
  const links = reactive<Record<string, HTMLElement>>({});
  const currentLink = ref('');
  const isScrolling = ref(false);

  const scrollContainerEle = ref<HTMLElement | Window>();
  const containerEle = ref<HTMLElement>();

  const foundation = createAnchor({
    props,
    links,
    get line() {
      return lineSliderRef.value;
    },
    get current() {
      return currentLink.value;
    },
    set current(value) {
      currentLink.value = value;
    },
    get scrolling() {
      return isScrolling.value;
    },
    set scrolling(value) {
      isScrolling.value = value;
    },
    get scrollContainer() {
      return scrollContainerEle.value;
    },
    set scrollContainer(value) {
      scrollContainerEle.value = value;
    },
    get container() {
      return containerEle.value;
    },
    set container(value) {
      containerEle.value = value;
    },
    afterRender: (callback) => {
      void nextTick(callback);
    },
    onChange: (hash) => emit('change', hash),
    onSelect: (hash, previous) => emit('select', hash, previous),
  });
  const addLink = foundation.addLink;
  const removeLink = foundation.removeLink;
  const handleClick = foundation.click;
  watchPostEffect(foundation.syncLine);
  watch(() => props.scrollContainer, foundation.containerChanged, { flush: 'post' });
  onMounted(foundation.mount);
  onBeforeUnmount(foundation.dispose);

  provide(
    anchorInjectionKey,
    reactive({
      currentLink,
      addLink,
      removeLink,
      handleClick,
    }),
  );

  const cls = computed(() => [
    prefixCls,
    {
      [`${prefixCls}-line-less`]: props.lineLess,
      [`${prefixCls}-horizontal`]: props.direction === 'horizontal',
    },
  ]);

  // 返回组件对象而非字符串：字符串组件名只在全局注册表里解析，
  // 默认前缀下 Affix 注册名为 SdAffix，'Affix' 会解析失败渲染成未知元素
  const wrapperComponent = computed(() => (props.affix ? Affix : 'div'));

  const wrapperProps = computed(() => {
    if (!props.affix) {
      return {};
    }

    return {
      offsetTop: props.offsetTop,
      offsetBottom: props.offsetBottom,
      target: props.scrollContainer,
      style: props.affixStyle,
    };
  });
</script>
