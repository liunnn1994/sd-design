import type {
  OverlayScrollbars as OverlayScrollbarsInstance,
  PartialOptions as OverlayScrollbarsPartialOptions,
} from 'overlayscrollbars';

import type { ScrollbarProps } from '../scrollbar/types.js';
import type { VirtualItemKey, ScrollAlign, ScrollToOptions, ScrollOptions } from './types.js';

import { isString } from '../_utils/is.js';
import { OverlayScrollbars } from '../scrollbar/engine.js';
type ListAlign = 'auto' | 'top' | 'bottom' | ScrollAlign;
export interface VirtualizerPort<Cache> {
  readonly cache: Cache;
  readonly scrollSize: number;
  scrollToIndex(
    index: number,
    options: {
      align?: ScrollAlign | undefined;
      smooth?: boolean | undefined;
      offset?: number | undefined;
    },
  ): void;
  scrollTo(offset: number): void;
  findItemIndex(offset: number): number;
  getItemOffset(index: number): number;
  getItemSize(index: number): number;
}
export interface VirtualListState<TItem, Cache, Style = unknown> {
  readonly props: {
    items?: TItem[] | undefined;
    direction: 'vertical' | 'horizontal';
    scrollbar?: boolean | ScrollbarProps<Style> | undefined;
    itemSize?: unknown;
    estimatedSize?: number | undefined;
    minItemSize?: number | string | null | undefined;
    fixedSize: boolean;
    keyField: string | ((item: unknown, index: number) => VirtualItemKey);
  };
  readonly items: TItem[];
  readonly horizontal: boolean;
  readonly scrollbarProps: ScrollbarProps<Style>;
  readonly itemSizeHint: number | undefined;
  readonly minItemSizeValue: string | undefined;
  readonly overlayOptions: OverlayScrollbarsPartialOptions;
  readonly host: HTMLElement | undefined;
  readonly viewport: HTMLElement | undefined;
  readonly virtualizer: VirtualizerPort<Cache> | undefined;
  instance: OverlayScrollbarsInstance | null;
  overlayReady: boolean;
}
export function createVirtualListFoundation<TItem, Cache, Style = unknown>(
  state: VirtualListState<TItem, Cache, Style>,
  callbacks: {
    afterRender(): Promise<void>;
    scroll(event: Event): void;
    reachBottom(event: Event): void;
    scrollEnd(): void;
  },
) {
  const props = state.props;
  function getResolvedItems(): TItem[] {
    return props.items ?? [];
  }

  function getIsHorizontal() {
    return props.direction === 'horizontal';
  }

  function getResolvedScrollbarProps(): ScrollbarProps<Style> {
    if (typeof props.scrollbar === 'boolean') {
      return {
        type: 'embed',
      };
    }

    return {
      type: 'embed',
      ...props.scrollbar,
    };
  }

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

  function getItemSizeHint(): number | undefined {
    const itemSize = resolveSizeValue(
      typeof props.itemSize === 'number' || typeof props.itemSize === 'string'
        ? props.itemSize
        : undefined,
    );
    if (itemSize !== undefined) {
      return itemSize;
    }

    return props.estimatedSize ?? resolveSizeValue(props.minItemSize);
  }

  function getFixedItemSizeValue(): string | undefined {
    if (!props.fixedSize) {
      return undefined;
    }

    return formatSizeValue(
      typeof props.itemSize === 'number' || typeof props.itemSize === 'string'
        ? props.itemSize
        : undefined,
    );
  }

  function getMinItemSizeValue(): string | undefined {
    return formatSizeValue(props.minItemSize);
  }

  function getVirtualizerKey() {
    return [
      state.horizontal ? 'horizontal' : 'vertical',
      props.fixedSize ? 'fixed' : 'dynamic',
      state.itemSizeHint ?? 'auto',
      state.minItemSizeValue ?? 'none',
    ].join(':');
  }

  function getResolvedOverlayOptions(): OverlayScrollbarsPartialOptions {
    const scrollbarProps = state.scrollbarProps;
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
  }

  const resolveOSInstance = () => {
    const instance = state.instance;
    if (!instance || instance.state().destroyed) {
      return null;
    }
    return instance;
  };

  const destroyOverlayScrollbar = () => {
    state.overlayReady = false;
    state.instance?.destroy();
    state.instance = null;
  };

  const initOverlayScrollbar = async (waitForDom = true) => {
    destroyOverlayScrollbar();

    if (waitForDom) {
      await callbacks.afterRender();
    }

    const host = state.host;
    const viewport = state.viewport;
    if (!host || !viewport) {
      return;
    }

    state.instance = OverlayScrollbars(
      {
        target: host,
        elements: {
          viewport,
          padding: false,
          content: false,
        },
      },
      state.overlayOptions,
    );

    state.overlayReady = true;
  };

  async function syncOverlayOptions() {
    await callbacks.afterRender();

    const osInstance = resolveOSInstance();
    if (!osInstance) {
      await initOverlayScrollbar(true);
      return;
    }

    osInstance.options(state.overlayOptions);
    osInstance.update(true);
  }

  async function syncItems() {
    await callbacks.afterRender();
    resolveOSInstance()?.update(true);
  }

  const getRemainingScroll = (target: HTMLElement) =>
    state.horizontal
      ? target.scrollWidth - (target.scrollLeft + target.clientWidth)
      : target.scrollHeight - (target.scrollTop + target.clientHeight);

  const onScroll = (ev: Event) => {
    callbacks.scroll(ev);
    const target = ev.target as HTMLElement | undefined;
    if (!target) {
      return;
    }
    const bottom = Math.floor(getRemainingScroll(target));
    if (bottom <= 0) {
      callbacks.reachBottom(ev);
    }
  };

  const onVirtuaScrollEnd = () => {
    callbacks.scrollEnd();
    const osInstance = resolveOSInstance();
    const target =
      (osInstance?.elements().scrollOffsetElement as HTMLElement | undefined) ??
      (osInstance?.elements().viewport as HTMLElement | undefined) ??
      state.viewport;
    if (!target) {
      return;
    }
    if (Math.floor(getRemainingScroll(target)) <= 0) {
      callbacks.reachBottom(new Event('scroll'));
    }
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
    return state.items.findIndex((item, index) => getItemKey(item, index) === key);
  };

  const getVirtua = () => state.virtualizer;

  const scrollToItem = (index: number, options?: ScrollToOptions) => {
    getVirtua()?.scrollToIndex(index, {
      align: normalizeAlign(options?.align),
      smooth: options?.smooth,
      offset: options?.offset,
    });
  };

  const scrollToPosition = (position: number, options?: ScrollToOptions) => {
    const viewport = state.viewport;
    if (!viewport) {
      return;
    }

    if (options?.smooth) {
      viewport.scrollTo({ [state.horizontal ? 'left' : 'top']: position, behavior: 'smooth' });
      return;
    }

    if (state.horizontal) viewport.scrollLeft = position;
    else viewport.scrollTop = position;
  };

  const findItemIndex = (offset: number) => getVirtua()?.findItemIndex(offset) ?? -1;

  const getItemOffset = (index: number) => getVirtua()?.getItemOffset(index) ?? 0;

  const getItemSize = (index: number) => getVirtua()?.getItemSize(index) ?? 0;

  const cacheSnapshot = () => getVirtua()?.cache;

  // The SDK restores snapshots through its mount prop, not an imperative command.
  const restoreCache = () => false;

  // The SDK automatically measures and updates visible items.
  const updateVisibleItems = () => {};

  const scrollToBottom = () => {
    const handle = getVirtua();
    if (!handle) {
      return;
    }
    handle.scrollTo(handle.scrollSize);
  };

  // Keep the original no-op while the SDK owns measurement.
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
  return {
    getResolvedItems,
    getIsHorizontal,
    getResolvedScrollbarProps,
    getItemSizeHint,
    getFixedItemSizeValue,
    getMinItemSizeValue,
    getVirtualizerKey,
    getResolvedOverlayOptions,
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
    syncOverlayOptions,
    syncItems,
  };
}
