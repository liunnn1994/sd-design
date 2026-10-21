import type { Dayjs } from 'dayjs';

import type { Cell, IsSameTime, Mode } from './types.js';

import { getNow } from '../_utils/date.js';

export interface CellClassNameProps {
  prefixCls: string;
  value?: Dayjs;
  rangeValues?: Array<Dayjs | undefined>;
  isSameTime: IsSameTime;
  mode?: Mode;
  now?: Dayjs;
}

export function getDateCellClassName(
  props: CellClassNameProps,
  cellData: Cell,
  disabled: boolean,
  range: { readonly start?: Dayjs; readonly end?: Dayjs },
) {
  const { value, isSameTime, mode, prefixCls } = props;

  const isInView = !cellData.isPrev && !cellData.isNext;

  const isSelected = value && isSameTime(cellData.value, value);

  const currentNow = props.now || getNow();
  let isToday = isSameTime(cellData.value, currentNow);
  if (mode === 'week') {
    isToday = currentNow.isSame(cellData.value, 'date');
  }

  const isRangeStart = isInView && range.start && isSameTime(cellData.value, range.start);

  const isRangeEnd = isInView && range.end && isSameTime(cellData.value, range.end);

  const isInRange =
    isInView &&
    range.start &&
    range.end &&
    (isRangeStart || isRangeEnd || cellData.value.isBetween(range.start, range.end, null, '[]'));

  return [
    `${prefixCls}-cell`,
    {
      [`${prefixCls}-cell-in-view`]: isInView,
      [`${prefixCls}-cell-today`]: isToday,
      [`${prefixCls}-cell-selected`]: isSelected,
      [`${prefixCls}-cell-range-start`]: isRangeStart,
      [`${prefixCls}-cell-range-end`]: isRangeEnd,
      [`${prefixCls}-cell-in-range`]: isInRange,
      [`${prefixCls}-cell-disabled`]: disabled,
    },
    cellData.classNames,
  ];
}
