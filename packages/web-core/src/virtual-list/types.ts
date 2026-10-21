export type VirtualItemKey = string | number;

export interface InternalDataItem {
  key: VirtualItemKey;
  index: number;
  item: unknown;
}

/*
 * The aliases below were previously re-exported from `vue-virtual-scroller`.
 * They are now defined locally so the virtual list no longer depends on that
 * library, while keeping the public type surface stable for consumers.
 */

export type ClassValue = string | Record<string, boolean> | Array<string | Record<string, boolean>>;

export type KeyFieldValue<T = unknown> = string | ((item: T, index: number) => VirtualItemKey);

export type ItemSizeValue<T = unknown> = number | string | ((item: T, index: number) => number);

export type ScrollDirection = 'vertical' | 'horizontal';

export type ScrollAlign = 'start' | 'center' | 'end' | 'nearest';

export interface ScrollToOptions {
  align?: 'auto' | 'top' | 'bottom' | ScrollAlign;
  smooth?: boolean;
  offset?: number;
}

export interface ScrollIntoViewOptions {
  index?: number;
  key?: VirtualItemKey;
  align?: 'auto' | 'top' | 'bottom' | ScrollAlign;
}

export type ScrollOptions = number | ({ index?: number; key?: VirtualItemKey } & ScrollToOptions);
