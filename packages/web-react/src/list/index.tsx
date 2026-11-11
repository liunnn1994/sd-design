import type { ScrollIntoViewOptions } from '@sdata/web-core/virtual-list/types';
import type { ComponentRef as ReactComponentRef } from 'react';
import type { ComponentPropsWithRef, CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';

import { createListFoundation } from '@sdata/web-core/list/foundation';
import {
  createLegacyPaginationFoundation,
  getDefaultCurrent,
  getDefaultPageSize,
} from '@sdata/web-core/pagination/legacy';
import { Fragment, isValidElement, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { getRenderItems } from '../_shared/children.js';
import {
  VirtualList,
  type VirtualListProps,
  type VirtualListRef,
} from '../_shared/virtual-list.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { PerformantEllipsis } from '../ellipsis/index.js';
import { Empty } from '../empty/index.js';
import { Row, Col, type RowProps, type ColProps } from '../grid/index.js';
import { Pagination, type PaginationProps } from '../pagination/index.js';
import { Scrollbar, type ScrollbarProps, type ScrollbarExposed } from '../scrollbar/index.js';
import { Spin, type SpinProps } from '../spin/index.js';

export interface ListRef {
  readonly virtualListRef: VirtualListRef | null;
  scrollIntoView(options: ScrollIntoViewOptions): void;
}
export interface ListProps<T = ReactNode> extends Omit<HTMLAttributes<HTMLDivElement>, 'onScroll'> {
  data?: T[];
  size?: 'small' | 'medium' | 'large';
  bordered?: boolean;
  split?: boolean;
  loading?: boolean;
  spinProps?: SpinProps;
  hoverable?: boolean;
  paginationProps?: Omit<PaginationProps, 'total'> & { total?: number };
  gridProps?: Omit<ColProps, 'children' | 'ref'> & Pick<RowProps, 'gutter'>;
  maxHeight?: number | string;
  bottomOffset?: number;
  virtualListProps?: Omit<VirtualListProps<T>, 'items' | 'children' | 'ref'>;
  scrollbar?: boolean | ScrollbarProps;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  scrollLoading?: ReactNode;
  renderItem?: (props: { item: T; index: number }) => ReactNode;
  onScroll?: () => void;
  onReachBottom?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  ref?: Ref<ListRef>;
}
function ListView<T = ReactNode>({
  data = [],
  size = 'medium',
  bordered = true,
  split = true,
  loading = false,
  spinProps,
  hoverable = false,
  paginationProps,
  gridProps,
  maxHeight = 0,
  bottomOffset = 0,
  virtualListProps,
  scrollbar = true,
  header,
  footer,
  empty,
  scrollLoading,
  renderItem,
  onScroll,
  onReachBottom,
  onPageChange,
  onPageSizeChange,
  ref,
  children,
  className,
  style,
  ...attrs
}: ListProps<T>) {
  const config = useConfig();
  const prefix = usePrefix('list');
  const virtualPrefix = usePrefix('virtual-list');
  const wrapper = useRef<HTMLDivElement>(null);
  const scroll = useRef<ScrollbarExposed>(null);
  const virtual = useRef<VirtualListRef>(null);
  const [localCurrent, setCurrent] = useState(() =>
    getDefaultCurrent({ pagination: paginationProps }),
  );
  const [localPageSize, setPageSize] = useState(() =>
    getDefaultPageSize({ pagination: paginationProps }),
  );
  const source: (T | ReactNode)[] =
    children !== undefined ? getRenderItems(children).map((item) => item.content) : data;
  const live = useRef({
    paginationProps,
    localCurrent,
    localPageSize,
    bottomOffset,
    gridProps,
    source,
    onScroll,
    onReachBottom,
    onPageChange,
    onPageSizeChange,
  });
  live.current = {
    paginationProps,
    localCurrent,
    localPageSize,
    bottomOffset,
    gridProps,
    source,
    onScroll,
    onReachBottom,
    onPageChange,
    onPageSizeChange,
  };
  const [pagination] = useState(() =>
    createLegacyPaginationFoundation(
      {
        get pagination() {
          return live.current.paginationProps;
        },
        get localCurrent() {
          return live.current.localCurrent;
        },
        set localCurrent(value) {
          live.current.localCurrent = value;
          setCurrent(value);
        },
        get localPageSize() {
          return live.current.localPageSize;
        },
        set localPageSize(value) {
          live.current.localPageSize = value;
          setPageSize(value);
        },
      },
      (event, value) =>
        event === 'pageChange'
          ? live.current.onPageChange?.(value)
          : live.current.onPageSizeChange?.(value),
    ),
  );
  const [foundation] = useState(() =>
    createListFoundation<T | ReactNode>(
      {
        get pagination() {
          return live.current.paginationProps;
        },
        get current() {
          return pagination.getCurrent();
        },
        get pageSize() {
          return pagination.getPageSize();
        },
        get bottomOffset() {
          return live.current.bottomOffset;
        },
        get gridSpan() {
          return live.current.gridProps?.span;
        },
        get gridRowSize(): number {
          return foundation.getGridRowSize();
        },
        get currentPageItems(): (T | ReactNode)[] {
          return foundation.getCurrentPageItems(live.current.source);
        },
      },
      () => live.current.onScroll?.(),
      () => live.current.onReachBottom?.(),
    ),
  );
  const initialChecked = useRef(false);
  useEffect(() => {
    if (initialChecked.current) return;
    initialChecked.current = true;
    const viewport = wrapper.current?.getElementsByClassName(`${virtualPrefix}-scroller`)[0] as
      | HTMLElement
      | undefined;
    foundation.checkInitialViewport(viewport ?? scroll.current?.elements()?.scrollOffsetElement);
  }, [foundation, virtualPrefix]);
  useImperativeHandle(
    ref,
    () => ({
      get virtualListRef() {
        return virtual.current;
      },
      scrollIntoView: (options) => virtual.current?.scrollTo(options),
    }),
    [],
  );
  const virtualMode = !!virtualListProps && !gridProps;
  const pageItems = foundation.getCurrentPageItems(source);
  const virtualItems = foundation.getCurrentPageItems(data) as T[];
  const rowSize = foundation.getGridRowSize();
  const { gutter, ...columnProps } = gridProps ?? {};
  const scrollProps = typeof scrollbar === 'object' ? scrollbar : {};
  const render = (item: T | ReactNode, index: number) =>
    isValidElement(item) ? item : renderItem?.({ item: item as T, index });
  const contentClass = [`${prefix}-content`, virtualListProps && `${prefix}-virtual`]
    .filter(Boolean)
    .join(' ');
  const emptyContent =
    scrollLoading !== undefined ? null : empty !== undefined ? (
      empty
    ) : config.renderEmpty ? (
      config.renderEmpty({ component: 'list' })
    ) : (
      <Empty />
    );
  const loadingContent = scrollLoading !== undefined && (
    <div className={`${prefix}-item ${prefix}-scroll-loading`}>{scrollLoading}</div>
  );
  const contentStyle: CSSProperties | undefined = maxHeight
    ? { maxHeight, overflowY: 'auto' }
    : virtualMode
      ? { height: '100%', overflow: 'hidden' }
      : undefined;
  const mergedSpin = { ...config.listSpinProps, ...spinProps };
  const {
    current: _current,
    pageSize: _pageSize,
    defaultCurrent: _defaultCurrent,
    defaultPageSize: _defaultPageSize,
    ...paginationRest
  } = paginationProps ?? {};
  return (
    <div
      {...attrs}
      ref={wrapper}
      className={[`${prefix}-wrapper`, className].filter(Boolean).join(' ')}
      style={{ ...(virtualMode && { height: '100%', minHeight: 0 }), ...style }}
    >
      <Spin
        {...mergedSpin}
        className={[`${prefix}-spin`, mergedSpin.className].filter(Boolean).join(' ')}
        loading={loading}
      >
        <Scrollbar
          type="embed"
          {...scrollProps}
          ref={scroll}
          className={[
            prefix,
            `${prefix}-${size}`,
            bordered && `${prefix}-bordered`,
            split && `${prefix}-split`,
            hoverable && `${prefix}-hover`,
            scrollProps.className,
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ ...scrollProps.style, ...contentStyle }}
          onScroll={(event) => {
            scrollProps.onScroll?.(event);
            foundation.handleScroll(event);
          }}
        >
          <div
            className={`${prefix}-content-wrapper`}
            style={
              virtualMode
                ? { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }
                : undefined
            }
          >
            {header !== undefined && <div className={`${prefix}-header`}>{header}</div>}
            {virtualMode ? (
              <>
                {virtualItems.length ? (
                  <VirtualList
                    {...virtualListProps}
                    ref={virtual}
                    className={[contentClass, virtualListProps?.className]
                      .filter(Boolean)
                      .join(' ')}
                    height={virtualListProps?.height ?? '100%'}
                    items={virtualItems}
                    onScroll={(event) => {
                      virtualListProps?.onScroll?.(event);
                      foundation.handleScroll(event);
                    }}
                  >
                    {({ item, index }) => render(item, index)}
                  </VirtualList>
                ) : (
                  emptyContent
                )}
                {loadingContent}
              </>
            ) : (
              <div role="list" className={contentClass}>
                {source.length ? (
                  gridProps ? (
                    gridProps.span ? (
                      foundation.getGridRows().map((row, rowIndex) => (
                        <Row key={rowIndex} className={`${prefix}-row`} gutter={gutter}>
                          {row.map((item, index) => (
                            <Col key={index} className={`${prefix}-col`} span={gridProps.span}>
                              {render(item, rowIndex * rowSize + index)}
                            </Col>
                          ))}
                        </Row>
                      ))
                    ) : (
                      <Row className={`${prefix}-row`} gutter={gutter}>
                        {pageItems.map((item, index) => (
                          <Col
                            {...columnProps}
                            key={index}
                            className={[`${prefix}-col`, columnProps.className]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {render(item, index)}
                          </Col>
                        ))}
                      </Row>
                    )
                  ) : (
                    pageItems.map((item, index) => (
                      <Fragment key={isValidElement(item) ? (item.key ?? index) : index}>
                        {render(item, index)}
                      </Fragment>
                    ))
                  )
                ) : (
                  emptyContent
                )}
                {loadingContent}
              </div>
            )}
            {footer !== undefined && <div className={`${prefix}-footer`}>{footer}</div>}
          </div>
        </Scrollbar>
        {paginationProps && (
          <Pagination
            {...paginationRest}
            className={[`${prefix}-pagination`, paginationRest.className].filter(Boolean).join(' ')}
            total={paginationProps.total ?? source.length}
            current={pagination.getCurrent()}
            pageSize={pagination.getPageSize()}
            onChange={(page) => {
              paginationProps.onChange?.(page);
              pagination.handlePageChange(page);
            }}
            onPageSizeChange={(value) => {
              paginationProps.onPageSizeChange?.(value);
              pagination.handlePageSizeChange(value);
            }}
          />
        )}
      </Spin>
    </div>
  );
}
export interface ListItemMetaProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  avatar?: ReactNode;
}
export function ListItemMeta({
  title,
  description,
  avatar,
  className,
  ...attrs
}: ListItemMetaProps) {
  const prefix = usePrefix('list-item-meta');
  const hasTitle = title != null && title !== false && title !== '';
  const hasDescription = description != null && description !== false && description !== '';
  const text = (value: ReactNode) =>
    typeof value === 'string' ? <PerformantEllipsis>{value}</PerformantEllipsis> : value;
  return (
    <div {...attrs} className={[prefix, className].filter(Boolean).join(' ')}>
      {avatar !== undefined && <div className={`${prefix}-avatar`}>{avatar}</div>}
      {(hasTitle || hasDescription) && (
        <div className={`${prefix}-content`}>
          {hasTitle && <div className={`${prefix}-title`}>{text(title)}</div>}
          {hasDescription && <div className={`${prefix}-description`}>{text(description)}</div>}
        </div>
      )}
    </div>
  );
}
export interface ListItemProps extends ComponentPropsWithRef<'div'> {
  actionLayout?: 'horizontal' | 'vertical';
  actions?: ReactNode;
  extra?: ReactNode;
  meta?: ReactNode;
}
function ListItemView({
  actionLayout = 'horizontal',
  actions,
  extra,
  meta,
  children,
  className,
  ...attrs
}: ListItemProps) {
  const prefix = usePrefix('list-item');
  const items = getRenderItems(actions);
  const action = items.length > 0 && (
    <ul className={`${prefix}-action`}>
      {items.map((item) => (
        <li key={item.key}>{item.content}</li>
      ))}
    </ul>
  );
  return (
    <div {...attrs} role="listitem" className={[prefix, className].filter(Boolean).join(' ')}>
      <div className={`${prefix}-main`}>
        {meta}
        <div className={`${prefix}-content`}>{children}</div>
        {actionLayout === 'vertical' && action}
      </div>
      {actionLayout === 'horizontal' && action}
      {extra !== undefined && <div className={`${prefix}-extra`}>{extra}</div>}
    </div>
  );
}
export const ListItem = Object.assign(ListItemView, { Meta: ListItemMeta });
export const List = Object.assign(ListView, { Item: ListItem });
export default List;

export type ListInstance = ReactComponentRef<typeof List>;
export type ListItemInstance = ReactComponentRef<typeof ListItem>;
export type ListItemMetaInstance = ReactComponentRef<typeof ListItemMeta>;
