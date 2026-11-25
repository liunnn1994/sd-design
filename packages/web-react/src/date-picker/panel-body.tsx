import type { Cell, DisabledDate, IsSameTime, Mode } from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

import { createDateCellRangeFoundation } from '@sdata/web-core/date-picker/cell-range';
import { getDateCellClassName } from '@sdata/web-core/date-picker/cells';
import { createDatePanelBodyFoundation } from '@sdata/web-core/date-picker/panel-body';

export interface DatePanelBodyProps {
  prefixCls: string;
  rows?: Cell[][];
  value?: Dayjs | undefined;
  disabledDate?: DisabledDate | undefined;
  isSameTime: IsSameTime;
  mode?: Mode;
  hideNotInViewDates?: boolean;
  rangeValues?: Array<Dayjs | undefined> | undefined;
  now?: Dayjs;
  renderCell?: ((date: Date) => ReactNode) | undefined;
  onCellClick?(cell: Cell): void;
  onCellMouseEnter?(cell: Cell): void;
}

export function DatePanelBody(props: DatePanelBodyProps) {
  const { prefixCls: prefix, rows = [], mode, renderCell } = props;
  const rangeFoundation = createDateCellRangeFoundation({
    rangeValues: props.rangeValues,
    get sortedRangeValues() {
      return rangeFoundation.getSortedRangeValues();
    },
  });
  const range = { start: rangeFoundation.getRangeStart(), end: rangeFoundation.getRangeEnd() };
  const foundation = createDatePanelBodyFoundation(
    {
      value: props.value,
      disabledDate: props.disabledDate,
      mode,
      hideNotInViewDates: !!props.hideNotInViewDates,
    },
    { value: props.isSameTime },
    (cell, disabled) =>
      getDateCellClassName(props, cell, disabled, range)
        .flatMap((item) =>
          typeof item === 'string'
            ? [item]
            : Object.entries(item ?? {})
                .filter(([, active]) => active)
                .map(([name]) => name),
        )
        .join(' '),
    (cell) => props.onCellClick?.(cell),
    (cell) => props.onCellMouseEnter?.(cell),
  );
  return (
    <div className={`${prefix}-body`} role="grid">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          role="row"
          className={[`${prefix}-row`, mode === 'week' && `${prefix}-row-week`]
            .filter(Boolean)
            .join(' ')}
        >
          {row.map((cell, colIndex) =>
            mode === 'week' && colIndex === 0 ? (
              <div key={colIndex} className={`${prefix}-cell ${prefix}-cell-week`}>
                <div className={`${prefix}-date`}>
                  <div className={`${prefix}-date-value`}>{cell.label}</div>
                </div>
              </div>
            ) : (
              <div
                key={colIndex}
                className={foundation.getCellClassNameFn(cell)}
                role="gridcell"
                aria-label={cell.value.format('YYYY-MM-DD')}
                aria-selected={foundation.isCellSelected(cell) || undefined}
                aria-disabled={
                  foundation.isCellDisabled(cell) ||
                  foundation.isHiddenNotInViewCell(cell) ||
                  undefined
                }
                onMouseEnter={() => foundation.onCellMouseEnter(cell)}
                onMouseLeave={() => foundation.onCellMouseLeave(cell)}
                onClick={() => foundation.onCellClick(cell)}
              >
                {!foundation.isHiddenNotInViewCell(cell) && renderCell ? (
                  renderCell(cell.value.toDate())
                ) : (
                  <div className={`${prefix}-date`}>
                    <div className={`${prefix}-date-value`}>
                      {!foundation.isHiddenNotInViewCell(cell) && cell.label}
                    </div>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}
