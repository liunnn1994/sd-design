import type { TableColumnData } from '../interface';

import { getGroupColumns, getStyle, getLeafKeys } from '../utils';

// Existing consumers may derive their own helpers from these deep entry types.
export function legacyColumnRenderer(
  columns: ReturnType<typeof getGroupColumns>,
): TableColumnData['render'] {
  return columns.dataColumns[0]?.render;
}
export const legacyColumnStyle: ReturnType<typeof getStyle> = { opacity: 0.5 };
export function legacyLeafRaw(row: Parameters<typeof getLeafKeys>[0]) {
  return row.raw;
}
