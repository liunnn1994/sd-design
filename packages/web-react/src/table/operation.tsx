import type { HTMLAttributes, ReactNode } from 'react';

import {
  createTableOperationFoundation,
  getTableHeaderCheckboxStatus,
} from '@sdata/web-core/table/cell';
import {
  getGridSpanStyle,
  getOperationFixedCls,
  getOperationStyle,
} from '@sdata/web-core/table/layout';
import { useContext } from 'react';

import type { RowKey, TableDataWithRaw, TableOperationColumn } from './types.js';

import { Checkbox } from '../checkbox/index.js';
import { usePrefix } from '../config-provider/index.js';
import IconDragDotVertical from '../icon/icon-drag-dot-vertical.js';
import { Radio } from '../radio/index.js';
import { TableContext } from './context.js';
import { renderTableContent, tableClassName } from './utils.js';

export interface OperationThProps extends HTMLAttributes<HTMLDivElement> {
  operationColumn: TableOperationColumn;
  operations: TableOperationColumn[];
  rowSpan?: number;
  selectAll?: boolean;
}
export function OperationTh({
  operationColumn,
  operations,
  rowSpan = 1,
  selectAll = false,
  className,
  style,
  ...attrs
}: OperationThProps) {
  const prefix = usePrefix('table');
  const context = useContext(TableContext);
  const status = getTableHeaderCheckboxStatus(context);
  return (
    <div
      {...attrs}
      className={tableClassName(
        `${prefix}-th`,
        `${prefix}-operation`,
        selectAll && `${prefix}-checkbox`,
        getOperationFixedCls(prefix, operationColumn),
        className,
      )}
      style={{
        ...getOperationStyle(operationColumn, operations),
        ...getGridSpanStyle(rowSpan),
        ...style,
      }}
    >
      <span className={`${prefix}-cell`}>
        {selectAll ? (
          <Checkbox
            modelValue={status.checked}
            indeterminate={status.indeterminate}
            uninjectGroupContext
            onChange={(checked) => context.onSelectAll?.(checked as boolean)}
          >
            {renderTableContent(operationColumn.title)}
          </Checkbox>
        ) : (
          renderTableContent(operationColumn.title)
        )}
      </span>
    </div>
  );
}

export interface OperationTdProps extends HTMLAttributes<HTMLDivElement> {
  operationColumn: TableOperationColumn;
  operations: TableOperationColumn[];
  record: TableDataWithRaw;
  hasExpand?: boolean;
  selectedRowKeys?: RowKey[];
  renderExpandBtn?(record: TableDataWithRaw, stopPropagation?: boolean): ReactNode;
  colSpan?: number;
  rowSpan?: number;
  summary?: boolean;
  dragHandleIcon?: ReactNode;
}
export function OperationTd({
  operationColumn,
  operations,
  record,
  hasExpand = false,
  selectedRowKeys,
  renderExpandBtn,
  colSpan = 1,
  rowSpan = 1,
  summary = false,
  dragHandleIcon,
  className,
  style,
  ...attrs
}: OperationTdProps) {
  const prefix = usePrefix('table');
  const context = useContext(TableContext);
  const foundation = createTableOperationFoundation({ record, selectedRowKeys }, context, {
    get leafKeys(): RowKey[] {
      return foundation.getEnabledLeafKeys();
    },
    get selectionStatus(): { checked: boolean; indeterminate: boolean } {
      return foundation.getCurrentSelectionStatus();
    },
    get isTreeSelection(): boolean {
      return foundation.getIsTreeSelection();
    },
  });
  const tree = foundation.getIsTreeSelection();
  const status = foundation.getCurrentSelectionStatus();
  const name = operationColumn.name;
  return (
    <div
      {...attrs}
      className={tableClassName(
        `${prefix}-td`,
        `${prefix}-operation`,
        {
          [`${prefix}-checkbox`]: name === 'selection-checkbox',
          [`${prefix}-radio`]: name === 'selection-radio',
          [`${prefix}-expand`]: name === 'expand',
          [`${prefix}-drag-handle`]: name === 'drag-handle',
        },
        getOperationFixedCls(prefix, operationColumn),
        className,
      )}
      style={{
        ...getOperationStyle(operationColumn, operations),
        ...getGridSpanStyle(rowSpan, colSpan),
        ...style,
      }}
    >
      <span className={`${prefix}-cell`}>
        {!summary &&
          (operationColumn.render ? (
            operationColumn.render(record.raw)
          ) : name === 'selection-checkbox' ? (
            <Checkbox
              modelValue={foundation.getCheckboxValue()}
              indeterminate={tree ? status.indeterminate : undefined}
              disabled={!!record.disabled}
              uninjectGroupContext
              onChange={foundation.handleCheckboxChange}
              onClick={(event) => event.stopPropagation()}
            />
          ) : name === 'selection-radio' ? (
            <Radio
              modelValue={selectedRowKeys?.includes(record.key) ?? false}
              disabled={!!record.disabled}
              uninjectGroupContext
              onChange={foundation.handleRadioChange}
              onClick={(event) => event.stopPropagation()}
            />
          ) : name === 'expand' && hasExpand ? (
            renderExpandBtn?.(record)
          ) : name === 'drag-handle' ? (
            (dragHandleIcon ?? <IconDragDotVertical />)
          ) : null)}
      </span>
    </div>
  );
}
