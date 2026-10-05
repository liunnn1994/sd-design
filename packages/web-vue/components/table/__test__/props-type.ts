import type { TableProps } from '../index';

export const defaultTableProps: TableProps = {};
export const scrollTableProps: TableProps = {
  columns: [],
  data: [],
  scroll: { x: 400, y: 200 },
  stickyHeader: 0,
};
export const keyedTableProps: TableProps = {
  columns: [],
  data: [],
  rowKey: (record) => String(record.id),
  selectedKeys: ['a'],
  expandedKeys: ['a'],
};
