import type { CSSProperties, ReactNode } from 'react';

import { resolveConfigProp } from '@sdata/web-core/config/prop-values';
import { createPaginationFoundation } from '@sdata/web-core/pagination/foundation';
import {
  createPagerFoundation,
  createStepPagerFoundation,
  createEllipsisPagerFoundation,
  createPageOptionsFoundation,
} from '@sdata/web-core/pagination/items';
import { createPageJumperFoundation, formatPageJumper } from '@sdata/web-core/pagination/jumper';
import { useLayoutEffect, useRef, useState } from 'react';

import type { PaginationProps, PaginationConfig } from './types.js';

import { useAfterRender } from '../_shared/use-after-render.js';
import { useConfig, usePrefix } from '../config-provider/index.js';
import { InputNumber } from '../input-number/index.js';
import { useI18n } from '../locale/index.js';
import { Select } from '../select/index.js';
export type { PaginationProps, PaginationConfig, PaginationSelectProps } from './types.js';
export { PAGE_ITEM_TYPES } from '@sdata/web-core/pagination/types';
export type { PageItemType } from '@sdata/web-core/pagination/types';

function PageJumper({
  current,
  pages,
  simple,
  disabled,
  size,
  prepend,
  append,
  onChange,
}: {
  current: number;
  pages: number;
  simple: boolean;
  disabled: boolean;
  size: PaginationProps['size'];
  prepend?: ReactNode;
  append?: ReactNode;
  onChange(value: number): void;
}) {
  const prefix = usePrefix('pagination-jumper');
  const { t } = useI18n();
  const [value, setValue] = useState<number | string | undefined>(simple ? current : undefined);
  const afterRender = useAfterRender();
  const mounted = useRef(false);
  const live = useRef({ simple, value, onChange });
  live.current = { simple, value, onChange };
  const [foundation] = useState(() =>
    createPageJumperFoundation({
      get simple() {
        return live.current.simple;
      },
      get value() {
        return live.current.value;
      },
      setValue,
      onChange: (next) => live.current.onChange(next),
      defer: (callback) => {
        void afterRender().then(() => {
          if (mounted.current) callback();
        });
      },
    }),
  );
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const previous = useRef(current);
  useLayoutEffect(() => {
    if (previous.current !== current) {
      previous.current = current;
      foundation.sync(current);
    }
  }, [current, foundation]);
  return (
    <span className={[prefix, simple && `${prefix}-simple`].filter(Boolean).join(' ')}>
      {!simple && (
        <span className={`${prefix}-prepend ${prefix}-text-goto`}>
          {prepend !== undefined ? prepend : t('pagination.goto')}
        </span>
      )}
      <InputNumber
        value={value}
        onValueChange={(next) => setValue(next ?? undefined)}
        className={`${prefix}-input`}
        min={1}
        max={Math.max(pages, 1)}
        size={size}
        disabled={disabled}
        hideButton
        formatter={formatPageJumper}
        onChange={foundation.change}
      />
      {append !== undefined && <span className={`${prefix}-append`}>{append}</span>}
      {simple && (
        <>
          <span className={`${prefix}-separator`}>/</span>
          <span className={`${prefix}-total-page`}>{pages}</span>
        </>
      )}
    </span>
  );
}

function PageItem({
  type,
  page = 1,
  step = 5,
  current,
  pages,
  disabled,
  simple,
  style,
  activeStyle,
  children,
  onChange,
}: {
  type: 'page' | 'previous' | 'next' | 'more';
  page?: number;
  step?: number;
  current: number;
  pages: number;
  disabled: boolean;
  simple?: boolean;
  style?: CSSProperties;
  activeStyle?: CSSProperties;
  children?: ReactNode;
  onChange(value: number): void;
}) {
  const prefix = usePrefix('pagination-item');
  const iconPrefix = usePrefix('icon');
  const { t } = useI18n();
  const state = {
    disabled,
    current,
    pages,
    pageNumber: page,
    step,
    isNext: type === 'next',
    get mergedDisabled(): boolean {
      return target.getMergedDisabled();
    },
    get nextPage(): number {
      return target.getNextPage();
    },
  };
  const target =
    type === 'more'
      ? createEllipsisPagerFoundation(state, onChange)
      : createStepPagerFoundation(state, onChange);
  const foundation = type === 'page' ? createPagerFoundation(state, onChange) : target;
  const isDisabled = type === 'page' ? disabled : target.getMergedDisabled();
  const active = type === 'page' && current === page;
  const Tag = simple ? 'span' : 'li';
  return (
    <Tag
      className={[
        prefix,
        active && `${prefix}-active`,
        type !== 'page' && `${prefix}-${type === 'more' ? 'ellipsis' : type}`,
        type !== 'page' && isDisabled && `${prefix}-disabled`,
      ]
        .filter(Boolean)
        .join(' ')}
      style={active ? activeStyle : style}
      tabIndex={isDisabled ? -1 : 0}
      aria-current={active ? 'page' : undefined}
      aria-disabled={isDisabled || undefined}
      aria-label={
        type === 'page'
          ? undefined
          : t(
              type === 'more'
                ? 'a11y.morePages'
                : type === 'next'
                  ? 'a11y.nextPage'
                  : 'a11y.prevPage',
            )
      }
      onClick={(event) => foundation.handleClick(event.nativeEvent)}
      onKeyDown={(event) => foundation.handleKeydown(event.nativeEvent)}
    >
      {children !== undefined ? (
        children
      ) : type === 'page' ? (
        page
      ) : (
        <svg
          className={`${iconPrefix} ${iconPrefix}-${type === 'more' ? 'more' : type === 'next' ? 'right' : 'left'}`}
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          aria-hidden="true"
        >
          {type === 'more' ? (
            <>
              <path
                fill="currentColor"
                stroke="none"
                d="M38 25v-2h2v2zM23 25v-2h2v2zM8 25v-2h2v2z"
              />
              <path d="M38 25v-2h2v2zM23 25v-2h2v2zM8 25v-2h2v2z" />
            </>
          ) : (
            <path
              d={
                type === 'next'
                  ? 'm16 39.513 15.556-15.557L16 8.4'
                  : 'M32 8.4 16.444 23.956 32 39.513'
              }
            />
          )}
        </svg>
      )}
    </Tag>
  );
}

export function Pagination(props: PaginationProps) {
  const {
    total,
    current,
    defaultCurrent = 1,
    pageSize,
    defaultPageSize: _defaultPageSize,
    disabled = false,
    hideOnSinglePage = false,
    simple = false,
    showTotal: _showTotal,
    showMore: _showMore,
    showJumper: _showJumper,
    showPageSize: _showPageSize,
    pageSizeOptions: _pageSizeOptions,
    pageSizeProps: _pageSizeProps,
    size,
    pageItemStyle,
    activePageItemStyle,
    baseSize: _baseSize,
    bufferSize: _bufferSize,
    autoAdjust: _autoAdjust,
    onCurrentChange: _onCurrentChange,
    onChange: _onChange,
    onPageSizeValueChange: _onPageSizeValueChange,
    onPageSizeChange: _onPageSizeChange,
    renderTotal,
    renderPageItem,
    renderPageItemStep,
    pageItemEllipsis,
    jumperPrepend,
    jumperAppend,
    className,
    ...attrs
  } = props;
  const config = useConfig();
  const prefix = usePrefix('pagination');
  const { t } = useI18n();
  const optionPrefix = usePrefix('pagination-options');
  const merged = <K extends keyof PaginationConfig>(key: K, fallback: PaginationConfig[K]) =>
    resolveConfigProp({
      hasLocalProp: Object.hasOwn(props, key),
      localValue: props[key],
      globalValue: config.pagination?.[key],
    }) ?? fallback;
  const [, render] = useState(0);
  const local = useRef({ current: defaultCurrent, pageSize: merged('defaultPageSize', 10)! });
  const refresh = () => render((version) => version + 1);
  const value = current ?? local.current.current;
  const length = pageSize ?? local.current.pageSize;
  const pages = Math.ceil(total / length);
  const live = useRef({ props, base: 6, buffer: 2, autoAdjust: true });
  live.current = {
    props,
    base: merged('baseSize', 6)!,
    buffer: merged('bufferSize', 2)!,
    autoAdjust: merged('autoAdjust', true)!,
  };
  const [foundation] = useState(() =>
    createPaginationFoundation({
      get current() {
        return live.current.props.current ?? local.current.current;
      },
      get pageSize() {
        return live.current.props.pageSize ?? local.current.pageSize;
      },
      get controlledPageSize() {
        return live.current.props.pageSize;
      },
      get pages() {
        return Math.ceil(
          live.current.props.total / (live.current.props.pageSize ?? local.current.pageSize),
        );
      },
      get baseSize() {
        return live.current.base;
      },
      get bufferSize() {
        return live.current.buffer;
      },
      get autoAdjust() {
        return live.current.autoAdjust;
      },
      get disabled() {
        return !!live.current.props.disabled;
      },
      setCurrent(next) {
        local.current.current = next;
        refresh();
      },
      setPageSize(next) {
        local.current.pageSize = next;
        refresh();
      },
      onCurrent(next) {
        live.current.props.onCurrentChange?.(next);
        live.current.props.onChange?.(next);
      },
      onPageSize(next) {
        live.current.props.onPageSizeValueChange?.(next);
        live.current.props.onPageSizeChange?.(next);
      },
    }),
  );
  const previous = useRef({ length, pages });
  useLayoutEffect(() => {
    const old = previous.current;
    previous.current = { length, pages };
    if (old.length !== length || old.pages !== pages)
      foundation.sync(length, pages, old.length, old.pages);
  }, [length, pages, foundation]);
  const options = createPageOptionsFoundation(
    { pageSize: length, sizeOptions: merged('pageSizeOptions', [10, 20, 30, 40, 50])! },
    () => t('pagination.countPerPage'),
    foundation.changePageSize,
  );
  const selectProps = merged('pageSizeProps', undefined);
  const mergedSize = size ?? config.size ?? 'medium';
  const item = (
    type: 'page' | 'previous' | 'next' | 'more',
    page?: number,
    step?: number,
    inline = false,
    key: string | number = type,
  ) => (
    <PageItem
      key={key}
      type={type}
      page={page}
      step={step}
      current={value}
      pages={pages}
      disabled={disabled}
      simple={inline}
      style={pageItemStyle}
      activeStyle={activePageItemStyle}
      onChange={foundation.change}
    >
      {type === 'page'
        ? renderPageItem?.({ page: page! })
        : type === 'more'
          ? pageItemEllipsis
          : renderPageItemStep?.({ type })}
    </PageItem>
  );
  if (hideOnSinglePage && pages <= 1) return null;
  return (
    <div
      {...attrs}
      role="navigation"
      aria-label={t('a11y.pagination')}
      className={[
        prefix,
        `${prefix}-size-${mergedSize}`,
        simple && `${prefix}-simple`,
        disabled && `${prefix}-disabled`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {merged('showTotal', false) && (
        <span className={`${prefix}-total`}>
          {renderTotal ? renderTotal({ total }) : t('pagination.total', total)}
        </span>
      )}
      {simple ? (
        <span className={`${prefix}-simple`}>
          {item('previous', undefined, undefined, true)}
          <PageJumper
            current={value}
            pages={pages}
            simple
            disabled={disabled}
            size={mergedSize}
            onChange={foundation.change}
          />
          {item('next', undefined, undefined, true)}
        </span>
      ) : (
        <ul className={`${prefix}-list`}>
          {item('previous')}
          {foundation
            .getPageList()
            .map((entry) => item(entry.type, entry.pageNumber, entry.step, false, entry.key))}
          {merged('showMore', false) && item('more', undefined, live.current.buffer * 2 + 1)}
          {item('next')}
        </ul>
      )}
      {merged('showPageSize', false) && (
        <span className={optionPrefix}>
          <Select
            modelValue={options.getModelValue()}
            options={options.getOptions()}
            size={mergedSize}
            {...selectProps}
            disabled={disabled || selectProps?.disabled}
            allowClear={false}
            onChange={(next) => {
              selectProps?.onChange?.(next);
              options.handleChange(next);
            }}
          />
        </span>
      )}
      {!simple && merged('showJumper', false) && (
        <PageJumper
          current={value}
          pages={pages}
          simple={false}
          disabled={disabled}
          size={mergedSize}
          prepend={jumperPrepend}
          append={jumperAppend}
          onChange={foundation.change}
        />
      )}
    </div>
  );
}
export default Pagination;
