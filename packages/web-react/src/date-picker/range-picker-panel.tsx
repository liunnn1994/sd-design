import type {
  HeaderOperations,
  Mode,
  RangeDisabledDate,
  RangeDisabledTime,
  WeekStart,
} from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { getRangeDateShortcutValue } from '@sdata/web-core/date-picker/values';
import { useLayoutEffect, useRef, useState } from 'react';

import type { TimePickerProps } from '../time-picker/types.js';
import type { DatePanelHeaderProps } from './panel-header.js';

import { DateCalendarPanel } from './calendar-panel.js';
import { DatePanelFooter } from './panel-footer.js';
import { DatePanelShortcuts, type DatePickerShortcut } from './panel-shortcuts.js';
import { DatePeriodPanel } from './period-panel.js';

export interface DateRangePanelHeader {
  headerValue: Dayjs;
  headerOperations?: HeaderOperations;
  headerIcons?: DatePanelHeaderProps['icons'];
}
export interface DateRangePickerPanelProps {
  rootProps?: ComponentPropsWithoutRef<'div'> | undefined;
  prefixCls: string;
  mode?: Mode;
  value?: Array<Dayjs | undefined>;
  footerValue?: Array<Dayjs | undefined>;
  timePickerValue?: Dayjs[];
  showTime?: boolean | undefined;
  showConfirmBtn?: boolean;
  confirmBtnDisabled?: boolean;
  shortcuts?: DatePickerShortcut[] | undefined;
  shortcutsPosition?: 'left' | 'bottom' | 'right';
  format: string;
  dayStartOfWeek?: WeekStart;
  disabledDate?: RangeDisabledDate | undefined;
  disabledTime?: RangeDisabledTime | undefined;
  timePickerProps?: Partial<TimePickerProps>;
  hideTrigger?: boolean | undefined;
  startHeaderProps: DateRangePanelHeader;
  endHeaderProps: DateRangePanelHeader;
  disabled?: boolean[];
  visible?: boolean;
  startHeaderMode?: 'year' | 'month' | undefined;
  endHeaderMode?: 'year' | 'month' | undefined;
  abbreviation?: boolean;
  hideNotInViewDates?: boolean | undefined;
  utcOffset?: number | undefined;
  timezone?: string | undefined;
  now?: Dayjs;
  extra?: ReactNode;
  renderCell?: ((date: Date, type: 'start' | 'end') => ReactNode) | undefined;
  onCellClick?(date: Dayjs): void;
  onCellMouseEnter?(date: Dayjs): void;
  onTimePickerSelect?(time: Dayjs, type: 'start' | 'end'): void;
  onShortcutClick?(value: Dayjs[], shortcut: DatePickerShortcut): void;
  onShortcutMouseEnter?: ((value: Dayjs[]) => void) | undefined;
  onShortcutMouseLeave?: ((value: Dayjs[]) => void) | undefined;
  onConfirm?(): void;
  onStartHeaderLabelClick?(type: 'year' | 'month'): void;
  onEndHeaderLabelClick?(type: 'year' | 'month'): void;
  onStartHeaderSelect?(date: Dayjs): void;
  onEndHeaderSelect?(date: Dayjs): void;
}

export function DateRangePickerPanel(props: DateRangePickerPanelProps) {
  const {
    prefixCls: prefix,
    mode = 'date',
    value = [],
    disabled = [false, false],
    shortcuts = [],
    shortcutsPosition = 'bottom',
    startHeaderMode,
    endHeaderMode,
  } = props;
  const [view, setView] = useState<'date' | 'time'>('date');
  const previousVisible = useRef(props.visible);
  useLayoutEffect(() => {
    if (props.visible && !previousVisible.current) setView('date');
    previousVisible.current = props.visible;
  }, [props.visible]);
  const hasShortcuts = shortcuts.length > 0;
  const shortcutValue = (item: DatePickerShortcut) =>
    getRangeDateShortcutValue(item, props.format, props.utcOffset, props.timezone);
  const shortcutPanel = hasShortcuts ? (
    <DatePanelShortcuts
      prefixCls={prefix}
      shortcuts={shortcuts}
      onItemClick={(item) => props.onShortcutClick?.(shortcutValue(item), item)}
      onItemMouseEnter={(item) => props.onShortcutMouseEnter?.(shortcutValue(item))}
      onItemMouseLeave={(item) => props.onShortcutMouseLeave?.(shortcutValue(item))}
    />
  ) : null;
  const panel = (index: 0 | 1, headerMode?: 'year' | 'month') => {
    const type = index === 0 ? 'start' : 'end';
    const common = {
      ...(index === 0 ? props.startHeaderProps : props.endHeaderProps),
      rangeValues: value,
      disabledDate: props.disabledDate
        ? (date: Date) => props.disabledDate!(date, type)
        : undefined,
      onSelect: headerMode
        ? index === 0
          ? props.onStartHeaderSelect
          : props.onEndHeaderSelect
        : props.onCellClick,
      onCellMouseEnter: props.onCellMouseEnter,
      onHeaderLabelClick: index === 0 ? props.onStartHeaderLabelClick : props.onEndHeaderLabelClick,
      renderCell:
        !headerMode && props.renderCell ? (date: Date) => props.renderCell!(date, type) : undefined,
    };
    const panelMode = headerMode ?? mode;
    if (panelMode === 'year' || panelMode === 'month' || panelMode === 'quarter') {
      return <DatePeriodPanel {...common} mode={panelMode} abbreviation={props.abbreviation} />;
    }
    return (
      <DateCalendarPanel
        {...common}
        mode={panelMode}
        isRange={panelMode === 'date'}
        value={panelMode === 'date' ? value[index] : undefined}
        footerValue={props.footerValue?.[index]}
        timePickerValue={props.timePickerValue?.[index]}
        dayStartOfWeek={props.dayStartOfWeek}
        hideNotInViewDates={panelMode === 'date' && props.hideNotInViewDates}
        showTime={panelMode === 'date' && props.showTime}
        timePickerProps={props.timePickerProps}
        disabledTime={props.disabledTime ? (date) => props.disabledTime!(date, type) : undefined}
        disabled={disabled[index]}
        now={props.now}
        currentView={view}
        onUpdateCurrentView={setView}
        onTimePickerSelect={(time) => props.onTimePickerSelect?.(time, type)}
      />
    );
  };
  return (
    <div
      {...props.rootProps}
      className={[
        `${prefix}-range-container`,
        props.rootProps?.className,
        props.hideTrigger && `${prefix}-range-container-panel-only`,
        hasShortcuts &&
          shortcutsPosition !== 'bottom' &&
          `${prefix}-range-container-shortcuts-placement-${shortcutsPosition}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {shortcutsPosition === 'left' && shortcutPanel}
      <div className={`${prefix}-range-panel-wrapper`}>
        <div className={`${prefix}-range`}>
          <div className={`${prefix}-range-wrapper`}>
            {startHeaderMode || endHeaderMode ? (
              <>
                {startHeaderMode === 'year' && panel(0, 'year')}
                {endHeaderMode === 'year'
                  ? panel(1, 'year')
                  : startHeaderMode === 'month'
                    ? panel(0, 'month')
                    : endHeaderMode === 'month'
                      ? panel(1, 'month')
                      : null}
              </>
            ) : (
              <>
                {panel(0)}
                {panel(1)}
              </>
            )}
          </div>
        </div>
        <DatePanelFooter
          prefixCls={prefix}
          showConfirmBtn={props.showConfirmBtn}
          confirmBtnDisabled={props.confirmBtnDisabled}
          extra={props.extra}
          buttons={shortcutsPosition === 'bottom' ? shortcutPanel : undefined}
          onConfirmClick={props.onConfirm}
        />
      </div>
      {shortcutsPosition === 'right' && shortcutPanel}
    </div>
  );
}
