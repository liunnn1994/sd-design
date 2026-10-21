import type {
  ClassValue,
  KeyFieldValue,
  ItemSizeValue,
  ScrollDirection,
  ScrollToOptions,
  ScrollOptions,
} from '@sdata/web-core/virtual-list/types';
export type {
  VirtualItemKey,
  InternalDataItem,
  ClassValue,
  KeyFieldValue,
  ItemSizeValue,
  ScrollDirection,
  ScrollAlign,
  ScrollToOptions,
  ScrollIntoViewOptions,
  ScrollOptions,
} from '@sdata/web-core/virtual-list/types';
import type { CacheSnapshot } from 'virtua';

import type { CSSProperties, VNode } from 'vue';

import type { ScrollbarProps } from '../../scrollbar';

export type ItemSlot = (props: { item: unknown; index: number }) => VNode[];

interface VirtualListCommonProps<TItem = unknown> {
  items?: TItem[];
  height?: number | string;
  itemSize?: ItemSizeValue<TItem>;
  minItemSize?: number | string | null;
  keyField?: KeyFieldValue<TItem>;
  direction?: ScrollDirection;
  pageMode?: boolean;
  listTag?: string;
  itemTag?: string;
  shift?: boolean;
  cache?: CacheSnapshot;
  disableTransform?: boolean;
  flowMode?: boolean;
  hiddenPosition?: number;
  enabled?: boolean;
  scrollbar?: boolean | ScrollbarProps;
  threshold?: number;
  fixedSize?: boolean;
  estimatedSize?: number;
  component?: keyof HTMLElementTagNameMap | Record<string, unknown>;
  listAttrs?: Record<string, unknown>;
  contentWrapperAttrs?: Record<string, unknown>;
  contentAttrs?: Record<string, unknown>;
  listStyle?: CSSProperties;
  paddingPosition?: 'content' | 'list';
}

export interface VirtualListRecycleProps<TItem = unknown> extends VirtualListCommonProps<TItem> {
  gridItems?: number;
  itemSecondarySize?: number;
  sizeField?: string;
  typeField?: string;
  buffer?: number;
  prerender?: number;
  emitUpdate?: boolean;
  updateInterval?: number;
  skipHover?: boolean;
  listClass?: ClassValue;
  itemClass?: ClassValue;
}

export interface VirtualListDynamicProps<TItem = unknown> extends VirtualListCommonProps<TItem> {
  minItemSize: number | string;
}

export type VirtualListProps<TItem = unknown> =
  | VirtualListRecycleProps<TItem>
  | VirtualListDynamicProps<TItem>;

export interface VirtualListRef {
  scrollToItem: (index: number, options?: ScrollToOptions) => void;
  scrollToPosition: (position: number, options?: ScrollToOptions) => void;
  findItemIndex: (offset: number) => number;
  getItemOffset: (index: number) => number;
  getItemSize: (index: number) => number;
  cacheSnapshot: () => CacheSnapshot | undefined;
  restoreCache: (snapshot: CacheSnapshot | null | undefined) => boolean;
  updateVisibleItems?: (itemsChanged: boolean, checkPositionDiff?: boolean) => void;
  scrollToBottom?: () => void;
  forceUpdate?: (clear?: boolean) => void;
  getDynamicItemSize?: (item: unknown, index?: number) => number;
  scrollTo: (options: ScrollOptions) => void;
}
