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
        @scroll="onVirtuaScroll"
        @scroll-end="onVirtuaScrollEnd"
      >
        <template #default="{ item, index }">
          <slot
            name="item"
            :item="item as any"
            :index="index"
            :active="true"
            :item-with-size="undefined"
          >
            <slot :item="item as any" :index="index" :active="true" :item-with-size="undefined" />
          </slot>
        </template>
      </Virtualizer>
      <slot name="after" />
      <slot v-if="isEmpty" name="empty" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CacheSnapshot } from 'virtua';

  import {
    type CSSProperties,
    type PropType,
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
  } from 'vue';

  import {
    OverlayScrollbars,
    type OverlayScrollbars as OverlayScrollbarsInstance,
    type PartialOptions as OverlayScrollbarsPartialOptions,
  } from 'overlayscrollbars';
  import { Virtualizer, type VirtualizerHandle } from 'virtua/vue';

  import type { ScrollbarProps } from '../../scrollbar';
  import type {
    ClassValue,
    ItemSizeValue,
    ScrollAlign,
    ScrollOptions,
    ScrollToOptions,
    VirtualItemKey,
    VirtualListRef,
  } from './interface';

  import { getPrefixCls } from '../../_utils/global-config';
  import { isString } from '../../_utils/is';

  type ListAlign = 'auto' | 'top' | 'bottom' | ScrollAlign;

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
      type: Array as PropType<unknown[]>,
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
      type: [Number, Function, Object] as PropType<ItemSizeValue>,
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

  const resolvedItems = computed(() => props.items ?? []);
  const isEmpty = computed(() => resolvedItems.value.length === 0);
  const isHorizontal = computed(() => props.direction === 'horizontal');

  const resolvedScrollbarProps = computed<ScrollbarProps>(() => {
    if (typeof props.scrollbar === 'boolean') {
      return {
        type: 'embed',
      };
    }

    return {
      type: 'embed',
      ...props.scrollbar,
    };
  });

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

  const resolveSizeValue = (value: number | string | null | undefined) => {
    if (typeof value === 'number') {
      return value > 0 ? value : undefined;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      return parsed > 0 ? parsed : undefined;
    }

    return undefined;
  };

  const formatSizeValue = (value: number | string | null | undefined) => {
    if (typeof value === 'number') {
      return value > 0 ? `${value}px` : undefined;
    }

    if (typeof value === 'string') {
      return resolveSizeValue(value) === undefined ? undefined : value;
    }

    return undefined;
  };

  // virtua only accepts itemSize as the unmeasured-item size hint. The component
  // keeps estimatedSize/minItemSize as compatibility props and maps them here.
  const itemSizeHint = computed(() => {
    const itemSize = resolveSizeValue(
      typeof props.itemSize === 'number' || typeof props.itemSize === 'string'
        ? props.itemSize
        : undefined,
    );
    if (itemSize !== undefined) {
      return itemSize;
    }

    return props.estimatedSize ?? resolveSizeValue(props.minItemSize);
  });

  const fixedItemSizeValue = computed(() => {
    if (!props.fixedSize) {
      return undefined;
    }

    return formatSizeValue(
      typeof props.itemSize === 'number' || typeof props.itemSize === 'string'
        ? props.itemSize
        : undefined,
    );
  });

  const minItemSizeValue = computed(() => formatSizeValue(props.minItemSize));

  const virtualizerKey = computed(() =>
    [
      isHorizontal.value ? 'horizontal' : 'vertical',
      props.fixedSize ? 'fixed' : 'dynamic',
      itemSizeHint.value ?? 'auto',
      minItemSizeValue.value ?? 'none',
    ].join(':'),
  );

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

  const resolvedOverlayOptions = computed<OverlayScrollbarsPartialOptions>(() => {
    const scrollbarProps = resolvedScrollbarProps.value;
    const overlayOptions = scrollbarProps.overlayOptions ?? {};
    const isTrackType = scrollbarProps.type === 'track';

    return {
      ...overlayOptions,
      paddingAbsolute: scrollbarProps.paddingAbsolute ?? overlayOptions.paddingAbsolute,
      showNativeOverlaidScrollbars:
        scrollbarProps.showNativeOverlaidScrollbars ?? overlayOptions.showNativeOverlaidScrollbars,
      update: (scrollbarProps.updateOptions ??
        overlayOptions.update) as OverlayScrollbarsPartialOptions['update'],
      overflow: {
        x: 'scroll',
        y: 'scroll',
        ...overlayOptions.overflow,
        ...scrollbarProps.overflow,
      },
      scrollbars: {
        theme: isTrackType ? 'sd-scrollbar-theme-track' : 'sd-scrollbar-theme-embed',
        visibility: isTrackType ? 'visible' : 'auto',
        autoHide: isTrackType ? 'never' : 'leave',
        autoHideSuspend: true,
        clickScroll: 'instant',
        ...overlayOptions.scrollbars,
        ...scrollbarProps.scrollbars,
      },
    };
  });

  const resolveOSInstance = () => {
    const instance = osInstanceRef.value;
    if (!instance || instance.state().destroyed) {
      return null;
    }
    return instance;
  };

  const destroyOverlayScrollbar = () => {
    overlayViewportReadyRef.value = false;
    osInstanceRef.value?.destroy();
    osInstanceRef.value = null;
  };

  const initOverlayScrollbar = async (waitForDom = true) => {
    destroyOverlayScrollbar();

    if (waitForDom) {
      await nextTick();
    }

    const host = scrollbarHostRef.value;
    const viewport = viewportRef.value;
    if (!host || !viewport) {
      return;
    }

    osInstanceRef.value = OverlayScrollbars(
      {
        target: host,
        elements: {
          viewport,
          padding: false,
          content: false,
        },
      },
      resolvedOverlayOptions.value,
    );

    overlayViewportReadyRef.value = true;
  };

  onMounted(() => {
    void initOverlayScrollbar(false);
  });

  onBeforeUnmount(() => {
    destroyOverlayScrollbar();
  });

  watch(
    [resolvedOverlayOptions],
    async () => {
      await nextTick();

      const osInstance = resolveOSInstance();
      if (!osInstance) {
        await initOverlayScrollbar(true);
        return;
      }

      osInstance.options(resolvedOverlayOptions.value);
      osInstance.update(true);
    },
    { deep: true },
  );

  watch(
    () => resolvedItems.value,
    async () => {
      await nextTick();
      resolveOSInstance()?.update(true);
    },
    { deep: true },
  );

  const onScroll = (ev: Event) => {
    emit('scroll', ev);
    const target = ev.target as HTMLElement | undefined;
    if (!target) {
      return;
    }
    const bottom = Math.floor(target.scrollHeight - (target.scrollTop + target.clientHeight));
    if (bottom <= 0) {
      emit('reachBottom', ev);
    }
  };

  const onVirtuaScroll = () => {
    // virtua reports the scroll offset; the user-facing `scroll` event is emitted
    // from the native viewport scroll handler above, which preserves the Event
    // payload that consumers (e.g. List) read from `event.target`.
  };

  const onVirtuaScrollEnd = () => {
    emit('scrollEnd');
    const osInstance = resolveOSInstance();
    const target =
      (osInstance?.elements().scrollOffsetElement as HTMLElement | undefined) ??
      (osInstance?.elements().viewport as HTMLElement | undefined) ??
      viewportRef.value;
    if (!target) {
      return;
    }
    emit('reachBottom', new Event('scroll'));
  };

  const normalizeAlign = (align: ListAlign | undefined): ScrollAlign | undefined => {
    if (!align || align === 'auto') {
      return 'nearest';
    }
    if (align === 'top') {
      return 'start';
    }
    if (align === 'bottom') {
      return 'end';
    }
    return align;
  };

  const getItemKey = (item: unknown, index: number): VirtualItemKey => {
    const keyField = props.keyField;

    if (typeof keyField === 'function') {
      return keyField(item, index);
    }

    if (item && typeof item === 'object' && isString(keyField)) {
      return ((item as Record<string, unknown>)[keyField] ?? index) as VirtualItemKey;
    }

    return index;
  };

  const findIndexByKey = (key: VirtualItemKey) => {
    return resolvedItems.value.findIndex((item, index) => getItemKey(item, index) === key);
  };

  const getVirtua = () => virtuaRef.value;

  const scrollToItem = (index: number, options?: ScrollToOptions) => {
    getVirtua()?.scrollToIndex(index, {
      align: normalizeAlign(options?.align),
      smooth: options?.smooth,
      offset: options?.offset,
    });
  };

  const scrollToPosition = (position: number, options?: ScrollToOptions) => {
    const viewport = viewportRef.value;
    if (!viewport) {
      return;
    }

    if (options?.smooth) {
      viewport.scrollTo({ top: position, behavior: 'smooth' });
      return;
    }

    viewport.scrollTop = position;
  };

  const findItemIndex = (offset: number) => getVirtua()?.findItemIndex(offset) ?? -1;

  const getItemOffset = (index: number) => getVirtua()?.getItemOffset(index) ?? 0;

  const getItemSize = (index: number) => getVirtua()?.getItemSize(index) ?? 0;

  const cacheSnapshot = () => getVirtua()?.cache;

  // virtua restores cache only through the `cache` prop on mount, so there is no
  // imperative restore at runtime. Kept for API compatibility (no internal caller).
  const restoreCache = () => false;

  // virtua re-measures and re-renders the visible range automatically. Kept for
  // API compatibility (no internal caller).
  const updateVisibleItems = () => {};

  const scrollToBottom = () => {
    const handle = getVirtua();
    if (!handle) {
      return;
    }
    handle.scrollTo(handle.scrollSize);
  };

  // virtua measures item sizes continuously, so a manual force update is a no-op.
  // Kept for API compatibility (no internal caller).
  const forceUpdate = () => {};

  const getDynamicItemSize = (_item: unknown, index?: number) => {
    if (typeof index !== 'number') {
      return 0;
    }
    return getItemSize(index);
  };

  const scrollTo = (options: ScrollOptions) => {
    if (typeof options === 'number') {
      scrollToPosition(options);
      return;
    }

    let index = options.index;
    if (typeof index !== 'number' && options.key !== undefined) {
      index = findIndexByKey(options.key);
    }

    if (typeof index !== 'number' || index < 0) {
      return;
    }

    scrollToItem(index, {
      align: normalizeAlign(options.align),
      smooth: options.smooth,
      offset: options.offset,
    });
  };

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
  .sd-virtual-list {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;

    &-scrollbar {
      width: 100%;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }

    &-scroller {
      width: 100%;
      height: 100%;
      min-height: 0;
    }
  }
</style>
