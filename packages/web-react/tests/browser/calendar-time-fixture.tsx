import type { CSSProperties } from 'react';

import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useState } from 'react';

import { resolveCalendarConfig } from '../../src/calendar/config.js';
import { CalendarTimeColumn } from '../../src/calendar/time-column.js';
import { useCalendarTexts } from '../../src/calendar/use-texts.js';
import { useCalendarView } from '../../src/calendar/use-view.js';

export function CalendarTimeFixture() {
  const [twelveHour, setTwelveHour] = useState(false);
  const [horizontal, setHorizontal] = useState(false);
  const [custom, setCustom] = useState(false);
  const [labels, setLabels] = useState(true);
  const [late, setLate] = useState(false);
  const [chinese, setChinese] = useState(false);
  const texts = useCalendarTexts({ locale: chinese ? 'zh-cn' : 'en' });
  const dateUtils = createDateUtils(() => texts.dateLocale);
  const config = Object.assign(
    resolveCalendarConfig(
      {
        view: 'week',
        viewDate: '2026-11-08',
        twelveHour,
        horizontal,
        timeFrom: 600,
        timeTo: 750,
        timeStep: 60,
        timeCellHeight: 50,
        allDayEvents: labels,
        currentTimeLabel: labels,
      },
      {
        dateUtils,
        view: {
          id: 'week',
          isDay: false,
          isDays: false,
          isWeek: true,
          isMonth: false,
          isYear: false,
        },
      },
    ),
    { ready: true },
  );
  const controller = useCalendarView({
    config,
    texts,
    dateUtils,
    emit() {},
    getViewEvents: () => [],
  });
  const calendar = {
    prefixCls: 'sd-calendar',
    config,
    texts,
    dateUtils,
    touch: { isDraggingCell: false, isDraggingEvent: false, isResizingEvent: false },
    view: {
      ...controller.layout,
      broader: controller.navigation.switchToBroaderView,
      narrower: controller.navigation.switchToNarrowerView,
      updateSelectedDate: controller.navigation.updateSelectedDate,
    },
  };
  const now = new Date(2026, 10, 8, late ? 12 : 11, late ? 15 : 45);
  return (
    <>
      <button onClick={() => setTwelveHour(!twelveHour)}>Clock format</button>
      <button onClick={() => setHorizontal(!horizontal)}>Orientation</button>
      <button onClick={() => setCustom(!custom)}>Custom labels</button>
      <button onClick={() => setLabels(!labels)}>Toggle labels</button>
      <button onClick={() => setLate(!late)}>Advance time</button>
      <button onClick={() => setChinese(!chinese)}>Language</button>
      <div
        className={`sd-calendar${horizontal ? ' sd-calendar--horizontal' : ''}`}
        style={{ '--sd-calendar-time-cell-size': '50px' } as CSSProperties}
      >
        <CalendarTimeColumn
          calendar={calendar}
          now={now}
          allDayLabel={custom ? <b>Custom all day</b> : undefined}
          renderTimeCell={
            custom
              ? (time) => (
                  <span>
                    {time.index}|{time.hours}|{time.minutes}|{time.minutesSum}|{time.format12}|
                    {time.format24}
                  </span>
                )
              : undefined
          }
          renderCurrentTimeLabel={
            custom
              ? ({ now: value, timeFormatted }) => (
                  <b>
                    {value.getMinutes()}|{timeFormatted}
                  </b>
                )
              : undefined
          }
        />
      </div>
    </>
  );
}
