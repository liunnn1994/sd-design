import { TableColumn } from './column.js';
import { Tbody, Thead, Tr } from './row.js';
import { Table as TableRoot } from './table.js';
import { Td } from './td.js';
import { Th } from './th.js';

export const Table = Object.assign(TableRoot, { Thead, Tbody, Tr, Th, Td, Column: TableColumn });
export { Table as default, TableColumn, Tbody, Thead, Tr, Td, Th };
export type * from './types.js';
export type { TableColumnProps } from './column.js';
export type { TableRowGroupProps, TheadProps, TbodyProps, TrProps } from './row.js';
export type { TdProps } from './td.js';
export type { ThProps, ThInstance } from './th.js';
export type TheadInstance = HTMLElement;
export type TbodyInstance = HTMLElement;
export type TrInstance = HTMLElement;
export type TdInstance = HTMLElement;
