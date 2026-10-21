import { isArray, isNull, isUndefined } from '../_utils/is.js';

export interface LayoutColumn<Column> {
  dataIndex?: string;
  children?: Column[];
  parent?: Column;
  fixed?: 'left' | 'right';
  width?: number;
  minWidth?: number;
  _resizeWidth?: number;
  colSpan?: number;
  rowSpan?: number;
  isLastLeftFixed?: boolean;
  isFirstRightFixed?: boolean;
}
export interface OperationColumn {
  name: string;
  width?: number | undefined;
  fixed?: boolean;
  isLastLeftFixed?: boolean;
}
export type LayoutStyle = { left?: string; right?: string; gridRow?: string; gridColumn?: string };
export type LayoutClass = string | Record<string, boolean>;

export function getTableFixedColumns(state: {
  readonly rowSelection: { fixed?: boolean } | undefined;
  readonly expandable: { fixed?: boolean } | undefined;
  readonly draggable: { fixed?: boolean } | undefined;
  readonly columns: readonly { fixed?: 'left' | 'right' }[];
}) {
  let left = false;
  let right = false;
  let leftData = false;
  if (state.rowSelection?.fixed || state.expandable?.fixed || state.draggable?.fixed) left = true;
  for (const column of state.columns) {
    if (column.fixed === 'left') {
      left = true;
      leftData = true;
    } else if (column.fixed === 'right') right = true;
  }
  return { left, right, leftData };
}

export interface TableOperationDescriptor<Title> extends OperationColumn {
  title?: Title | undefined;
}
interface TableOperationOptions<Title> {
  title?: Title | undefined;
  width?: number | undefined;
  fixed?: boolean | undefined;
}
export function getTableOperations<Title>(state: {
  readonly hasLeftFixedColumn: boolean;
  readonly hasRightFixedColumn: boolean;
  readonly hasLeftFixedDataColumns: boolean;
  readonly draggable: TableOperationOptions<Title> | undefined;
  readonly expandable: TableOperationOptions<Title> | undefined;
  readonly rowSelection: (TableOperationOptions<Title> & { type?: string }) | undefined;
  readonly operations:
    | ((columns: {
        dragHandle: TableOperationDescriptor<Title> | undefined;
        expand: TableOperationDescriptor<Title> | undefined;
        selection: TableOperationDescriptor<Title> | undefined;
      }) => TableOperationDescriptor<Title>[])
    | undefined;
}) {
  const operations: TableOperationDescriptor<Title>[] = [];
  const hasFixedColumn = state.hasLeftFixedColumn || state.hasRightFixedColumn;
  let dragHandle: TableOperationDescriptor<Title> | undefined;
  let expand: TableOperationDescriptor<Title> | undefined;
  let selection: TableOperationDescriptor<Title> | undefined;
  if (state.draggable) {
    dragHandle = {
      name: 'drag-handle',
      title: state.draggable.title,
      width: state.draggable.width,
      fixed: state.draggable.fixed || hasFixedColumn,
    };
    operations.push(dragHandle);
  }
  if (state.expandable) {
    expand = {
      name: 'expand',
      title: state.expandable.title,
      width: state.expandable.width,
      fixed: state.expandable.fixed || hasFixedColumn,
    };
    operations.push(expand);
  }
  if (state.rowSelection) {
    selection = {
      name: state.rowSelection.type === 'radio' ? 'selection-radio' : 'selection-checkbox',
      title: state.rowSelection.title,
      width: state.rowSelection.width,
      fixed: state.rowSelection.fixed || hasFixedColumn,
    };
    operations.push(selection);
  }
  if (
    !state.hasLeftFixedDataColumns &&
    operations.length > 0 &&
    operations[operations.length - 1].fixed
  ) {
    operations[operations.length - 1].isLastLeftFixed = true;
  }
  const operationsFn = state.operations;
  return typeof operationsFn === 'function'
    ? operationsFn({ dragHandle, expand, selection })
    : operations;
}

const getDataColumnsNumber = <Column extends LayoutColumn<Column>>(columns: Column[]): number => {
  let count = 0;

  const travelColumns = (columns: Column[]) => {
    if (isArray(columns) && columns.length > 0) {
      for (const item of columns) {
        if (!item.children) {
          count += 1;
        } else {
          travelColumns(item.children);
        }
      }
    }
  };
  travelColumns(columns);

  return count;
};

// Get the total number of rows in the header
const getTotalHeaderRows = <Column extends LayoutColumn<Column>>(columns: Column[]): number => {
  let count = 0;
  if (isArray(columns) && columns.length > 0) {
    count = 1;
    for (const item of columns) {
      if (item.children) {
        const depth = getTotalHeaderRows(item.children);
        if (depth > 0) {
          count = Math.max(count, depth + 1);
        }
      }
    }
  }
  return count;
};

const setParentFixed = <Column extends LayoutColumn<Column>>(
  column: Column,
  fixed: 'left' | 'right',
) => {
  let { parent } = column;
  while (parent) {
    if (parent.fixed === fixed) {
      if (fixed === 'left') {
        parent.isLastLeftFixed = true;
      } else {
        parent.isFirstRightFixed = true;
      }
    }
    parent = parent.parent;
  }
};

// Get the grouped header row data
export const getGroupColumns = <Column extends LayoutColumn<Column>>(
  columns: Column[],
  columnMap: Map<string, Column>,
  columnWidth: Record<string, number>,
) => {
  const totalHeaderRows = getTotalHeaderRows(columns);

  columnMap.clear();
  const dataColumns: Column[] = [];
  const groupColumns: Column[][] = [...Array(totalHeaderRows)].map(() => []);

  // For recording
  let lastLeftFixedIndex: number | undefined;
  let firstRightFixedIndex: number | undefined;

  const travelColumns = (
    columns: Column[],
    {
      level = 0,
      parent,
      fixed,
    }: {
      level?: number;
      parent?: Column;
      fixed?: 'left' | 'right';
    } = {},
  ) => {
    for (const item of columns) {
      const cell: Column = { ...item, parent };
      if (isArray(cell.children)) {
        cell.fixed = cell.fixed ?? fixed;
        const colSpan = getDataColumnsNumber(cell.children);
        if (colSpan > 1) {
          cell.colSpan = colSpan;
        }
        groupColumns[level].push(cell);
        travelColumns(cell.children, {
          level: level + 1,
          parent: cell,
          fixed: cell.fixed,
        });
      } else {
        // Minimum header
        const rowSpan = totalHeaderRows - level;
        if (rowSpan > 1) {
          cell.rowSpan = rowSpan;
        }
        if (fixed || cell.fixed) {
          cell.fixed = cell.fixed ?? fixed;
          if (cell.fixed === 'left') {
            lastLeftFixedIndex = dataColumns.length;
          } else if (isUndefined(firstRightFixedIndex)) {
            firstRightFixedIndex = dataColumns.length;
          }
        }

        if (isUndefined(cell.dataIndex) || isNull(cell.dataIndex)) {
          cell.dataIndex = `__sd_data_index_${dataColumns.length}`;
        }

        if (Object.hasOwn(columnWidth, cell.dataIndex) && columnWidth[cell.dataIndex]) {
          cell._resizeWidth = columnWidth[cell.dataIndex];
        }

        // dataColumns和groupColumns公用一个cell的引用
        columnMap.set(cell.dataIndex, cell);
        dataColumns.push(cell);
        groupColumns[level].push(cell);
      }
    }
  };

  travelColumns(columns);

  if (!isUndefined(lastLeftFixedIndex)) {
    dataColumns[lastLeftFixedIndex].isLastLeftFixed = true;
    setParentFixed(dataColumns[lastLeftFixedIndex], 'left');
  }
  if (!isUndefined(firstRightFixedIndex)) {
    dataColumns[firstRightFixedIndex].isFirstRightFixed = true;
    setParentFixed(dataColumns[firstRightFixedIndex], 'right');
  }

  return { dataColumns, groupColumns };
};

const getOperationColumnIndex = (operations: OperationColumn[], name: string) => {
  for (let i = 0; i < operations.length; i++) {
    if (operations[i].name === name) {
      return i;
    }
  }
  return -1;
};

export const getOperationFixedNumber = (column: OperationColumn, operations: OperationColumn[]) => {
  const index = getOperationColumnIndex(operations, column.name);
  if (index <= 0) {
    return 0;
  }
  let count = 0;
  const _operations = operations.slice(0, index);
  for (const item of _operations) {
    count += item.width ?? 40;
  }

  return count;
};

const getFirstDataColumn = <Column extends LayoutColumn<Column>>(column: Column): Column => {
  if (column.children && column.children.length > 0) return getFirstDataColumn(column.children[0]);
  return column;
};

const getLastDataColumn = <Column extends LayoutColumn<Column>>(column: Column): Column => {
  if (column.children && column.children.length > 0)
    return getLastDataColumn(column.children[column.children.length - 1]);
  return column;
};

// Get the location data of a fixed column
export const getFixedNumber = <Column extends LayoutColumn<Column>>(
  column: Column,
  {
    dataColumns,
    operations,
  }: {
    dataColumns: Column[];
    operations: OperationColumn[];
  },
) => {
  let count = 0;

  if (column.fixed === 'left') {
    for (const item of operations) {
      count += item.width ?? 40;
    }
    const first = getFirstDataColumn(column);
    for (const item of dataColumns) {
      if (first.dataIndex === item.dataIndex) {
        break;
      }
      count += item._resizeWidth ?? item.width ?? 0;
    }
    return count;
  }

  const last = getLastDataColumn(column);
  for (let i = dataColumns.length - 1; i > 0; i--) {
    const item = dataColumns[i];
    if (last.dataIndex === item.dataIndex) {
      break;
    }

    if (item.fixed === 'right') {
      count += item._resizeWidth ?? item.width ?? 0;
    }
  }
  return count;
};

export const getOperationFixedCls = (prefixCls: string, column: OperationColumn): LayoutClass[] => {
  if (column.fixed) {
    return [
      `${prefixCls}-col-fixed-left`,
      {
        [`${prefixCls}-col-fixed-left-last`]: Boolean(column.isLastLeftFixed),
      },
    ];
  }
  return [];
};

export const getFixedCls = (
  prefixCls: string,
  column: Pick<LayoutColumn<unknown>, 'fixed' | 'isLastLeftFixed' | 'isFirstRightFixed'>,
): LayoutClass[] => {
  if (column.fixed === 'left') {
    return [
      `${prefixCls}-col-fixed-left`,
      {
        [`${prefixCls}-col-fixed-left-last`]: Boolean(column.isLastLeftFixed),
      },
    ];
  }
  if (column.fixed === 'right') {
    return [
      `${prefixCls}-col-fixed-right`,
      {
        [`${prefixCls}-col-fixed-right-first`]: Boolean(column.isFirstRightFixed),
      },
    ];
  }
  return [];
};

export const getStyle = <Column extends LayoutColumn<Column>>(
  column: Column,
  {
    dataColumns,
    operations,
  }: {
    dataColumns: Column[];
    operations: OperationColumn[];
  },
): LayoutStyle => {
  if (column.fixed) {
    const offset = `${getFixedNumber(column, { dataColumns, operations })}px`;
    if (column.fixed === 'left') {
      return {
        left: offset,
      };
    }
    return {
      right: offset,
    };
  }
  return {};
};

export const getOperationStyle = (column: OperationColumn, operations: OperationColumn[]) => {
  if (column.fixed) {
    return {
      left: `${getOperationFixedNumber(column, operations)}px`,
    };
  }
  return {};
};

const getColumnTrack = (width?: number, minWidth?: number) => {
  if (width) {
    return `${Math.max(width, minWidth || 0)}px`;
  }
  if (minWidth) {
    return `minmax(${minWidth}px, 1fr)`;
  }
  return 'minmax(0, 1fr)';
};

export const getTableGridTemplate = <Column extends LayoutColumn<Column>>(
  dataColumns: Column[],
  operations: OperationColumn[],
  columnWidth?: Record<string, number>,
) =>
  operations
    .map((item) => `${item.width ?? 40}px`)
    .concat(
      dataColumns.map((item) =>
        getColumnTrack(
          (item.dataIndex && columnWidth && Object.hasOwn(columnWidth, item.dataIndex)
            ? columnWidth[item.dataIndex]
            : undefined) || item.width,
          item.minWidth,
        ),
      ),
    )
    .join(' ');

export const getGridSpanStyle = (rowSpan = 1, colSpan = 1): LayoutStyle => ({
  ...(rowSpan > 1 ? { gridRow: `span ${rowSpan}` } : {}),
  ...(colSpan > 1 ? { gridColumn: `span ${colSpan}` } : {}),
});
