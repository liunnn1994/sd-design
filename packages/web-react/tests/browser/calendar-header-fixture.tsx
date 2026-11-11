import { createDateUtils } from '@sdata/web-core/calendar/utils/date';
import { useState } from 'react';

import { resolveCalendarConfig } from '../../src/calendar/config.js';
import { CalendarHeader } from '../../src/calendar/header.js';
import { useCalendarTexts } from '../../src/calendar/use-texts.js';
import { useCalendarView } from '../../src/calendar/use-view.js';

const dateUtils = createDateUtils();
export function CalendarHeaderFixture() {
  const texts = useCalendarTexts({ locale: 'en' });
  const [custom, setCustom] = useState(false);
  const [override, setOverride] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [submits, setSubmits] = useState(0);
  const config = Object.assign(
    resolveCalendarConfig(
      {
        view: 'month',
        clickToNavigate: true,
        viewDate: '2026-02-10',
        viewsBar: !hidden,
        titleBar: !hidden,
      },
      {
        dateUtils,
        view: {
          id: 'month',
          isDay: false,
          isDays: false,
          isWeek: false,
          isMonth: true,
          isYear: false,
        },
      },
    ),
    { ready: true },
  );
  const controller = useCalendarView({
    config,
    dateUtils,
    texts,
    emit() {},
    getViewEvents: () => [],
  });
  return (
    <>
      <button onClick={() => setCustom(!custom)}>Custom content</button>
      <button onClick={() => setOverride(!override)}>Override header</button>
      <button onClick={() => setHidden(!hidden)}>Hide bars</button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmits(submits + 1);
        }}
        className="sd-calendar"
        style={{ width: 700 }}
      >
        <CalendarHeader
          prefixCls="sd-calendar"
          config={config}
          texts={texts}
          controller={controller}
          previousLabel="Previous range"
          nextLabel="Next range"
          renderHeader={override ? (view) => <span>Entire header: {view.id}</span> : undefined}
          renderTitle={custom ? (view) => `Generic: ${view.id}` : undefined}
          renderViewTitle={
            custom ? { month: (view) => `Month specific: ${view.start.getMonth() + 1}` } : undefined
          }
          previousButton={custom ? <span>Back</span> : undefined}
          nextButton={custom ? <span>Forward</span> : undefined}
          renderTodayButton={
            custom
              ? ({ navigate, active }) => (
                  <button type="button" onClick={navigate}>
                    Custom today: {String(active)}
                  </button>
                )
              : undefined
          }
        />
      </form>
      <output data-testid="header-view">{controller.state.id}</output>
      <output data-testid="header-date">{dateUtils.formatDateLite(controller.layout.start)}</output>
      <output data-testid="header-submits">{submits}</output>
    </>
  );
}
