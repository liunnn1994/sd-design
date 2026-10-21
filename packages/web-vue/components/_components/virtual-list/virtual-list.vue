<template>
  <div ref="scrollbarHostRef" :class="hostClassNames" :style="containerOuterStyle">
    <div
      ref="viewportRef"
      :class="`${prefixCls}-scroller`"
      :style="viewportStyle"
      @scroll="onScroll"
    >
      <slot name="before" />
      <Virtualizer
        v-if="!isEmpty"
        :key="virtualizerKey"
        ref="virtuaRef"
        v-bind="resolvedListAttrs"
        :data="resolvedItems"
        :horizontal="isHorizontal"
        :item-size="itemSizeHint"
        :buffer-size="resolvedBuffer"
        :ssr-count="props.prerender"
        :shift="props.shift"
        :cache="props.cache"
        :as="resolvedAs"
        :item="resolvedItem"
        :item-props="resolvedItemProps"
        :class="listClassNames"
        :style="listStyle"
        @scroll-end="onVirtuaScrollEnd"
      >
        <template #default="{ item, index }">
          <slot
            name="item"
            :item="item as TItem"
            :index="index"
            :active="true"
            :item-with-size="undefined"
          >
            <slot :item="item as TItem" :index="index" :active="true" :item-with-size="undefined" />
          </slot>
        </template>
      </Virtualizer>
      <slot name="after" />
      <slot v-if="isEmpty" name="empty" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="TItem">
  import type { CacheSnapshot } from 'virtua';

  import {
    type CSSProperties,
    type StyleValue,
    type PropType,
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
  } from 'vue';

  import { createVirtualListFoundation } from '@sdata/web-core/virtual-list/foundation';
  import {
    type OverlayScrollbars as OverlayScrollbarsInstance,
    type PartialOptions as OverlayScrollbarsPartialOptions,
  } from 'overlayscrollbars';
  import { Virtualizer, type VirtualizerHandle } from 'virtua/vue';

  import type { ScrollbarProps } from '../../scrollbar';
  import type { ClassValue, ItemSizeValue, VirtualItemKey, VirtualListRef } from './interface';

  import { getPrefixCls } from '../../_utils/global-config';

  defineOptions({ name: 'VirtualList' });

  const emit = defineEmits<{
    scroll: [_ev: Event];
    reachBottom: [_ev: Event];
    resize: [];
    visible: [];
    hidden: [];
    update: [
      _startIndex: number,
      _endIndex: number,
      _visibleStartIndex: number,
      _visibleEndIndex: number,
    ];
    scrollStart: [];
    scrollEnd: [];
  }>();

  const props = defineProps({
    items: {
      type: Array as PropType<TItem[]>,
      default: () => [],
    },
    height: {
      type: [Number, String] as PropType<number | string>,
      default: undefined,
    },
    keyField: {
      type: [String, Function] as PropType<
        string | ((item: unknown, index: number) => VirtualItemKey)
      >,
      default: 'key',
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical',
    },
    listTag: {
      type: String,
      default: 'div',
    },
    itemTag: {
      type: String,
      default: 'div',
    },
    itemSize: {
      type: [Number, String, Function, Object] as PropType<ItemSizeValue>,
      default: undefined,
    },
    gridItems: Number,
    itemSecondarySize: Number,
    minItemSize: {
      type: [Number, String] as PropType<number | string | null>,
      default: undefined,
    },
    sizeField: String,
    typeField: String,
    buffer: Number,
    shift: Boolean,
    cache: Object as PropType<CacheSnapshot>,
    prerender: Number,
    emitUpdate: Boolean,
    disableTransform: Boolean,
    flowMode: Boolean,
    hiddenPosition: Number,
    updateInterval: Number,
    skipHover: Boolean,
    enabled: {
      type: Boolean,
      default: true,
    },
    listClass: {
      type: [String, Object, Array] as PropType<ClassValue>,
    },
    itemClass: {
      type: [String, Object, Array] as PropType<ClassValue>,
    },
    threshold: {
      type: Number,
      default: 0,
    },
    fixedSize: {
      type: Boolean,
      default: false,
    },
    estimatedSize: {
      type: Number,
      default: undefined,
    },
    component: {
      type: [String, Object] as PropType<string | Record<string, unknown>>,
      default: undefined,
    },
    listAttrs: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    contentWrapperAttrs: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    contentAttrs: {
      type: Object as PropType<Record<string, unknown> | undefined>,
      default: undefined,
    },
    listStyle: {
      type: Object as PropType<CSSProperties | undefined>,
      default: undefined,
    },
    paddingPosition: {
      type: String as PropType<'content' | 'list'>,
      default: 'content',
    },
    scrollbar: {
      type: [Boolean, Object] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
  });

  const prefixCls = getPrefixCls('virtual-list');
  const scrollbarHostRef = ref<HTMLElement>();
  const viewportRef = ref<HTMLElement>();
  const virtuaRef = ref<VirtualizerHandle>();
  const osInstanceRef = ref<OverlayScrollbarsInstance | null>(null);
  const overlayViewportReadyRef = ref(false);

  const foundation: ReturnType<
    typeof createVirtualListFoundation<TItem, CacheSnapshot, StyleValue>
  > = createVirtualListFoundation<TItem, CacheSnapshot, StyleValue>(
    {
      props,
      get items() {
        return resolvedItems.value;
      },
      get horizontal() {
        return isHorizontal.value;
      },
      get scrollbarProps() {
        return resolvedScrollbarProps.value;
      },
      get itemSizeHint() {
        return itemSizeHint.value;
      },
      get minItemSizeValue() {
        return minItemSizeValue.value;
      },
      get overlayOptions() {
        return resolvedOverlayOptions.value;
      },
      get host() {
        return scrollbarHostRef.value;
      },
      get viewport() {
        return viewportRef.value;
      },
      get virtualizer() {
        return virtuaRef.value;
      },
      get instance() {
        return osInstanceRef.value;
      },
      set instance(value) {
        osInstanceRef.value = value;
      },
      get overlayReady() {
        return overlayViewportReadyRef.value;
      },
      set overlayReady(value) {
        overlayViewportReadyRef.value = value;
      },
    },
    {
      afterRender: () => nextTick(),
      scroll: (event) => emit('scroll', event),
      reachBottom: (event) => emit('reachBottom', event),
      scrollEnd: () => emit('scrollEnd'),
    },
  );
  const {
    destroyOverlayScrollbar,
    initOverlayScrollbar,
    onScroll,
    onVirtuaScrollEnd,
    scrollToItem,
    scrollToPosition,
    findItemIndex,
    getItemOffset,
    getItemSize,
    cacheSnapshot,
    restoreCache,
    updateVisibleItems,
    scrollToBottom,
    forceUpdate,
    getDynamicItemSize,
    scrollTo,
  } = foundation;
  const resolvedItems = computed(foundation.getResolvedItems);
  const isEmpty = computed(() => resolvedItems.value.length === 0);
  const isHorizontal = computed(foundation.getIsHorizontal);

  const resolvedScrollbarProps = computed<ScrollbarProps>(foundation.getResolvedScrollbarProps);

  const hostClassNames = computed(() => [
    prefixCls,
    'sd-scrollbar',
    `sd-scrollbar-type-${resolvedScrollbarProps.value.type ?? 'embed'}`,
    `${prefixCls}-scrollbar`,
  ]);

  const containerOuterStyle = computed(() => {
    if (props.height === undefined) {
      return undefined;
    }
    const value = typeof props.height === 'number' ? `${props.height}px` : props.height;
    return {
      height: value,
    };
  });

  const resolvedHeightValue = computed(() => {
    if (props.height === undefined) {
      return undefined;
    }

    return typeof props.height === 'number' ? `${props.height}px` : props.height;
  });

  // virtua only accepts itemSize as the unmeasured-item size hint. The component
  // keeps estimatedSize/minItemSize as compatibility props and maps them here.
  const itemSizeHint = computed(foundation.getItemSizeHint);

  const fixedItemSizeValue = computed(foundation.getFixedItemSizeValue);

  const minItemSizeValue = computed(foundation.getMinItemSizeValue);

  const virtualizerKey = computed(foundation.getVirtualizerKey);

  const resolvedBuffer = computed(() => props.buffer);

  const resolvedAs = computed(() => (props.listTag || 'div') as 'div');
  const resolvedItem = computed(() => (props.itemTag || 'div') as 'div');
  const resolvedListAttrs = computed(() => {
    if (!props.listAttrs) {
      return undefined;
    }

    const { class: _class, style: _style, ...rest } = props.listAttrs;
    return rest;
  });
  const listClassNames = computed(() => [
    props.listAttrs?.class,
    `${prefixCls}-content`,
    props.listClass,
  ]);
  const listStyle = computed(() => [props.listAttrs?.style, props.listStyle]);

  const resolvedItemProps = computed(() => {
    const itemStyle: CSSProperties = {};
    if (fixedItemSizeValue.value !== undefined) {
      if (isHorizontal.value) {
        itemStyle.width = fixedItemSizeValue.value;
      } else {
        itemStyle.height = fixedItemSizeValue.value;
      }
    }
    if (minItemSizeValue.value !== undefined) {
      if (isHorizontal.value) {
        itemStyle.minWidth = minItemSizeValue.value;
      } else {
        itemStyle.minHeight = minItemSizeValue.value;
      }
    }

    if (props.itemClass === undefined && Object.keys(itemStyle).length === 0) {
      return undefined;
    }

    const itemClass = props.itemClass;
    // virtua types `class` narrowly as string, but Vue accepts the full ClassValue
    // (string | object | array) at runtime; cast to satisfy the library type.
    return () =>
      ({ class: itemClass, style: itemStyle }) as {
        class: string;
        style: CSSProperties;
      };
  });

  const viewportStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {
      minHeight: 0,
    };

    if (resolvedHeightValue.value !== undefined) {
      style.height = '100%';
    }

    if (!overlayViewportReadyRef.value) {
      if (isHorizontal.value) {
        style.overflowX = 'auto';
        style.overflowY = 'hidden';
      } else {
        style.overflowY = 'auto';
        style.overflowX = 'hidden';
      }
    }

    return style;
  });

  const resolvedOverlayOptions = computed<OverlayScrollbarsPartialOptions>(
    foundation.getResolvedOverlayOptions,
  );

  onMounted(() => {
    void initOverlayScrollbar(false);
  });

  onBeforeUnmount(() => {
    destroyOverlayScrollbar();
  });

  watch([resolvedOverlayOptions], foundation.syncOverlayOptions, { deep: true });

  watch(() => resolvedItems.value, foundation.syncItems, { deep: true });

  defineExpose({
    scrollToItem,
    scrollToPosition,
    findItemIndex,
    getItemOffset,
    getItemSize,
    cacheSnapshot,
    restoreCache,
    updateVisibleItems,
    scrollToBottom,
    forceUpdate,
    getDynamicItemSize,
    scrollTo,
  } satisfies VirtualListRef);
</script>

<style lang="scss">
  @use '@sdata/web-core/styles/_components/virtual-list/style/layout.scss';
</style>
