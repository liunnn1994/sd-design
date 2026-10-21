import type { Dayjs } from 'dayjs';

import type { Cell, DisabledDate, IsSameTime, Mode } from './types.js';

import { isDisabledDate } from './utils.js';

export interface DatePanelBodyState {
  readonly value: Dayjs | undefined;
  readonly disabledDate: DisabledDate | undefined;
  readonly mode: Mode | undefined;
  readonly hideNotInViewDates: boolean;
}
export interface DatePanelSameTimeCell {
  readonly value: IsSameTime;
}
export function createDatePanelBodyFoundation<TClass>(
  state: DatePanelBodyState,
  sameTime: DatePanelSameTimeCell | undefined,
  getCellClassName: (cell: Cell, disabled: boolean) => TClass,
  onClick: (cell: Cell) => void,
  onHover: (cell: Cell) => void,
) {
  const isCellDisabled = (cellData: Cell) =>
    isDisabledDate(cellData.value, state.disabledDate, state.mode);

  const isCellSelected = (cellData: Cell) =>
    Boolean(state.value && sameTime?.value && sameTime.value(cellData.value, state.value));

  const getIsWeek = () => state.mode === 'week';

  const isHiddenNotInViewCell = (cellData: Cell) =>
    state.hideNotInViewDates && (cellData.isPrev || cellData.isNext);

  const getCellClassNameFn = (cellData: Cell) => {
    const disabled = isCellDisabled(cellData);
    return getCellClassName(cellData, disabled);
  };
  const onCellClick = (cellData: Cell) => {
    const disabled = isCellDisabled(cellData) || isHiddenNotInViewCell(cellData);
    if (disabled) return;
    onClick(cellData);
  };
  const onCellMouseEnter = (cellData: Cell) => {
    const disabled = isCellDisabled(cellData) || isHiddenNotInViewCell(cellData);
    if (disabled) return;
    onHover(cellData);
  };
  const onCellMouseLeave = (cellData: Cell) => {
    const disabled = isCellDisabled(cellData) || isHiddenNotInViewCell(cellData);
    if (disabled) return;
    onHover(cellData);
  };
  return {
    isCellDisabled,
    isCellSelected,
    getIsWeek,
    isHiddenNotInViewCell,
    getCellClassNameFn,
    onCellClick,
    onCellMouseEnter,
    onCellMouseLeave,
  };
}
