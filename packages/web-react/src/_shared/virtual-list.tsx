import type {
  ItemSizeValue,
  KeyFieldValue,
  ScrollOptions,
  ScrollToOptions,
} from '@sdata/web-core/virtual-list/types';
import type { CSSProperties, ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type {
  CustomContainerComponentProps,
  CustomItemComponentProps,
  VirtualizerHandle,
} from 'virtua';

import { definedProps } from '@sdata/web-core/_utils/defined-props';
import { createVirtualListFoundation } from '@sdata/web-core/virtual-list/foundation';
import {
  createContext,
  createElement,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Virtualizer } from 'virtua';

import type { ScrollbarProps } from '../scrollbar/index.js';

import { usePrefix } from '../config-provider/index.js';
import { useAfterRender } from './use-after-render.js';

type Cache = VirtualizerHandle['cache'];
export interface VirtualListRef {
  scrollToItem(index: number, options?: ScrollToOptions): void;
  scrollToPosition(position: number, options?: ScrollToOptions): void;
  findItemIndex(offset: number): number;
  getItemOffset(index: number): number;
  getItemSize(index: number): number;
  cacheSnapshot(): Cache | undefined;
  restoreCache(snapshot?: Cache | null): boolean;
  updateVisibleItems(itemsChanged: boolean, checkPositionDiff?: boolean): void;
  scrollToBottom(): void;
  forceUpdate(clear?: boolean): void;
  getDynamicItemSize(item: unknown, index?: number): number;
  scrollTo(options: ScrollOptions): void;
}
export interface VirtualListProps<T> extends Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'onScroll'
> {
  items?: T[];
  height?: number | string;
  keyField?: KeyFieldValue<T>;
  direction?: 'vertical' | 'horizontal';
  listTag?: string;
  itemTag?: string;
  itemSize?: ItemSizeValue<T> | undefined;
  minItemSize?: number | string | null;
  estimatedSize?: number;
  fixedSize?: boolean;
  buffer?: number;
  shift?: boolean;
  cache?: Cache;
  prerender?: number;
  scrollbar?: boolean | ScrollbarProps;
  listClass?: string;
  itemClass?: string;
  listAttrs?: ComponentPropsWithoutRef<'div'>;
  listStyle?: CSSProperties;
  before?: ReactNode;
  after?: ReactNode;
  empty?: ReactNode;
  children?: (props: {
    item: T;
    index: number;
    active: true;
    itemWithSize: undefined;
  }) => ReactNode;
  onScroll?: (event: Event) => void;
  onReachBottom?: (event: Event) => void;
  onScrollEnd?: () => void;
  ref?: Ref<VirtualListRef>;
}
const ViewContext = createContext({
  listTag: 'div',
  itemTag: 'div',
  listClass: '',
  itemClass: '',
  listAttrs: {} as ComponentPropsWithoutRef<'div'>,
  listStyle: {} as CSSProperties,
  itemStyle: {} as CSSProperties,
});
function ListContainer({ style, children, ref }: CustomContainerComponentProps) {
  const view = useContext(ViewContext);
  return createElement(
    view.listTag,
    {
      ...view.listAttrs,
      ref,
      className: view.listClass,
      style: { ...style, ...view.listAttrs.style, ...view.listStyle },
    },
    children,
  );
}
function ListItem({ style, children, ref }: CustomItemComponentProps) {
  const view = useContext(ViewContext);
  return createElement(
    view.itemTag,
    { ref, className: view.itemClass, style: { ...style, ...view.itemStyle } },
    children,
  );
}

export function VirtualList<T>({
  items,
  height,
  keyField = 'key',
  direction = 'vertical',
  listTag = 'div',
  itemTag = 'div',
  itemSize,
  minItemSize,
  estimatedSize,
  fixedSize = false,
  buffer,
  shift,
  cache,
  prerender,
  scrollbar = true,
  listClass,
  itemClass,
  listAttrs,
  listStyle,
  before,
  after,
  empty,
  children,
  onScroll,
  onReachBottom,
  onScrollEnd,
  ref,
  className,
  style,
  ...attrs
}: VirtualListProps<T>) {
  const prefix = usePrefix('virtual-list');
  const host = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const virtualizer = useRef<VirtualizerHandle>(null);
  const [ready, setReady] = useState(false);
  const afterRender = useAfterRender();
  const live = useRef({
    items,
    keyField,
    direction,
    itemSize,
    minItemSize,
    estimatedSize,
    fixedSize,
    scrollbar,
    onScroll,
    onReachBottom,
    onScrollEnd,
  });
  live.current = {
    items,
    keyField,
    direction,
    itemSize,
    minItemSize,
    estimatedSize,
    fixedSize,
    scrollbar,
    onScroll,
    onReachBottom,
    onScrollEnd,
  };
  const [foundation] = useState(() => {
    let overlayReady = false;
    const foundation: ReturnType<typeof createVirtualListFoundation<T, Cache, CSSProperties>> =
      createVirtualListFoundation<T, Cache, CSSProperties>(
        {
          props: {
            get items() {
              return live.current.items;
            },
            get keyField() {
              const field = live.current.keyField;
              return typeof field === 'function'
                ? (item: unknown, index: number) => field(item as T, index)
                : field;
            },
            get direction() {
              return live.current.direction;
            },
            get itemSize() {
              return live.current.itemSize;
            },
            get minItemSize() {
              return live.current.minItemSize;
            },
            get estimatedSize() {
              return live.current.estimatedSize;
            },
            get fixedSize() {
              return live.current.fixedSize;
            },
            get scrollbar() {
              return live.current.scrollbar;
            },
          },
          get items() {
            return foundation.getResolvedItems();
          },
          get horizontal() {
            return foundation.getIsHorizontal();
          },
          get scrollbarProps() {
            return foundation.getResolvedScrollbarProps();
          },
          get itemSizeHint() {
            return foundation.getItemSizeHint();
          },
          get minItemSizeValue() {
            return foundation.getMinItemSizeValue();
          },
          get overlayOptions() {
            return foundation.getResolvedOverlayOptions();
          },
          get host() {
            return host.current ?? undefined;
          },
          get viewport() {
            return viewport.current ?? undefined;
          },
          get virtualizer() {
            return virtualizer.current ?? undefined;
          },
          instance: null,
          get overlayReady() {
            return overlayReady;
          },
          set overlayReady(value) {
            overlayReady = value;
            setReady(value);
          },
        },
        {
          afterRender,
          scroll: (event) => live.current.onScroll?.(event),
          reachBottom: (event) => live.current.onReachBottom?.(event),
          scrollEnd: () => live.current.onScrollEnd?.(),
        },
      );
    return foundation;
  });
  useImperativeHandle(ref, () => foundation, [foundation]);
  useLayoutEffect(() => {
    void foundation.initOverlayScrollbar(false);
    return foundation.destroyOverlayScrollbar;
  }, [foundation]);
  useLayoutEffect(() => {
    void foundation.syncOverlayOptions();
  }, [foundation, scrollbar]);
  useLayoutEffect(() => {
    void foundation.syncItems();
  }, [foundation, items]);
  const horizontal = foundation.getIsHorizontal();
  const resolvedItems = foundation.getResolvedItems();
  const itemStyle: CSSProperties = {
    [horizontal ? 'width' : 'height']: foundation.getFixedItemSizeValue(),
    [horizontal ? 'minWidth' : 'minHeight']: foundation.getMinItemSizeValue(),
  };
  return (
    <div
      {...attrs}
      ref={host}
      className={[
        prefix,
        'sd-scrollbar',
        `sd-scrollbar-type-${foundation.getResolvedScrollbarProps().type ?? 'embed'}`,
        `${prefix}-scrollbar`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ height, ...style }}
    >
      <div
        ref={viewport}
        className={`${prefix}-scroller`}
        onScroll={(event) => foundation.onScroll(event.nativeEvent)}
        style={{
          minHeight: 0,
          height: height === undefined ? undefined : '100%',
          ...(!ready && {
            overflowX: horizontal ? 'auto' : 'hidden',
            overflowY: horizontal ? 'hidden' : 'auto',
          }),
        }}
      >
        {before}
        {resolvedItems.length > 0 && (
          <ViewContext
            value={{
              listTag,
              itemTag,
              listAttrs: listAttrs ?? {},
              listClass: [listAttrs?.className, `${prefix}-content`, listClass]
                .filter(Boolean)
                .join(' '),
              itemClass: itemClass ?? '',
              listStyle: listStyle ?? {},
              itemStyle,
            }}
          >
            <Virtualizer
              key={foundation.getVirtualizerKey()}
              ref={virtualizer}
              data={resolvedItems}
              horizontal={horizontal}
              {...definedProps({
                itemSize: foundation.getItemSizeHint(),
                bufferSize: buffer,
                ssrCount: prerender,
                shift,
                cache,
              })}
              as={ListContainer}
              item={ListItem}
              onScrollEnd={foundation.onVirtuaScrollEnd}
            >
              {(item, index) => (
                <>{children?.({ item, index, active: true, itemWithSize: undefined })}</>
              )}
            </Virtualizer>
          </ViewContext>
        )}
        {after}
        {resolvedItems.length === 0 && empty}
      </div>
    </div>
  );
}
