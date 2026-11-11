import type { ReactNode } from 'react';

import { isValidElement } from 'react';

import type { TableColumnData } from './types.js';

import { getRenderItems } from '../_shared/children.js';

export interface TableColumnProps extends Omit<TableColumnData, 'children'> {
  children?: ReactNode;
}

export function TableColumn(_props: TableColumnProps) {
  return null;
}

export function getChildColumns(children: ReactNode): TableColumnData[] {
  return getRenderItems(children).flatMap(({ content }) => {
    if (!isValidElement<TableColumnProps>(content) || content.type !== TableColumn) return [];
    const { children: nested, ...column } = content.props;
    const columns = getChildColumns(nested);
    return [{ ...column, ...(columns.length ? { children: columns } : {}) }];
  });
}
