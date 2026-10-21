import type { CSSProperties, VNode } from 'vue';

import { mapRawTableData as mapSharedRawData } from '@sdata/web-core/table/data';
import * as layout from '@sdata/web-core/table/layout';
import * as selection from '@sdata/web-core/table/selection';

import type { BaseType, ClassName } from '../_utils/types';
import type { TableColumnData, TableDataWithRaw, TableOperationColumn } from './interface';

import { isArray } from '../_utils/is';
import {
  resolveProps,
  isNamedComponent,
  isSlotsChildren,
  isArrayChildren,
} from '../_utils/vue-utils';

// Keep the existing Vue deep-entry signatures, including ReturnType/Parameters.
export const getGroupColumns = layout.getGroupColumns<TableColumnData>;
export const getOperationFixedNumber: (
  column: TableOperationColumn,
  operations: TableOperationColumn[],
) => number = layout.getOperationFixedNumber;
export const getFixedNumber: (
  column: TableColumnData,
  options: { dataColumns: TableColumnData[]; operations: TableOperationColumn[] },
) => number = layout.getFixedNumber;
export const getOperationFixedCls: (prefix: string, column: TableOperationColumn) => ClassName[] =
  layout.getOperationFixedCls;
export const getFixedCls: (
  prefix: string,
  column: Pick<TableColumnData, 'fixed' | 'isLastLeftFixed' | 'isFirstRightFixed'>,
) => ClassName[] = layout.getFixedCls;
export const getStyle: (
  column: TableColumnData,
  options: { dataColumns: TableColumnData[]; operations: TableOperationColumn[] },
) => CSSProperties = layout.getStyle;
export const getOperationStyle: (
  column: TableOperationColumn,
  operations: TableOperationColumn[],
) => ReturnType<typeof layout.getOperationStyle> = layout.getOperationStyle;
export const getTableGridTemplate: (
  dataColumns: TableColumnData[],
  operations: TableOperationColumn[],
  columnWidth?: Record<string, number>,
) => string = layout.getTableGridTemplate;
export const getGridSpanStyle: (rowSpan?: number, colSpan?: number) => CSSProperties =
  layout.getGridSpanStyle;
export const getLeafKeys: (record: TableDataWithRaw) => BaseType[] = selection.getLeafKeys;
export const getSelectionStatus: (
  selectedRowKeys: BaseType[],
  leafKeys: BaseType[],
) => { checked: boolean; indeterminate: boolean } = selection.getSelectionStatus;
export { mapArrayWithChildren } from '@sdata/web-core/table/data';

/**
 * Obtain table column data through the <TableColumnData> component
 * @param {VNode[]} vns
 */
export const getColumnsFromSlot = (vns: VNode[]) => {
  const columns: TableColumnData[] = [];
  for (const vn of vns) {
    if (isNamedComponent(vn, 'TableColumn')) {
      const column = resolveProps(vn) as TableColumnData;
      if (isSlotsChildren(vn, vn.children)) {
        if (vn.children.default) {
          column.children = getColumnsFromSlot(vn.children.default());
        }
        if (vn.children.cell) {
          column.render = vn.children.cell;
        }
        if (vn.children.title) {
          column.title = vn.children.title;
        }
      }
      columns.push(column);
    } else if (isArrayChildren(vn, vn.children)) {
      columns.push(...getColumnsFromSlot(vn.children as VNode[]));
    } else if (isArray(vn)) {
      columns.push(...getColumnsFromSlot(vn as VNode[]));
    }
  }
  return columns;
};

export function mapRawTableData<T extends TableDataWithRaw[]>(arr: T): TableDataWithRaw['raw'][] {
  return mapSharedRawData(arr);
}
