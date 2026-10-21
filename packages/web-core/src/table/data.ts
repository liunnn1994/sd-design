import type { Filters, Sorter } from './query.js';
import type { RowKey } from './selection.js';

import { getValueByPath, setValueByPath } from '../_utils/get-value-by-path.js';
import { isArray, isFunction, isNull, isNumber, isUndefined } from '../_utils/is.js';

/** Render content is opaque to the data engine. */
export interface RawRow<Raw> extends Record<string, unknown> {
  children?: Raw[];
  expand?: unknown;
  disabled?: boolean;
  isLeaf?: boolean;
}
export interface DataRow<Raw extends RawRow<Raw>> {
  raw: Raw;
  key: RowKey;
  children?: DataRow<Raw>[];
  expand?: Raw['expand'];
  disabled?: boolean;
  isLeaf?: boolean;
  hasSubtree?: boolean;
}
export interface DataColumn<Raw> {
  dataIndex?: string;
  filterable?: { filter: (values: string[], record: Raw) => boolean };
  sortable?: {
    sorter?:
      | boolean
      | ((a: Raw, b: Raw, extra: { dataIndex: string; direction: Sorter['direction'] }) => number);
  };
}

export function getRecordKey<Raw extends Record<string, unknown>>(
  record: Raw,
  rowKey: string | ((record: Raw) => RowKey),
): RowKey {
  return isFunction(rowKey) ? rowKey(record) : (record[rowKey] as RowKey);
}
export function collectRawKeys<Raw extends RawRow<Raw>>(
  data: Raw[],
  rowKey: string | ((record: Raw) => RowKey),
): RowKey[] {
  const keys: RowKey[] = [];
  const travel = (rows: Raw[]) => {
    if (isArray(rows) && rows.length)
      for (const row of rows) {
        keys.push(getRecordKey(row, rowKey));
        if (row.children) travel(row.children);
      }
  };
  travel(data);
  return keys;
}
export function collectRowKeys<Raw extends RawRow<Raw>>(
  data: DataRow<Raw>[],
  enabledOnly = false,
): RowKey[] {
  const keys: RowKey[] = [];
  const travel = (rows: DataRow<Raw>[]) => {
    for (const row of rows) {
      if (!enabledOnly || !row.disabled) keys.push(row.key);
      if (row.children) travel(row.children);
    }
  };
  travel(data);
  return keys;
}

export function processRows<Raw extends RawRow<Raw>>(
  data: Raw[],
  options: {
    rowKey: string | ((record: Raw) => RowKey);
    loadMore: boolean;
    hideExpandButtonOnEmpty: boolean;
    lazyLoadData: Map<RowKey, Raw[]>;
  },
): DataRow<Raw>[] {
  return data.map((raw) => {
    const row: DataRow<Raw> = {
      raw,
      key: getRecordKey(raw, options.rowKey),
      disabled: raw.disabled,
      expand: raw.expand,
      isLeaf: raw.isLeaf,
    };
    if (raw.children) {
      row.isLeaf = false;
      row.children = processRows(raw.children, options);
    } else if (options.loadMore && !raw.isLeaf) {
      row.isLeaf = false;
      if (options.lazyLoadData.has(row.key))
        row.children = processRows(options.lazyLoadData.get(row.key)!, options);
    } else row.isLeaf = true;
    row.hasSubtree = Boolean(
      row.children
        ? options.hideExpandButtonOnEmpty
          ? row.children.length > 0
          : true
        : options.loadMore && !row.isLeaf,
    );
    return row;
  });
}

export function mapArrayWithChildren<T extends Array<{ children?: T }>>(arr: T): T {
  return arr.map((item) => {
    const next = { ...item };
    if (next.children) next.children = mapArrayWithChildren(next.children);
    return next;
  }) as T;
}
export function mapRawTableData<Raw extends RawRow<Raw>>(rows: DataRow<Raw>[]): Raw[] {
  return rows.map((row) =>
    row.children && row.raw.children
      ? { ...row.raw, children: mapRawTableData(row.children) }
      : row.raw,
  );
}

export function filterRows<Raw extends RawRow<Raw>>(
  rows: DataRow<Raw>[],
  filters: Filters,
  columns: Map<string, DataColumn<Raw>>,
): DataRow<Raw>[] {
  const fields = Object.keys(filters);
  if (!fields.length) return rows;
  const travel = (data: DataRow<Raw>[]): DataRow<Raw>[] =>
    data.filter((row) => {
      for (const field of fields) {
        const column = columns.get(field);
        const values = filters[field];
        if (
          column?.filterable?.filter &&
          values.length &&
          !column.filterable.filter(values, row.raw)
        )
          return false;
      }
      if (row.children) row.children = travel(row.children);
      return true;
    });
  return travel(mapArrayWithChildren(rows));
}

export function sortRows<Raw extends RawRow<Raw>>(
  rows: DataRow<Raw>[],
  sorter: Sorter | undefined,
  columns: Map<string, DataColumn<Raw>>,
): DataRow<Raw>[] {
  const data = mapArrayWithChildren(rows);
  if (data.length && sorter?.field) {
    const column = columns.get(sorter.field);
    if (column && column.sortable?.sorter !== true) {
      const { field, direction } = sorter;
      data.sort((a, b) => {
        const valueA = getValueByPath(a.raw, field);
        const valueB = getValueByPath(b.raw, field);
        if (column.sortable?.sorter && isFunction(column.sortable.sorter)) {
          return column.sortable.sorter(a.raw, b.raw, { dataIndex: field, direction });
        }
        if (valueA === undefined || valueB === undefined) return 0;
        const result = valueA === valueB ? 0 : valueA > valueB ? 1 : -1;
        return direction === 'descend' ? -result : result;
      });
    }
  }
  return data;
}

/** Reorder only siblings; framework adapters resolve DOM hits to these paths. */
export function reorderRows<Raw extends RawRow<Raw>>(
  data: DataRow<Raw>[],
  sourcePath: number[],
  targetPath: number[],
) {
  if (
    data.length &&
    targetPath.length &&
    targetPath.toString() !== sourcePath.toString() &&
    sourcePath.length === targetPath.length &&
    sourcePath.slice(0, -1).toString() === targetPath.slice(0, -1).toString()
  ) {
    let children = data;
    for (let i = 0; i < sourcePath.length; i++) {
      const sourceIndex = sourcePath[i];
      if (i >= sourcePath.length - 1) {
        const sourceChild = children[sourceIndex];
        const targetIndex = targetPath[i];
        if (targetIndex > sourceIndex) {
          children.splice(targetIndex + 1, 0, sourceChild);
          children.splice(sourceIndex, 1);
        } else {
          children.splice(targetIndex, 0, sourceChild);
          children.splice(sourceIndex + 1, 1);
        }
      } else children = children[sourceIndex].children ?? [];
    }
  }
  return data;
}

export function pageRows<Row>(rows: Row[], page: number, size: number, enabled: boolean): Row[] {
  return enabled && rows.length > size ? rows.slice((page - 1) * size, page * size) : rows;
}
export function getSummaryData<Raw extends RawRow<Raw>>(
  columns: { dataIndex?: string }[],
  rows: DataRow<Raw>[],
  text: string,
): Record<string, unknown> {
  return columns.reduce(
    (summary, column, index) => {
      if (column.dataIndex) {
        if (index === 0) setValueByPath(summary, column.dataIndex, text, { addPath: true });
        else {
          let count = 0;
          let nonNumeric = false;
          rows.forEach((row) => {
            if (column.dataIndex) {
              const value = getValueByPath(row.raw, column.dataIndex);
              if (isNumber(value)) count += value;
              else if (!isUndefined(value) && !isNull(value)) nonNumeric = true;
            }
          });
          setValueByPath(summary, column.dataIndex, nonNumeric ? '' : count, { addPath: true });
        }
      }
      return summary;
    },
    {} as Record<string, unknown>,
  );
}
export function wrapRows<Raw extends Record<string, unknown>>(
  data: Raw[] | undefined,
  rowKey: string | ((record: Raw) => RowKey),
) {
  return data && data.length ? data.map((raw) => ({ raw, key: getRecordKey(raw, rowKey) })) : [];
}
