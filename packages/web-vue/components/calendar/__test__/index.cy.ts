import Calendar from '../index';

const overlapEvents = [
  { start: '2025-01-08 12:00', end: '2025-01-08 13:00', title: 'Event 1' },
  { start: '2025-01-08 12:15', end: '2025-01-08 13:15', title: 'Event 2' },
];

describe('Calendar', () => {
  it('emits ready and renders week view by default', () => {
    cy.mount(Calendar, { props: { viewDate: '2025-01-08' } });
    cy.get('.sd-calendar').should('have.class', 'sd-calendar--week-view');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ready')).to.have.length(1);
    });
  });

  it('renders the custom header slot', () => {
    cy.mount(Calendar, {
      props: { viewDate: '2025-01-08' },
      slots: { header: '<div class="calendar-header-slot">自定义头部</div>' },
    });
    cy.get('.calendar-header-slot').should('contain.text', '自定义头部');
  });

  it('renders overlap stack classes when stackEvents is enabled', () => {
    cy.mount(Calendar, {
      props: {
        view: 'week',
        viewDate: '2025-01-08',
        stackEvents: true,
        events: overlapEvents,
        timeFrom: 9 * 60,
        timeTo: 18 * 60,
      },
      attrs: { style: 'height: 600px' },
    });
    cy.get('.sd-calendar__event').should(($els) => {
      expect($els).to.have.lengthOf.at.least(2);
    });
    cy.get('body').then(($body) => {
      const hasStack =
        $body.find('.sd-calendar__event--stack-1-2').length > 0 ||
        $body.find('.sd-calendar__event--stack-2-2').length > 0;
      expect(hasStack, 'expected a stack-N-M class on an event').to.equal(true);
    });
  });

  describe('views & navigation', () => {
    it('renders 6 view buttons and switches view via the views bar', () => {
      cy.mount(Calendar, {
        props: { viewDate: '2025-01-08', locale: 'en-us' },
      });
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--week-view');
      cy.get('.sd-calendar__view-button').should('have.length', 6);
      // Buttons are ordered: day, days, week, month, year, years.
      cy.get('.sd-calendar__view-button').eq(3).click();
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--month-view');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:view')).to.deep.equal([['month']]);
        const payload = wrapper.emitted('view-change').pop()[0];
        expect(payload.id).to.equal('month');
        expect(payload.title).to.equal('January 2025');
      });
    });

    it('emits update:viewDate and updates the title on next/previous navigation', () => {
      cy.mount(Calendar, {
        props: { view: 'month', viewDate: '2025-01-08', locale: 'en-us' },
      });
      cy.get('.sd-calendar__title').should('contain.text', 'January 2025');
      cy.get('.sd-calendar__nav--next').click();
      cy.get('.sd-calendar__title').should('contain.text', 'February 2025');
      cy.get('@vue').should(({ wrapper }) => {
        const calls = wrapper.emitted('update:viewDate');
        expect(calls).to.have.length(1);
        const d = calls[0][0];
        expect(d.getFullYear()).to.equal(2025);
        expect(d.getMonth()).to.equal(1); // 0-based: February.
        expect(d.getDate()).to.equal(1);
      });
      cy.get('.sd-calendar__nav--prev').click();
      cy.get('.sd-calendar__title').should('contain.text', 'January 2025');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:viewDate')).to.have.length(2);
      });
    });

    it('exposes a view API with title, id, dates and navigation methods', () => {
      cy.mount(Calendar, {
        props: { viewDate: '2025-01-08', locale: 'en-us' },
      });
      cy.get('@vue').should(({ wrapper }) => {
        const view = wrapper.vm.view;
        expect(view.id).to.equal('week');
        expect(view.title).to.equal('January 6-12, 2025');
        expect(view.firstCellDate.getDate()).to.equal(6);
        expect(view.lastCellDate.getDate()).to.equal(12);
      });
      cy.get('@vue').then(({ wrapper }) => {
        wrapper.vm.view.next();
      });
      cy.get('.sd-calendar__title').should('contain.text', 'January 13-19, 2025');
      cy.get('@vue').should(({ wrapper }) => {
        const calls = wrapper.emitted('view-change');
        expect(calls).to.have.lengthOf.at.least(1);
        const last = calls[calls.length - 1];
        expect(last[0].id).to.equal('week');
        expect(last[0].title).to.equal('January 13-19, 2025');
      });
    });

    it('navigates to the broader view on title click with clickToNavigate', () => {
      cy.mount(Calendar, {
        props: { view: 'week', viewDate: '2025-01-08', locale: 'en-us', clickToNavigate: true },
      });
      cy.get('.sd-calendar__title').click();
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--month-view');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:view')).to.deep.equal([['month']]);
      });
    });

    it('highlights the selected date and emits v-model events on cell click', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          selectedDate: '2025-01-09',
          locale: 'en-us',
        },
        attrs: { style: 'height: 600px' },
      });
      cy.get('.sd-calendar__cell--selected').should('have.length', 1);
      // Cells are tall time-grid columns: force the click, the handler does not use coordinates.
      cy.get('.sd-calendar__cell').eq(0).click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        const sel = wrapper.emitted('update:selectedDate');
        expect(sel).to.have.length(1);
        const d = sel[0][0];
        expect(d.getFullYear()).to.equal(2025);
        expect(d.getMonth()).to.equal(0);
        expect(d.getDate()).to.equal(6);
        expect(wrapper.emitted('update:viewDate')).to.have.length(1);
      });
      cy.get('.sd-calendar__cell--selected').should('have.length', 1);
      // The selection moved from Jan 9 to the clicked Jan 6 cell.
      cy.get('.sd-calendar__cell').eq(0).should('have.class', 'sd-calendar__cell--selected');
    });

    it('disables cells listed in disableDays and ignores clicks on them', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          disableDays: ['2025-01-08'],
          locale: 'en-us',
        },
        attrs: { style: 'height: 600px' },
      });
      cy.get('.sd-calendar__cell--disabled').should('have.length', 1);
      cy.get('.sd-calendar__cell--disabled').click({ force: true });
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:selectedDate')).to.equal(undefined);
        expect(wrapper.emitted('update:viewDate')).to.equal(undefined);
        expect(wrapper.emitted('view-change')).to.equal(undefined);
      });
    });

    it('marks cells before minDate and after maxDate as disabled', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          minDate: '2025-01-08',
          maxDate: '2025-01-10',
          locale: 'en-us',
        },
      });
      cy.get('.sd-calendar__cell--before-min').should('have.length', 2);
      cy.get('.sd-calendar__cell--after-max').should('have.length', 2);
      cy.get('.sd-calendar__cell--wed').should('not.have.class', 'sd-calendar__cell--disabled');
    });
  });

  describe('event rendering', () => {
    it('renders event title and 24h time range in week view', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          locale: 'en-us',
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:30', title: 'Team sync' }],
        },
      });
      cy.get('.sd-calendar__event').should('have.length', 1);
      cy.get('.sd-calendar__event-title').should('have.text', 'Team sync');
      cy.get('.sd-calendar__event-start').should('have.text', '10:00');
      cy.get('.sd-calendar__event-end').should('contain.text', '11:30');
    });

    it('formats event times in 12-hour format with twelveHour', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          twelveHour: true,
          locale: 'en-us',
          events: [{ start: '2025-01-08 12:00', end: '2025-01-08 13:00', title: 'Lunch' }],
        },
      });
      cy.get('.sd-calendar__event-start').should('have.text', '12:00 PM');
      cy.get('.sd-calendar__event-end').should('contain.text', '1:00 PM');
    });

    it('adds cut classes to events outside the timeFrom/timeTo range', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          timeFrom: 9 * 60,
          timeTo: 18 * 60,
          locale: 'en-us',
          events: [{ start: '2025-01-08 08:00', end: '2025-01-08 19:00', title: 'Long day' }],
        },
      });
      cy.get('.sd-calendar__event').should('have.length', 1);
      cy.get('.sd-calendar__event--cut-top').should('have.length', 1);
      cy.get('.sd-calendar__event--cut-bottom').should('have.length', 1);
    });

    it('renders events through the event slot', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          locale: 'en-us',
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Event 1' }],
        },
        slots: {
          event:
            '<template #event="{ event }"><div class="my-event">{{ event.title }}!</div></template>',
        },
      });
      cy.get('.my-event').should('have.text', 'Event 1!');
    });

    it('forwards onEventClick listener via attrs to the calendar event', () => {
      const onEventClick = cy.spy().as('onEventClick');
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          locale: 'en-us',
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Event 1' }],
        },
        attrs: { onEventClick, style: 'height: 600px' },
      });
      // Events are absolutely positioned inside a scrollable grid: force the click.
      cy.get('.sd-calendar__event').click({ force: true });
      cy.get('@onEventClick').should('have.been.calledOnce');
      cy.get('@onEventClick').should('have.been.calledWithMatch', { event: { title: 'Event 1' } });
      // Clicking an event must not trigger cell navigation.
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--week-view');
    });

    it('renders all-day events in the all-day bar with allDayEvents', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          allDayEvents: true,
          locale: 'en-us',
          events: [
            // End must be the next midnight: an end at the same midnight is treated as multiday
            // and is excluded from its own day range.
            { start: '2025-01-08', end: '2025-01-09', allDay: true, title: 'All-day offsite' },
            { start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Timed' },
          ],
        },
      });
      cy.get('.sd-calendar__all-day').should('exist');
      cy.get('.sd-calendar__all-day .sd-calendar__event').should('have.length', 1);
      cy.get('.sd-calendar__all-day .sd-calendar__event-title').should(
        'have.text',
        'All-day offsite',
      );
      // The timed event stays in the grid, not in the all-day bar.
      cy.get('.sd-calendar__all-day .sd-calendar__event-time').should('not.exist');
      cy.get('.sd-calendar__event').should('have.length', 2);
      cy.get('.sd-calendar__event--all-day').should('have.length', 1);
    });

    it('renders events in their own schedule column with schedules', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          schedules: [
            { id: 'alice', label: 'Alice' },
            { id: 'bob', label: 'Bob' },
          ],
          locale: 'en-us',
          events: [
            {
              start: '2025-01-08 09:00',
              end: '2025-01-08 10:00',
              title: 'With Alice',
              schedule: 'alice',
            },
            {
              start: '2025-01-08 10:00',
              end: '2025-01-08 11:00',
              title: 'With Bob',
              schedule: 'bob',
            },
          ],
        },
      });
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--has-schedules');
      cy.get('.sd-calendar__schedules-headings').should('contain.text', 'Alice');
      cy.get('.sd-calendar__schedules-headings').should('contain.text', 'Bob');
      cy.get('.sd-calendar__cell--wed').within(() => {
        cy.get('[data-schedule="alice"]').should('contain.text', 'With Alice');
        cy.get('[data-schedule="bob"]').should('contain.text', 'With Bob');
        cy.get('[data-schedule="bob"]').should('not.contain.text', 'With Alice');
      });
    });

    it('renders special hours ranges with their label in week view', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          specialHours: { wed: [{ from: 720, to: 840, label: 'Lunch' }] },
          locale: 'en-us',
        },
      });
      cy.get('.sd-calendar__cell--wed .sd-calendar__special-hours').should('contain.text', 'Lunch');
      cy.get('.sd-calendar__cell--tue .sd-calendar__special-hours').should('not.exist');
    });

    it('shows event counts per cell in month view with eventCount', () => {
      cy.mount(Calendar, {
        props: {
          view: 'month',
          viewDate: '2025-01-08',
          eventCount: true,
          locale: 'en-us',
          events: [{ start: '2025-01-15 09:00', end: '2025-01-15 10:00', title: 'X' }],
        },
      });
      cy.get('.sd-calendar__cell-events-count').should('have.length', 1);
      cy.get('.sd-calendar__cell-events-count').should('have.text', '1');
    });
  });

  describe('editable events', () => {
    it('creates an event by dragging on a cell when editableEvents is on', () => {
      // The minutes are derived from the real cell height at drag time.
      const dragTimes = { startMinutes: 0, endMinutes: 0 };
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          editableEvents: true,
          locale: 'en-us',
        },
        attrs: { style: 'height: 600px' },
      });
      // Drag with real DOM events: mousedown on the cell, mousemove/mouseup on the document
      // (the cell listens on the cell, the drag lifecycle listens on document).
      cy.document().then((doc) => {
        const cell = doc.querySelector<HTMLElement>('.sd-calendar__cell--wed');
        expect(cell, 'wednesday cell exists').to.not.equal(null);
        const rect = cell.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y0 = rect.top + 20;
        const y1 = rect.top + 80;
        const dayMinutes = (offsetPx: number) => Math.floor((offsetPx / rect.height) * (24 * 60));
        dragTimes.startMinutes = dayMinutes(20);
        dragTimes.endMinutes = dayMinutes(80);
        const mouseEvent = (target: EventTarget, type: string, clientY: number) =>
          target.dispatchEvent(
            new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY }),
          );
        mouseEvent(cell, 'mousedown', y0);
        mouseEvent(doc, 'mousemove', y1);
      });
      // The placeholder renders while dragging (before mouseup).
      cy.get('.sd-calendar__event-placeholder').should('exist');
      cy.document().then((doc) => {
        const cell = doc.querySelector<HTMLElement>('.sd-calendar__cell--wed');
        const rect = cell.getBoundingClientRect();
        doc.dispatchEvent(
          new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + 80,
          }),
        );
      });
      cy.get('.sd-calendar__event').should('exist');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('event-created')).to.have.length(1);
        const ev = wrapper.emitted('event-created')[0][0];
        // The component computes minutes through its own float percentage pipeline, which can
        // land one minute off the derivation here at rounding boundaries: allow +/- 2 minutes.
        expect(ev.start.getHours() * 60 + ev.start.getMinutes()).to.be.closeTo(
          dragTimes.startMinutes,
          2,
        );
        expect(ev.end.getHours() * 60 + ev.end.getMinutes()).to.be.closeTo(dragTimes.endMinutes, 2);
      });
    });

    it('shows the delete button on event double click and emits on deletion', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          editableEvents: true,
          locale: 'en-us',
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Event 1' }],
        },
        attrs: { style: 'height: 600px' },
      });
      // Events are absolutely positioned inside a scrollable grid: force the double click.
      cy.get('.sd-calendar__event').dblclick({ force: true });
      cy.get('.sd-calendar__event-delete').should('exist');
      cy.get('.sd-calendar__event-delete').click({ force: true });
      cy.get('.sd-calendar__event').should('not.exist');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('event-delete')).to.have.length(1);
        expect(wrapper.emitted('update:events')).to.have.length(1);
        expect(wrapper.emitted('update:events')[0][0]).to.have.length(0);
      });
    });
  });

  describe('view configuration', () => {
    it('hides weekends in week view with hideWeekends', () => {
      cy.mount(Calendar, {
        props: { view: 'week', viewDate: '2025-01-08', hideWeekends: true, locale: 'en-us' },
      });
      cy.get('.sd-calendar__weekday').should('have.length', 5);
      cy.get('.sd-calendar__weekday-date').first().should('have.text', '6');
      cy.get('.sd-calendar__cell--sat').should('not.exist');
      cy.get('.sd-calendar__cell--sun').should('not.exist');
    });

    it('starts the week on Sunday with startWeekOnSunday', () => {
      cy.mount(Calendar, {
        props: { view: 'week', viewDate: '2025-01-08', startWeekOnSunday: true, locale: 'en-us' },
      });
      cy.get('.sd-calendar__title').should('contain.text', 'January 5-11, 2025');
      cy.get('.sd-calendar__weekday-date').first().should('have.text', '5');
    });

    it('restricts available views with the views prop', () => {
      cy.mount(Calendar, {
        props: { viewDate: '2025-01-08', views: ['month'], locale: 'en-us' },
      });
      cy.get('.sd-calendar__view-button').should('have.length', 1);
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--month-view');
    });

    it('renders 42 cells with out-of-range days in month view', () => {
      cy.mount(Calendar, {
        props: { view: 'month', viewDate: '2025-01-08', locale: 'en-us' },
      });
      // January 2025 grid: Mon Dec 30 2024 - Sun Feb 9 2025 = 42 cells, of which
      // 2 leading (Dec 30-31) + 9 trailing (Feb 1-9) are out of range.
      cy.get('.sd-calendar__cell').should('have.length', 42);
      cy.get('.sd-calendar__cell--out-of-range').should('have.length', 11);
      cy.get('.sd-calendar__title').should('contain.text', 'January 2025');
      cy.get('.sd-calendar__cell-date').first().should('have.text', '30');
    });

    it('renders week numbers on month view with weekNumbers', () => {
      cy.mount(Calendar, {
        props: { view: 'month', viewDate: '2025-01-08', weekNumbers: true, locale: 'en-us' },
      });
      cy.get('.sd-calendar__week-number').should('have.length', 6);
    });

    it('renders time column labels for timeFrom/timeTo/timeStep', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          timeFrom: 9 * 60,
          timeTo: 18 * 60,
          timeStep: 60,
          locale: 'en-us',
        },
      });
      cy.get('.sd-calendar__time-cell').should('have.length', 9);
      cy.get('.sd-calendar__time-cell').first().should('contain.text', '09:00');
      cy.get('.sd-calendar__time-cell').last().should('contain.text', '17:00');
    });

    it('hides the time column and event times with time: false', () => {
      cy.mount(Calendar, {
        props: {
          view: 'week',
          viewDate: '2025-01-08',
          time: false,
          locale: 'en-us',
          events: [{ start: '2025-01-08 10:00', end: '2025-01-08 11:00', title: 'Event 1' }],
        },
      });
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--timeless');
      cy.get('.sd-calendar__time-column').should('not.exist');
      cy.get('.sd-calendar__event-time').should('not.exist');
      cy.get('.sd-calendar__event-title').should('have.text', 'Event 1');
    });

    it('renders date picker mode with month/year/years views', () => {
      cy.mount(Calendar, {
        props: { viewDate: '2025-01-08', datePicker: true, locale: 'en-us' },
      });
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--date-picker');
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--xs');
      cy.get('.sd-calendar__view-button').should('have.length', 3);
      cy.get('.sd-calendar__view-button').eq(1).click();
      cy.get('.sd-calendar').should('have.class', 'sd-calendar--year-view');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('update:view')).to.deep.equal([['year']]);
      });
    });

    it('shows a time label at the cursor position with timeAtCursor', () => {
      cy.mount(Calendar, {
        props: { view: 'week', viewDate: '2025-01-08', timeAtCursor: true, locale: 'en-us' },
        attrs: { style: 'height: 600px' },
      });
      // The body is inside the scrollable container: dispatch real DOM events on it directly.
      cy.document().then((doc) => {
        const body = doc.querySelector<HTMLElement>('.sd-calendar__body');
        expect(body, 'calendar body exists').to.not.equal(null);
        const rect = body.getBoundingClientRect();
        body.dispatchEvent(
          new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2,
          }),
        );
      });
      cy.get('.sd-calendar__time-at-cursor').should('exist');
      cy.get('.sd-calendar__time-at-cursor label')
        .invoke('text')
        .should('match', /^\d{2}:\d{2}$/);
      cy.document().then((doc) => {
        const body = doc.querySelector<HTMLElement>('.sd-calendar__body');
        expect(body, 'calendar body exists').to.not.equal(null);
        // mouseleave is non-bubbling; the listener sits on the body element itself.
        body.dispatchEvent(new MouseEvent('mouseleave'));
      });
      cy.get('.sd-calendar__time-at-cursor').should('not.exist');
    });

    it('renders zh-cn locale via the locale prop', () => {
      cy.mount(Calendar, {
        props: { view: 'month', viewDate: '2025-01-08', locale: 'zh-cn' },
      });
      cy.get('.sd-calendar').should('have.attr', 'data-locale', 'zh-cn');
      cy.get('.sd-calendar__title').should('contain.text', '一月 2025');
    });
  });
});
