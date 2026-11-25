import type { ElementType, HTMLAttributes, ReactElement, ReactNode, Ref } from 'react';

import { getValueByPath } from '@sdata/web-core/_utils/get-value-by-path';
import { getFixedCls, getGridSpanStyle, getStyle } from '@sdata/web-core/table/layout';
import { useContext } from 'react';

import type {
  TableCellData,
  TableColumnData,
  TableDataWithRaw,
  TableOperationColumn,
} from './types.js';

import { usePrefix } from '../config-provider/index.js';
import { Ellipsis } from '../ellipsis/index.js';
import IconLoading from '../icon/icon-loading.js';
import { TableContext } from './context.js';
import { useTableCellLoading } from './use-cell-loading.js';
import { useTableRoot } from './use-root.js';
import { tableClassName } from './utils.js';

export interface TdProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
  rowIndex?: number;
  record?: TableDataWithRaw;
  column?: TableColumnData;
  type?: 'normal' | 'operation' | 'checkbox' | 'radio' | 'expand';
  operations?: TableOperationColumn[];
  dataColumns?: TableColumnData[];
  colSpan?: number;
  rowSpan?: number;
  isFixedExpand?: boolean;
  containerWidth?: number;
  showExpandBtn?: boolean | undefined;
  indentSize?: number;
  renderExpandBtn?(record: TableDataWithRaw, stopPropagation?: boolean): ReactNode;
  summary?: boolean;
  renderCell?: ((data: TableCellData) => ReactNode) | undefined;
  component?: ElementType | undefined;
  renderTd?: ((data: TableCellData) => ReactElement) | undefined;
}
const emptyRecord: TableDataWithRaw = { key: '', raw: {} };

export function Td({
  rowIndex = -1,
  record = emptyRecord,
  column = {},
  type: _type,
  operations = [],
  dataColumns = [],
  colSpan = 1,
  rowSpan = 1,
  isFixedExpand = false,
  containerWidth,
  showExpandBtn = false,
  indentSize = 0,
  renderExpandBtn,
  summary = false,
  renderCell,
  component = 'div',
  renderTd,
  children,
  className,
  style,
  ...attrs
}: TdProps) {
  const prefix = usePrefix('table');
  const autoTooltip = usePrefix('auto-tooltip');
  const context = useContext(TableContext);
  const loading = useTableCellLoading(record, context);
  const data = { record: record.raw, column, rowIndex };
  const customClass = summary ? column.summaryCellClass : column.bodyCellClass;
  const customStyle = summary ? column.summaryCellStyle : column.bodyCellStyle;
  const content =
    children !== undefined
      ? children
      : renderCell
        ? renderCell(data)
        : column.slots?.cell
          ? column.slots.cell(data)
          : column.render
            ? column.render(data)
            : column.slotName && context.cellSlots?.[column.slotName]
              ? context.cellSlots[column.slotName](data)
              : String(getValueByPath(record.raw, column.dataIndex) ?? '');
  return useTableRoot(
    component,
    renderTd?.(data),
    {
      ...attrs,
      role: 'cell',
      className: tableClassName(
        `${prefix}-td`,
        {
          [`${prefix}-col-sorted`]:
            !!column.dataIndex && context.sorter?.field === column.dataIndex,
          [`${prefix}-td-resizing`]:
            !!column.dataIndex && context.resizingColumn === column.dataIndex,
        },
        getFixedCls(prefix, column),
        column.cellClass,
        typeof customClass === 'function' ? customClass(record.raw) : customClass,
        className,
      ),
      style: {
        ...getStyle(column, { dataColumns, operations }),
        ...getGridSpanStyle(rowSpan, colSpan),
        ...column.cellStyle,
        ...(typeof customStyle === 'function' ? customStyle(record.raw) : customStyle),
        ...style,
      },
    },
    <span
      className={tableClassName(
        `${prefix}-cell`,
        `${prefix}-cell-align-${column.align ?? 'left'}`,
        {
          [`${prefix}-cell-fixed-expand`]: isFixedExpand,
          [`${prefix}-cell-expand-icon`]: showExpandBtn,
        },
      )}
      style={isFixedExpand && containerWidth ? { width: `${containerWidth}px` } : undefined}
    >
      {indentSize > 0 && <span style={{ paddingLeft: `${indentSize}px` }} />}
      {showExpandBtn && (
        <span className={`${prefix}-cell-inline-icon`} onClick={loading.handleClick}>
          {loading.isLoading ? <IconLoading /> : renderExpandBtn?.(record, false)}
        </span>
      )}
      {column.ellipsis && column.tooltip ? (
        <Ellipsis
          className={`${autoTooltip} ${prefix}-td-content`}
          tooltip={typeof column.tooltip === 'object' ? column.tooltip : true}
          tooltipContent={typeof column.tooltip === 'object' ? column.tooltip.content : undefined}
        >
          {content}
        </Ellipsis>
      ) : (
        <span
          className={tableClassName(
            `${prefix}-td-content`,
            column.ellipsis && `${prefix}-text-ellipsis`,
          )}
        >
          {content}
        </span>
      )}
    </span>,
  );
}
