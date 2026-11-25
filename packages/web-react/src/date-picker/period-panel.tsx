import type { DisabledDate, HeaderOperations } from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

import {
  getMonthRows,
  getQuarterRows,
  getYearRows,
  getYearHeaderTitle,
} from '@sdata/web-core/date-picker/calendar';

import { usePrefix } from '../config-provider/index.js';
import { useDatePickerTranslate } from './context.js';
import { DatePanelBody } from './panel-body.js';
import { DatePanelHeader, type DatePanelHeaderProps } from './panel-header.js';

export interface DatePeriodPanelProps {
  mode: 'month' | 'quarter' | 'year';
  headerValue: Dayjs;
  headerOperations?: HeaderOperations | undefined;
  headerIcons?: DatePanelHeaderProps['icons'];
  value?: Dayjs | undefined;
  disabledDate?: DisabledDate | undefined;
  rangeValues?: Array<Dayjs | undefined>;
  abbreviation?: boolean | undefined;
  onHeaderLabelClick?: DatePanelHeaderProps['onLabelClick'];
  renderCell?: ((date: Date) => ReactNode) | undefined;
  onSelect?: ((value: Dayjs) => void) | undefined;
  onCellMouseEnter?: ((value: Dayjs) => void) | undefined;
}

export function DatePeriodPanel({
  mode,
  headerValue,
  headerOperations,
  headerIcons,
  value,
  disabledDate,
  rangeValues,
  abbreviation = true,
  onHeaderLabelClick,
  renderCell,
  onSelect,
  onCellMouseEnter,
}: DatePeriodPanelProps) {
  const prefix = usePrefix(`panel-${mode}`);
  const pickerPrefix = usePrefix('picker');
  const t = useDatePickerTranslate();
  const rows =
    mode === 'month'
      ? getMonthRows(headerValue, abbreviation, t)
      : mode === 'quarter'
        ? getQuarterRows(headerValue)
        : getYearRows(headerValue);
  const title = mode === 'year' ? getYearHeaderTitle(headerValue) : headerValue.format('YYYY');
  return (
    <div className={prefix}>
      <div className={`${prefix}-inner`}>
        <DatePanelHeader
          {...headerOperations}
          icons={headerIcons}
          prefixCls={pickerPrefix}
          title={title}
          mode={mode}
          value={headerValue}
          onLabelClick={mode === 'year' ? undefined : onHeaderLabelClick}
        />
        <DatePanelBody
          prefixCls={pickerPrefix}
          mode={mode}
          rows={rows}
          value={value}
          rangeValues={rangeValues}
          disabledDate={disabledDate}
          isSameTime={(a, b) =>
            mode === 'quarter'
              ? a.isSame(b, 'year') && Math.floor(a.month() / 3) === Math.floor(b.month() / 3)
              : a.isSame(b, mode)
          }
          renderCell={renderCell}
          onCellClick={(cell) => onSelect?.(cell.value)}
          onCellMouseEnter={(cell) => onCellMouseEnter?.(cell.value)}
        />
      </div>
    </div>
  );
}
