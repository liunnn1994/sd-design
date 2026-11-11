import type {
  DisabledDate,
  DisabledTime,
  HeaderOperations,
  IsSameTime,
  WeekStart,
} from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

import { getNow, methods } from '@sdata/web-core/_utils/date';
import { getDateRows, getDateWeekList } from '@sdata/web-core/date-picker/calendar';
import { useState } from 'react';

import type { TimePickerProps } from '../time-picker/types.js';

import { usePrefix } from '../config-provider/index.js';
import { IconCalendar } from '../icon/icon-calendar.js';
import { IconClockCircle } from '../icon/icon-clock-circle.js';
import { TimePanel } from '../time-picker/panel.js';
import { useDatePickerTranslate } from './context.js';
import { DatePanelBody } from './panel-body.js';
import { DatePanelHeader, type DatePanelHeaderProps } from './panel-header.js';

export interface DateCalendarPanelProps {
  mode?: 'date' | 'week';
  isRange?: boolean;
  value?: Dayjs;
  rangeValues?: Array<Dayjs | undefined>;
  headerValue: Dayjs;
  footerValue?: Dayjs;
  timePickerValue?: Dayjs;
  headerOperations?: HeaderOperations;
  headerIcons?: DatePanelHeaderProps['icons'];
  dayStartOfWeek?: WeekStart;
  disabledDate?: DisabledDate;
  disabledTime?: DisabledTime;
  isSameTime?: IsSameTime;
  showTime?: boolean;
  timePickerProps?: Partial<TimePickerProps>;
  currentView?: 'date' | 'time';
  disabled?: boolean;
  hideNotInViewDates?: boolean;
  now?: Dayjs;
  onHeaderLabelClick?: DatePanelHeaderProps['onLabelClick'];
  renderCell?(date: Date): ReactNode;
  onSelect?(value: Dayjs): void;
  onTimePickerSelect?(value: Dayjs): void;
  onCellMouseEnter?(value: Dayjs): void;
  onCurrentViewChange?(view: 'date' | 'time'): void;
  onUpdateCurrentView?(view: 'date' | 'time'): void;
}

export function DateCalendarPanel(props: DateCalendarPanelProps) {
  const {
    mode = 'date',
    isRange,
    value,
    rangeValues,
    headerValue,
    footerValue,
    timePickerValue,
    headerOperations,
    headerIcons,
    dayStartOfWeek = 0,
    disabledDate,
    disabledTime,
    isSameTime,
    showTime,
    timePickerProps,
    currentView,
    disabled,
    hideNotInViewDates = false,
    now,
    onHeaderLabelClick,
    renderCell,
    onSelect,
    onTimePickerSelect,
    onCellMouseEnter,
    onCurrentViewChange,
    onUpdateCurrentView,
  } = props;
  const isWeek = mode === 'week';
  const prefix = usePrefix(isWeek ? 'panel-week' : 'panel-date');
  const pickerPrefix = usePrefix('picker');
  const t = useDatePickerTranslate();
  const [localView, setLocalView] = useState<'date' | 'time'>('date');
  const view = currentView ?? localView;
  const showTabs = !!(showTime && isRange);
  const showDate = !showTime || !showTabs || view === 'date';
  const showClock = !!(showTime && (!showTabs || view === 'time'));
  const panelNow = now ?? getNow();
  const weekList = getDateWeekList(dayStartOfWeek);
  const headings = isWeek ? [-1, ...weekList] : weekList;
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const rows = getDateRows({
    headerValue,
    weekList,
    isWeek,
    hideNotInViewDates,
    prefixCls: pickerPrefix,
  });
  const disabledClock = showTime ? disabledTime?.((footerValue ?? panelNow).toDate()) : undefined;
  const selectDate = (date: Dayjs) => (isWeek ? methods.startOfWeek(date, dayStartOfWeek) : date);
  const same =
    isSameTime ??
    ((a: Dayjs, b: Dayjs) =>
      isWeek ? methods.isSameWeek(a, b, dayStartOfWeek) : a.isSame(b, 'day'));
  const changeView = (next: 'date' | 'time') => {
    onCurrentViewChange?.(next);
    onUpdateCurrentView?.(next);
    setLocalView(next);
  };
  return (
    <div className={[prefix, showTabs && `${prefix}-with-view-tabs`].filter(Boolean).join(' ')}>
      {showDate && (
        <div className={`${prefix}-inner`}>
          <DatePanelHeader
            {...headerOperations}
            icons={headerIcons}
            prefixCls={pickerPrefix}
            title={headerValue.format('YYYY-MM')}
            mode={mode}
            value={headerValue}
            onLabelClick={onHeaderLabelClick}
          />
          <div className={`${pickerPrefix}-week-list`}>
            {headings.map((day) => (
              <div key={day} className={`${pickerPrefix}-week-list-item`}>
                {day < 0 ? '' : t(`datePicker.week.short.${dayNames[day]}`)}
              </div>
            ))}
          </div>
          <DatePanelBody
            mode={mode}
            prefixCls={pickerPrefix}
            rows={rows}
            value={isRange ? undefined : value}
            rangeValues={rangeValues}
            hideNotInViewDates={hideNotInViewDates}
            disabledDate={disabledDate}
            isSameTime={same}
            now={panelNow}
            renderCell={renderCell}
            onCellClick={(cell) => onSelect?.(selectDate(cell.value))}
            onCellMouseEnter={(cell) => onCellMouseEnter?.(selectDate(cell.value))}
          />
        </div>
      )}
      {showClock && (
        <div className={`${prefix}-timepicker`}>
          <header className={`${prefix}-timepicker-title`}>{t('datePicker.selectTime')}</header>
          <TimePanel
            format={timePickerProps?.format}
            use12Hours={timePickerProps?.use12Hours}
            step={timePickerProps?.step}
            hideDisabledOptions={timePickerProps?.hideDisabledOptions}
            disabledHours={timePickerProps?.disabledHours}
            disabledMinutes={timePickerProps?.disabledMinutes}
            disabledSeconds={timePickerProps?.disabledSeconds}
            {...disabledClock}
            hideFooter
            visible
            value={value || isRange ? timePickerValue : undefined}
            disabled={disabled}
            onSelect={(next) => onTimePickerSelect?.(next)}
            onConfirm={() => {}}
          />
        </div>
      )}
      {showTabs && (
        <div className={`${prefix}-footer`}>
          <div className={`${prefix}-view-tabs`}>
            <div
              className={[`${prefix}-view-tab-pane`, showDate && `${prefix}-view-tab-pane-active`]
                .filter(Boolean)
                .join(' ')}
              onClick={() => changeView('date')}
            >
              <IconCalendar />
              <span className={`${prefix}-view-tab-pane-text`}>
                {footerValue?.format('YYYY-MM-DD')}
              </span>
            </div>
            <div
              className={[`${prefix}-view-tab-pane`, showClock && `${prefix}-view-tab-pane-active`]
                .filter(Boolean)
                .join(' ')}
              onClick={() => changeView('time')}
            >
              <IconClockCircle />
              <span className={`${prefix}-view-tab-pane-text`}>
                {timePickerValue?.format('HH:mm:ss')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
