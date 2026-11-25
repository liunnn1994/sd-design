import type { Mode } from '@sdata/web-core/date-picker/types';
import type { Dayjs } from 'dayjs';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { getNow } from '@sdata/web-core/_utils/date';
import { getDateShortcutValue } from '@sdata/web-core/date-picker/values';

import { DateCalendarPanel, type DateCalendarPanelProps } from './calendar-panel.js';
import { DatePanelFooter } from './panel-footer.js';
import { DatePanelShortcuts, type DatePickerShortcut } from './panel-shortcuts.js';
import { DatePeriodPanel } from './period-panel.js';
import { useDateHeader } from './use-date-header.js';

export interface DatePickerPanelProps extends Omit<DateCalendarPanelProps, 'mode' | 'onSelect'> {
  rootProps?: ComponentPropsWithoutRef<'div'> | undefined;
  prefixCls: string;
  mode?: Mode;
  headerMode?: 'year' | 'month' | undefined;
  format: string;
  utcOffset?: number | undefined;
  timezone?: string | undefined;
  hideTrigger?: boolean | undefined;
  abbreviation?: boolean;
  showConfirmBtn?: boolean;
  confirmBtnDisabled?: boolean;
  showNowBtn?: boolean;
  shortcuts?: DatePickerShortcut[] | undefined;
  shortcutsPosition?: 'left' | 'bottom' | 'right';
  extra?: ReactNode;
  onCellClick?(date: Dayjs): void;
  onShortcutClick?(date: Dayjs, shortcut: DatePickerShortcut): void;
  onShortcutMouseEnter?: ((date: Dayjs) => void) | undefined;
  onShortcutMouseLeave?: ((date: Dayjs) => void) | undefined;
  onConfirm?(): void;
  onTodayClick?(date: Dayjs): void;
  onHeaderSelect?(date: Dayjs): void;
  onMonthHeaderClick?(): void;
}

export function DatePickerPanel(props: DatePickerPanelProps) {
  const {
    prefixCls: prefix,
    mode = 'date',
    headerMode,
    format,
    utcOffset,
    timezone,
    shortcuts = [],
    shortcutsPosition = 'bottom',
    showNowBtn,
    showConfirmBtn,
  } = props;
  const header = useDateHeader({ mode: headerMode, format, selectedValue: props.headerValue });
  const now = props.now ?? getNow(utcOffset, timezone);
  const showShortcutNow = !!(showNowBtn && showConfirmBtn && !shortcuts.length);
  const showShortcuts = showShortcutNow || shortcuts.length > 0;
  const bottomShortcuts = showShortcuts && shortcutsPosition === 'bottom';
  const shortcutValue = (item: DatePickerShortcut) =>
    getDateShortcutValue(item, format, utcOffset, timezone);
  const shortcutPanel = showShortcuts ? (
    <DatePanelShortcuts
      prefixCls={prefix}
      shortcuts={shortcuts}
      showNowBtn={showShortcutNow}
      onItemClick={(item) => props.onShortcutClick?.(shortcutValue(item), item)}
      onItemMouseEnter={(item) => props.onShortcutMouseEnter?.(shortcutValue(item))}
      onItemMouseLeave={(item) => props.onShortcutMouseLeave?.(shortcutValue(item))}
      onNowClick={() => props.onTodayClick?.(now)}
    />
  ) : null;
  const common = {
    value: props.value,
    headerValue: props.headerValue,
    headerOperations: props.headerOperations,
    headerIcons: props.headerIcons,
    disabledDate: props.disabledDate,
    onSelect: props.onCellClick,
    onHeaderLabelClick: props.onHeaderLabelClick,
    renderCell: props.renderCell,
  };
  return (
    <div
      {...props.rootProps}
      className={[
        `${prefix}-container`,
        props.hideTrigger && `${prefix}-container-panel-only`,
        props.rootProps?.className,
        showShortcuts &&
          shortcutsPosition !== 'bottom' &&
          `${prefix}-container-shortcuts-placement-${shortcutsPosition}`,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {shortcutsPosition === 'left' && shortcutPanel}
      <div className={`${prefix}-panel-wrapper`}>
        {headerMode ? (
          <DatePeriodPanel
            mode={headerMode}
            headerValue={header.value}
            headerOperations={header.operations}
            headerIcons={props.headerIcons}
            disabledDate={props.disabledDate}
            abbreviation={props.abbreviation}
            onSelect={props.onHeaderSelect}
            onHeaderLabelClick={headerMode === 'month' ? props.onMonthHeaderClick : undefined}
          />
        ) : (
          <>
            {mode === 'year' || mode === 'month' || mode === 'quarter' ? (
              <DatePeriodPanel {...common} mode={mode} abbreviation={props.abbreviation} />
            ) : (
              <DateCalendarPanel
                {...common}
                mode={mode}
                dayStartOfWeek={props.dayStartOfWeek}
                showTime={mode === 'date' && props.showTime}
                hideNotInViewDates={mode === 'date' && props.hideNotInViewDates}
                timePickerProps={props.timePickerProps}
                footerValue={props.value ?? getNow(utcOffset, timezone)}
                timePickerValue={props.timePickerValue}
                disabledTime={props.disabledTime}
                disabled={props.disabled}
                now={now}
                onTimePickerSelect={props.onTimePickerSelect}
              />
            )}
            <DatePanelFooter
              prefixCls={prefix}
              showTodayBtn={showNowBtn && !(showConfirmBtn || bottomShortcuts)}
              showConfirmBtn={showConfirmBtn}
              confirmBtnDisabled={props.confirmBtnDisabled}
              extra={props.extra}
              buttons={bottomShortcuts ? shortcutPanel : undefined}
              onTodayClick={() => props.onTodayClick?.(now)}
              onConfirmClick={props.onConfirm}
            />
          </>
        )}
      </div>
      {shortcutsPosition === 'right' && shortcutPanel}
    </div>
  );
}
