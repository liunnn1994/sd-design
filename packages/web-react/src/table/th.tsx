import type { ElementType, HTMLAttributes, ReactElement, Ref } from 'react';

import { isActivationKey } from '@sdata/web-core/_utils/keyboard';
import { getFixedCls, getGridSpanStyle, getStyle } from '@sdata/web-core/table/layout';
import { useContext, useImperativeHandle, useRef } from 'react';

import type { TableColumnData, TableOperationColumn } from './types.js';

import { Button } from '../button/index.js';
import { Checkbox } from '../checkbox/index.js';
import { usePrefix } from '../config-provider/index.js';
import { Ellipsis } from '../ellipsis/index.js';
import IconCaretDown from '../icon/icon-caret-down.js';
import IconCaretUp from '../icon/icon-caret-up.js';
import IconFilter from '../icon/icon-filter.js';
import { useI18n } from '../locale/index.js';
import { Radio } from '../radio/index.js';
import { Trigger } from '../trigger/index.js';
import { TableContext } from './context.js';
import { useTableColumnFilter, useTableColumnSorter } from './use-column-query.js';
import { useTableRoot } from './use-root.js';
import { renderTableContent, tableClassName } from './utils.js';

export interface ThInstance {
  getThElement(): HTMLElement | null;
}
export interface ThProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<ThInstance>;
  column?: TableColumnData;
  operations?: TableOperationColumn[];
  dataColumns?: TableColumnData[];
  resizable?: boolean;
  component?: ElementType | undefined;
  renderTh?: ((data: { column: TableColumnData }) => ReactElement) | undefined;
}
export function Th({
  column = {},
  operations = [],
  dataColumns = [],
  resizable = false,
  component = 'div',
  renderTh,
  children,
  ref,
  className,
  style,
  ...attrs
}: ThProps) {
  const prefix = usePrefix('table');
  const hover = usePrefix('icon-hover');
  const autoTooltip = usePrefix('auto-tooltip');
  const context = useContext(TableContext);
  const element = useRef<HTMLElement>(null);
  useImperativeHandle(ref, () => ({ getThElement: () => element.current }), []);
  const { t } = useI18n();
  const sort = useTableColumnSorter(column, context);
  const filter = useTableColumnFilter(column, context);
  const alignLeft = column.filterable?.alignLeft ?? context.filterIconAlignLeft;
  const filterData = {
    filterValue: filter.columnFilterValue,
    setFilterValue: filter.setFilterValue,
    handleFilterConfirm: filter.handleFilterConfirm,
    handleFilterReset: filter.handleFilterReset,
  };
  const title =
    children !== undefined
      ? children
      : column.titleSlotName && context.titleSlots?.[column.titleSlotName]
        ? context.titleSlots[column.titleSlotName]({ column })
        : column.slots?.title
          ? column.slots.title()
          : renderTableContent(column.title);
  const customFilter =
    column.slots?.['filter-content'] ??
    (column.filterable?.slotName ? context.filterSlots?.[column.filterable.slotName] : undefined) ??
    column.filterable?.renderContent;
  const filters = column.filterable && (
    <Trigger
      popupVisible={filter.filterPopupVisible}
      trigger="click"
      autoFitPosition
      popupOffset={alignLeft ? 4 : 0}
      {...column.filterable.triggerProps}
      floatingOptions={
        column.filterable.floatingOptions ?? column.filterable.triggerProps?.floatingOptions
      }
      onPopupVisibleChange={filter.handleFilterPopupVisibleChange}
      content={
        <div onClick={(event) => event.stopPropagation()}>
          {customFilter ? (
            customFilter(filterData)
          ) : (
            <div className={`${prefix}-filters-content`}>
              <ul className={`${prefix}-filters-list`}>
                {column.filterable.filters?.map((item, index) => (
                  <li key={index} className={`${prefix}-filters-item`}>
                    {filter.isMultipleFilter ? (
                      <Checkbox
                        value={item.value}
                        modelValue={filter.columnFilterValue}
                        uninjectGroupContext
                        onChange={(value) => filter.handleCheckboxFilterChange(value as string[])}
                      >
                        {renderTableContent(item.text)}
                      </Checkbox>
                    ) : (
                      <Radio
                        value={item.value}
                        modelValue={filter.columnFilterValue[0] ?? ''}
                        uninjectGroupContext
                        onChange={(value) => filter.handleRadioFilterChange(value as string)}
                      >
                        {renderTableContent(item.text)}
                      </Radio>
                    )}
                  </li>
                ))}
              </ul>
              <div className={`${prefix}-filters-bottom`}>
                <Button
                  size="mini"
                  onClick={(event) => filter.handleFilterReset(event.nativeEvent)}
                >
                  {t('table.resetText')}
                </Button>
                <Button
                  type="primary"
                  size="mini"
                  onClick={(event) => filter.handleFilterConfirm(event.nativeEvent)}
                >
                  {t('table.okText')}
                </Button>
              </div>
            </div>
          )}
        </div>
      }
    >
      <span
        className={tableClassName(hover, !alignLeft && `${hover}-disabled`, `${prefix}-filters`, {
          [`${prefix}-filters-active`]: filter.isFilterActive,
          [`${prefix}-filters-open`]: filter.filterPopupVisible,
          [`${prefix}-filters-align-left`]: !!alignLeft,
        })}
        onClick={(event) => event.stopPropagation()}
      >
        {column.slots?.['filter-icon']?.() ?? column.filterable.icon?.() ?? <IconFilter />}
      </span>
    </Trigger>
  );
  return useTableRoot(
    component,
    renderTh?.({ column }),
    {
      ...attrs,
      'ref': element,
      'role': 'columnheader',
      'aria-sort': sort.hasSorter
        ? sort.sortOrder === 'ascend'
          ? 'ascending'
          : sort.sortOrder === 'descend'
            ? 'descending'
            : 'none'
        : undefined,
      'className': tableClassName(
        `${prefix}-th`,
        {
          [`${prefix}-col-sorted`]: !!sort.sortOrder,
          [`${prefix}-th-resizing`]:
            !!column.dataIndex && context.resizingColumn === column.dataIndex,
        },
        getFixedCls(prefix, column),
        column.cellClass,
        column.headerCellClass,
        className,
      ),
      'style': {
        ...getStyle(column, { dataColumns, operations }),
        ...getGridSpanStyle(column.rowSpan, column.colSpan),
        ...column.cellStyle,
        ...column.headerCellStyle,
        ...style,
      },
    },
    <>
      <span
        className={tableClassName(
          `${prefix}-cell`,
          `${prefix}-cell-align-${column.align ?? (column.children ? 'center' : 'left')}`,
          {
            [`${prefix}-cell-with-sorter`]: sort.hasSorter,
            [`${prefix}-cell-next-ascend`]: sort.hasSorter && sort.nextSortOrder === 'ascend',
            [`${prefix}-cell-next-descend`]: sort.hasSorter && sort.nextSortOrder === 'descend',
            [`${prefix}-cell-with-filter`]: !!alignLeft,
          },
        )}
        role={sort.hasSorter ? 'button' : undefined}
        tabIndex={sort.hasSorter ? 0 : undefined}
        onClick={sort.hasSorter ? (event) => sort.handleClickSorter(event.nativeEvent) : undefined}
        onKeyDown={(event) => {
          if (
            sort.hasSorter &&
            event.target === event.currentTarget &&
            isActivationKey(event.nativeEvent)
          ) {
            event.preventDefault();
            sort.handleClickSorter(event.nativeEvent);
          }
        }}
      >
        {column.ellipsis && column.tooltip ? (
          <Ellipsis
            className={`${autoTooltip} ${prefix}-th-title`}
            tooltip={typeof column.tooltip === 'object' ? column.tooltip : true}
            tooltipContent={typeof column.tooltip === 'object' ? column.tooltip.content : undefined}
          >
            {title}
          </Ellipsis>
        ) : (
          <span
            className={tableClassName(
              `${prefix}-th-title`,
              column.ellipsis && `${prefix}-text-ellipsis`,
            )}
          >
            {title}
          </span>
        )}
        {sort.hasSorter && (
          <span className={`${prefix}-sorter`}>
            {sort.hasAscendBtn && (
              <div
                className={tableClassName(
                  `${prefix}-sorter-icon`,
                  sort.sortOrder === 'ascend' && `${prefix}-sorter-icon-active`,
                )}
              >
                <IconCaretUp />
              </div>
            )}
            {sort.hasDescendBtn && (
              <div
                className={tableClassName(
                  `${prefix}-sorter-icon`,
                  sort.sortOrder === 'descend' && `${prefix}-sorter-icon-active`,
                )}
              >
                <IconCaretDown />
              </div>
            )}
          </span>
        )}
        {alignLeft && filters}
      </span>
      {!alignLeft && filters}
      {resizable && (
        <span
          className={`${prefix}-column-handle`}
          onMouseDown={(event) => {
            if (column.dataIndex) context.onThMouseDown?.(column.dataIndex, event.nativeEvent);
          }}
        />
      )}
    </>,
  );
}
