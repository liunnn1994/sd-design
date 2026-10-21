import type { DataRow, RawRow } from './data.js';

export function computeTableSpans<Raw extends RawRow<Raw>, Column>(
  data: DataRow<Raw>[],
  columns: Column[],
  spanMethod:
    | ((data: {
        record: Raw;
        column: Column;
        rowIndex: number;
        columnIndex: number;
      }) => { rowspan?: number; colspan?: number } | void)
    | undefined,
) {
  const tableSpan: Record<string, [number, number]> = {};
  const zeroSpan: Record<string, [number, number]> = {};
  const flatten = (rows: DataRow<Raw>[]) => {
    rows?.forEach((record, rowIndex) => {
      if (record.hasSubtree && record.children?.length) flatten(record.children);
      columns.forEach((column, columnIndex) => {
        const { rowspan = 1, colspan = 1 } =
          spanMethod?.({ record: record.raw, column, rowIndex, columnIndex }) ?? {};
        if (rowspan > 1 || colspan > 1) {
          tableSpan[`${rowIndex}-${columnIndex}-${record.key}`] = [rowspan, colspan];
          Array.from({ length: rowspan }).forEach((_, r) => {
            if (rowIndex + r < rows.length) {
              const { key } = rows[rowIndex + r] ?? {};
              Array.from({ length: colspan }).forEach((_, c) => {
                if (
                  columnIndex + c < columns.length &&
                  `${rowIndex}-${columnIndex}-${record.key}` !==
                    `${rowIndex + r}-${columnIndex + c}-${key}`
                ) {
                  zeroSpan[`${rowIndex + r}-${columnIndex + c}-${key}`] = [0, 0];
                }
              });
            }
          });
        }
      });
    });
  };
  if (spanMethod) flatten(data);
  return { tableSpan, removedCells: Object.keys(zeroSpan) };
}
