<template>
  <div ref="outerRef" :class="cls" :style="outerStyle">
    <div ref="containerRef" :class="`${prefixCls}-container`" v-bind="$attrs">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type {
    EventListenerArgs,
    EventListeners,
    OverlayScrollbars as OverlayScrollbarsInstance,
  } from 'overlayscrollbars';

  import { computed, onBeforeUnmount, onMounted, PropType, ref, StyleValue, watch } from 'vue';

  import { createScrollbar } from '@sdata/web-core/scrollbar/foundation';
  import { normalizeScrollbarStyle, getScrollbarOptions } from '@sdata/web-core/scrollbar/options';
  import { useResizeObserver } from '@vueuse/core';

  import type { ScrollbarEventListener, ScrollbarPlugin, ScrollbarProps } from './interface';

  import { getPrefixCls } from '../_utils/global-config';

  defineOptions({ name: 'Scrollbar', inheritAttrs: false });

  const props = defineProps({
    /**
     * @zh 类型
     * @en Type
     */
    type: {
      type: String as PropType<'track' | 'embed'>,
      default: 'embed',
    },
    /**
     * @zh 外层的类名
     * @en Outer class
     */
    outerClass: [String, Object, Array],
    /**
     * @zh 外层的样式
     * @en Outer style
     */
    outerStyle: {
      type: [String, Object, Array] as PropType<StyleValue>,
    },
    /**
     * @zh 是否使用绝对 padding。
     * @en Whether padding should be absolute.
     */
    paddingAbsolute: {
      type: Boolean as PropType<ScrollbarProps['paddingAbsolute']>,
      default: undefined,
    },
    /**
     * @zh 是否展示原生 overlay 滚动条。
     * @en Whether to show native overlaid scrollbars.
     */
    showNativeOverlaidScrollbars: {
      type: Boolean as PropType<ScrollbarProps['showNativeOverlaidScrollbars']>,
      default: undefined,
    },
    /**
     * @zh OverlayScrollbars 的 update 配置。
     * @en OverlayScrollbars update options.
     */
    updateOptions: {
      type: Object as PropType<ScrollbarProps['updateOptions']>,
    },
    /**
     * @zh OverlayScrollbars 的 overflow 配置。
     * @en OverlayScrollbars overflow options.
     */
    overflow: {
      type: Object as PropType<ScrollbarProps['overflow']>,
    },
    /**
     * @zh OverlayScrollbars 的 scrollbars 配置。
     * @en OverlayScrollbars scrollbar options.
     */
    scrollbars: {
      type: Object as PropType<ScrollbarProps['scrollbars']>,
    },
    /**
     * @zh 完整的 OverlayScrollbars options，会与组件级 props 合并。
     * @en Complete OverlayScrollbars options merged with component props.
     */
    overlayOptions: {
      type: Object as PropType<ScrollbarProps['overlayOptions']>,
    },
    /**
     * @zh 直接透传给 OverlayScrollbars 的事件监听。
     * @en Event listeners forwarded to OverlayScrollbars.
     */
    events: {
      type: Object as PropType<ScrollbarProps['events']>,
    },
    /**
     * @private
     * @zh 是否隐藏滚动条
     * @en Whether to hide the scrollbar
     */
    hide: {
      type: Boolean,
      default: false,
    },
    /**
     * @private
     * @zh 是否禁用横向滚动
     * @en Whether to disable horizontal scrolling
     */
    disableHorizontal: {
      type: Boolean,
      default: false,
    },
    /**
     * @private
     * @zh 是否禁用纵向滚动
     * @en Whether to disable vertical scrolling
     */
    disableVertical: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    /**
     * @zh 滚动时触发
     * @en Triggered when scroll
     */
    scroll: [_ev: Event];
  }>();

  const prefixCls = getPrefixCls('scrollbar');
  const outerRef = ref<HTMLElement>();
  const containerRef = ref<HTMLElement>();
  const osInstanceRef = ref<OverlayScrollbarsInstance | null>(null);
  const removeExternalListenersRef = ref<(() => void) | null>(null);
  const autoSizeStyleRef = ref<Record<string, string>>({});

  const normalizedOuterStyle = computed(() => normalizeScrollbarStyle(props.outerStyle));
  const mergedOptions = computed(() => getScrollbarOptions(props, prefixCls));
  const foundation = createScrollbar({
    props,
    get outer() {
      return outerRef.value;
    },
    get container() {
      return containerRef.value;
    },
    get normalizedStyle() {
      return normalizedOuterStyle.value;
    },
    get mergedOptions() {
      return mergedOptions.value;
    },
    get instance() {
      return osInstanceRef.value;
    },
    set instance(value) {
      osInstanceRef.value = value;
    },
    get removeListeners() {
      return removeExternalListenersRef.value;
    },
    set removeListeners(value) {
      removeExternalListenersRef.value = value;
    },
    get autoSizeStyle() {
      return autoSizeStyleRef.value;
    },
    set autoSizeStyle(value) {
      autoSizeStyleRef.value = value;
    },
    readComputedStyle: (element) => window.getComputedStyle(element),
    scroll: (event) => emit('scroll', event),
  });
  const outerStyle = computed(() => [props.outerStyle, autoSizeStyleRef.value]);
  const cls = computed(() => [`${prefixCls}`, `${prefixCls}-type-${props.type}`, props.outerClass]);
  onMounted(foundation.mount);
  useResizeObserver(containerRef, foundation.updateAutoSizeStyle);
  useResizeObserver(outerRef, foundation.updateAutoSizeStyle);
  watch(normalizedOuterStyle, foundation.updateAutoSizeStyle, { deep: true, flush: 'post' });
  watch(mergedOptions, foundation.syncOptions, { deep: true });
  watch(() => props.events, foundation.bindExternalListeners, { deep: true });
  onBeforeUnmount(foundation.dispose);

  /**
   * @zh 获取底层 OverlayScrollbars 实例。
   * @en Get underlying OverlayScrollbars instance.
   */
  function getOSInstance() {
    return foundation.getOSInstance();
  }
  /**
   * @zh 获取或更新底层 options。
   * @en Get or set OverlayScrollbars options.
   */
  function options(newOptions?: ScrollbarProps['overlayOptions'], pure?: boolean) {
    return foundation.options(newOptions, pure);
  }
  /**
   * @zh 绑定底层 OverlayScrollbars 事件。
   * @en Bind OverlayScrollbars listeners.
   */
  function on(
    nameOrListeners: keyof EventListenerArgs | EventListeners,
    listenerOrPure?:
      | ScrollbarEventListener<keyof EventListenerArgs>
      | ScrollbarEventListener<keyof EventListenerArgs>[]
      | boolean,
  ) {
    return foundation.on(nameOrListeners, listenerOrPure);
  }
  /**
   * @zh 解绑底层 OverlayScrollbars 事件。
   * @en Remove OverlayScrollbars listeners.
   */
  function off(
    name: keyof EventListenerArgs,
    listener:
      | ScrollbarEventListener<keyof EventListenerArgs>
      | ScrollbarEventListener<keyof EventListenerArgs>[],
  ) {
    return foundation.off(name, listener);
  }
  /**
   * @zh 强制更新底层实例。
   * @en Force instance update.
   */
  function update(force?: boolean) {
    return foundation.update(force);
  }
  /**
   * @zh 设置底层实例休眠状态。
   * @en Toggle sleeping state.
   */
  function sleep(sleeping: boolean) {
    return foundation.sleep(sleeping);
  }
  /**
   * @zh 获取底层状态。
   * @en Get underlying state.
   */
  function state() {
    return foundation.state();
  }
  /**
   * @zh 获取底层生成的元素引用。
   * @en Get generated elements.
   */
  function elements() {
    return foundation.elements();
  }
  /**
   * @zh 获取底层插件实例。
   * @en Get plugin instance.
   */
  function plugin(osPlugin: ScrollbarPlugin) {
    return foundation.plugin(osPlugin);
  }
  /**
   * @zh 销毁底层实例。
   * @en Destroy underlying instance.
   */
  function destroy() {
    return foundation.destroy();
  }
  /**
   * @zh 滚动
   * @en scrollTo
   * @public
   * @param {number | {left?: number;top?: number}} options
   * @param {number} y
   */
  function scrollTo(
    options?:
      | number
      | {
          left?: number;
          top?: number;
        },
    y?: number,
  ) {
    return foundation.scrollTo(options, y);
  }
  /**
   * @zh 纵向滚动
   * @en scroll vertically
   * @public
   * @param {number} top
   * @version 2.40.0
   */
  function scrollTop(top: number) {
    return foundation.scrollTop(top);
  }
  /**
   * @zh 横向滚动
   * @en scroll horizontal
   * @public
   * @param {number} left
   * @version 2.40.0
   */
  function scrollLeft(left: number) {
    return foundation.scrollLeft(left);
  }

  defineExpose({
    getOSInstance,
    options,
    on,
    off,
    update,
    sleep,
    state,
    elements,
    plugin,
    destroy,
    scrollTo,
    scrollTop,
    scrollLeft,
  });
</script>
