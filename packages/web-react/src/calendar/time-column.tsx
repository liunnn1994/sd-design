import type { CalendarSurfaceHost } from '@sdata/web-core/calendar/surfaces';
import type { ReactNode } from 'react';

import { createCalendarSurfaceRules } from '@sdata/web-core/calendar/surfaces';
import { minutesToPercentage } from '@sdata/web-core/calendar/utils/conversions';

export interface CalendarTimeCellRenderParams {
  index: number;
  minutes: number;
  hours: number;
  minutesSum: number;
  format12: string;
  format24: string;
}

export interface CalendarTimeColumnProps {
  calendar: CalendarSurfaceHost & { config: { currentTimeLabel: boolean } };
  now: Date;
  allDayLabel?: ReactNode;
  renderTimeCell?: (params: CalendarTimeCellRenderParams) => ReactNode;
  renderCurrentTimeLabel?: (params: { now: Date; timeFormatted: string }) => ReactNode;
}

export function CalendarTimeColumn({
  calendar,
  now,
  allDayLabel,
  renderTimeCell,
  renderCurrentTimeLabel,
}: CalendarTimeColumnProps) {
  const { prefixCls: prefix, config, dateUtils, texts } = calendar;
  const rules = createCalendarSurfaceRules(calendar, { isDark: false, hasTimeColumn: true });
  const timeFormatted = dateUtils.formatTime(now, config.twelveHour ? 'h:mm {am}' : 'HH:mm');
  const position = minutesToPercentage(dateUtils.dateToMinutes(now), config);
  return (
    <div className={`${prefix}__time-column`}>
      <div className={`${prefix}__time-column-inner`}>
        {config.allDayEvents && (
          <div className={`${prefix}__all-day-label`}>
            {allDayLabel === undefined ? texts.allDay : allDayLabel}
          </div>
        )}
        {rules.timeCells().map((time, index) => (
          <div
            key={index}
            style={{ height: time.height ?? undefined }}
            className={`${prefix}__time-cell`}
          >
            {renderTimeCell ? (
              renderTimeCell({
                index,
                minutes: time.minutes,
                hours: time.hours,
                minutesSum: time.minutesSum,
                format12: time.formatted12,
                format24: time.formatted24,
              })
            ) : (
              <label>{config.twelveHour ? time.formatted12 : time.formatted24}</label>
            )}
          </div>
        ))}
        {config.currentTimeLabel && (
          <div
            className={`${prefix}__current-time`}
            title={timeFormatted}
            style={{ [config.horizontal ? 'left' : 'top']: `${position}%` }}
          >
            {renderCurrentTimeLabel ? (
              renderCurrentTimeLabel({ now, timeFormatted })
            ) : (
              <span>{timeFormatted}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
