import type { ReactNode, Ref } from 'react';

import { createSelectDropdownFoundation } from '@sdata/web-core/select/dropdown';
import { useImperativeHandle, useRef, useState } from 'react';

import type { ScrollbarExposed, ScrollbarProps } from '../scrollbar/index.js';
import type { SpinProps } from '../spin/index.js';

import { useConfig, usePrefix } from '../config-provider/index.js';
import { Empty } from '../empty/index.js';
import { Scrollbar } from '../scrollbar/index.js';
import { Spin } from '../spin/index.js';

export interface SelectDropdownRef {
  readonly wrapperRef: HTMLElement | undefined;
}
export interface SelectDropdownProps {
  className?: string;
  loading?: boolean;
  spinProps?: SpinProps;
  empty?: boolean;
  virtualList?: ReactNode;
  bottomOffset?: number;
  scrollbar?: boolean | ScrollbarProps;
  header?: ReactNode;
  footer?: ReactNode;
  emptyContent?: ReactNode;
  showHeaderOnEmpty?: boolean;
  showFooterOnEmpty?: boolean;
  onScroll?: ((event: Event) => void) | undefined;
  onReachBottom?: ((event: Event) => void) | undefined;
  children?: ReactNode;
  ref?: Ref<SelectDropdownRef>;
}
export function SelectDropdown({
  className,
  loading,
  spinProps,
  empty,
  virtualList,
  bottomOffset = 0,
  scrollbar = true,
  header,
  footer,
  emptyContent,
  showHeaderOnEmpty,
  showFooterOnEmpty,
  onScroll,
  onReachBottom,
  children,
  ref,
}: SelectDropdownProps) {
  const prefix = usePrefix('select-dropdown');
  const config = useConfig();
  const scrollbarProps = typeof scrollbar === 'object' ? scrollbar : {};
  const wrapper = useRef<ScrollbarExposed>(null);
  const live = useRef({ bottomOffset, onScroll, onReachBottom });
  live.current = { bottomOffset, onScroll, onReachBottom };
  const [foundation] = useState(() =>
    createSelectDropdownFoundation(
      {
        get bottomOffset() {
          return live.current.bottomOffset;
        },
      },
      (event) => live.current.onScroll?.(event),
      (event) => live.current.onReachBottom?.(event),
    ),
  );
  useImperativeHandle(
    ref,
    () => ({
      get wrapperRef() {
        return wrapper.current?.elements()?.scrollOffsetElement;
      },
    }),
    [],
  );
  return (
    <div
      className={[
        prefix,
        className,
        header != null && `${prefix}-has-header`,
        footer != null && `${prefix}-has-footer`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {header != null && (!empty || showHeaderOnEmpty) && (
        <div className={`${prefix}-header`}>{header}</div>
      )}
      {loading ? (
        <Spin
          {...spinProps}
          className={[`${prefix}-loading`, spinProps?.className].filter(Boolean).join(' ')}
        />
      ) : empty ? (
        <div className={`${prefix}-empty`}>
          {emptyContent ?? config.renderEmpty?.({ component: 'select' }) ?? (
            <Empty inConfigProvider />
          )}
        </div>
      ) : null}
      {virtualList != null ? (
        !loading && !empty && virtualList
      ) : (
        <Scrollbar
          type="embed"
          {...scrollbarProps}
          ref={wrapper}
          className={[`${prefix}-list-wrapper`, scrollbarProps.className].filter(Boolean).join(' ')}
          style={{ ...scrollbarProps.style, ...(loading || empty ? { display: 'none' } : {}) }}
          disableHorizontal
          onScroll={(event) => {
            scrollbarProps.onScroll?.(event);
            foundation.handleScroll(event);
          }}
        >
          <ul role="listbox" className={`${prefix}-list`}>
            {children}
          </ul>
        </Scrollbar>
      )}
      {footer != null && (!empty || showFooterOnEmpty) && (
        <div className={`${prefix}-footer`}>{footer}</div>
      )}
    </div>
  );
}
