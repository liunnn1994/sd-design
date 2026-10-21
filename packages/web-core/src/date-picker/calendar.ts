import type { Dayjs } from 'dayjs';

import type { Cell } from './types.js';

import { dayjs, methods } from '../_utils/date.js';
import { padStart } from '../_utils/pad.js';
import { newArray } from './utils.js';

export function getDateWeekList(dayStartOfWeek: number) {
  const list = [0, 1, 2, 3, 4, 5, 6];
  const index = Math.max(dayStartOfWeek % 7, 0);
  return [...list.slice(index), ...list.slice(0, index)];
}
export function getDateRows(options: {
  headerValue: Dayjs;
  weekList: number[];
  isWeek: boolean;
  hideNotInViewDates: boolean;
  prefixCls: string;
}): Cell[][] {
  const ROW_COUNT = 6;
  const COL_COUNT = 7;
  const CELL_COUNT = ROW_COUNT * COL_COUNT;
  const getCellData = (time: Dayjs) => ({ label: time.date(), value: time });

  const startDate = methods.startOf(options.headerValue, 'month');
  const startDay = startDate.day();
  const days = startDate.daysInMonth();
  const startIndex = options.weekList.indexOf(startDay);
  const flatData = newArray<Cell>(CELL_COUNT);

  for (let i = 0; i < flatData.length; i++) {
    flatData[i] = {
      ...getCellData(methods.add(startDate, i - startIndex, 'day')),
      isPrev: i < startIndex,
      isNext: i > startIndex + days - 1,
      classNames:
        options.hideNotInViewDates && (i < startIndex || i > startIndex + days - 1)
          ? `${options.prefixCls}-cell-hidden`
          : undefined,
    };
  }

  const rows = newArray(ROW_COUNT).map((_, index) => {
    const row = flatData.slice(index * COL_COUNT, (index + 1) * COL_COUNT);
    if (options.isWeek) {
      // 取第一个作为周 cell 的值
      const valueOfWeek = row[0].value;
      row.unshift({
        label: valueOfWeek.week(),
        value: valueOfWeek,
      });
    }
    return row;
  });

  return rows;
}
export function getMonthRows(
  headerValue: Dayjs,
  abbreviation: boolean,
  translate: (key: string) => string,
): Cell[][] {
  const MONTH_LIST = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const CELL_COUNT = 12;
  const ROW_COUNT = 4;
  const COL_COUNT = 3;

  const year = headerValue.year();
  const isAbbr = abbreviation ? 'short' : 'long';
  const flatData = newArray<Cell>(CELL_COUNT).map((_, index) => ({
    label: translate(`datePicker.month.${isAbbr}.${MONTH_LIST[index]}`),
    value: dayjs(`${year}-${index + 1}`, 'YYYY-M'),
  }));
  const rows = newArray(ROW_COUNT).map((_, index) =>
    flatData.slice(index * COL_COUNT, (index + 1) * COL_COUNT),
  );

  return rows;
}
export function getYearHeaderTitle(headerValue: Dayjs) {
  const MIN_YEAR = 0;
  const SPAN = 10;

  const currentYear = Math.max(headerValue.year(), MIN_YEAR);
  const baseYear = Math.floor(currentYear / SPAN) * SPAN;
  return `${baseYear}-${baseYear + SPAN - 1}`;
}
export function getYearRows(headerValue: Dayjs): Cell[][] {
  const ROW_COUNT = 4;
  const COL_COUNT = 3;
  const CELL_COUNT = ROW_COUNT * COL_COUNT;
  const SPAN = 10;
  const MIN_YEAR = 0;

  const currentYear = Math.max(headerValue.year(), MIN_YEAR);
  const baseYear = Math.floor(currentYear / SPAN) * SPAN;
  const startYear = Math.max(baseYear - 1, MIN_YEAR);

  const flatData = newArray<Cell>(CELL_COUNT).map((_, index) => {
    const year = startYear + index;
    return {
      label: year,
      value: dayjs(`${year}`, 'YYYY'),
      isPrev: year < baseYear,
      isNext: year > baseYear + SPAN - 1,
    };
  });

  const rows = newArray(ROW_COUNT).map((_, index) =>
    flatData.slice(index * COL_COUNT, (index + 1) * COL_COUNT),
  );

  return rows;
}
export function getQuarterRows(headerValue: Dayjs): Cell[][] {
  const year = headerValue.year();
  return [
    [1, 2, 3, 4].map((q) => ({
      label: `Q${q}`,
      value: dayjs(`${year}-${padStart((q - 1) * 3 + 1, 2, '0')}-01`),
    })),
  ];
}
