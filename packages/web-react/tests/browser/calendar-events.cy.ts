{
  describe('Calendar React event lifecycle', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=events'));
    it('normalizes date-only strings as local calendar days', () => {
      cy.contains('button', 'Replace string date').click();
      cy.get('li').should('have.length', 1).and('contain', 'Date only:0:0');
    });
    it('creates snapped events and deletes through the current controller in StrictMode', () => {
      cy.get('li').should('contain', 'Original:9:0');
      cy.get('[data-testid="calendar-events-source"]').should('have.text', 'undefined:23');
      cy.contains('button', 'Create event').click();
      cy.get('li').should('have.length', 2).and('contain', 'Created:12:0');
      cy.contains('button', 'Delete Created').click();
      cy.get('li').should('have.length', 1);
      cy.get('[data-testid="calendar-events-log"]').should(
        'have.text',
        'update:events|event-delete',
      );
      cy.contains('button', 'Mount events').click();
      cy.get('li').should('not.exist');
      cy.contains('button', 'Mount events').click();
      cy.contains('button', 'Delete Original').click();
      cy.get('li').should('not.exist');
      cy.get('[data-testid="calendar-events-log"]').should(
        'have.text',
        'update:events|event-delete|update:events|event-delete',
      );
      cy.get('[data-testid="calendar-events-source"]').should('have.text', 'undefined:23');
    });
    it('accepts replaced input collections and live edit permissions without resetting local creations', () => {
      cy.contains('button', 'Create event').click();
      cy.contains('button', 'Deletion enabled').click();
      cy.contains('button', 'Delete Created').click();
      cy.get('li').should('have.length', 2);
      cy.get('[data-testid="calendar-events-log"]').should('have.text', '');
      cy.contains('button', 'Replace events').click();
      cy.get('li').should('have.length', 1).and('contain', 'Replacement:9:0');
      cy.contains('button', 'Deletion enabled').click();
      cy.contains('button', 'Delete Replacement').click();
      cy.get('li').should('not.exist');
    });
  });
}

{
  describe('Calendar header', () => {
    beforeEach(() => {
      cy.clock(new Date(2026, 10, 8).getTime(), ['Date']);
      cy.visit('/calendar.html?fixture=header');
    });
    it('navigates ranges and broader views without submitting a parent form', () => {
      cy.get('[data-testid="header-date"]').should('have.text', '2026-02-01');
      cy.get('[aria-label="Next range"]').click();
      cy.get('[data-testid="header-date"]').should('have.text', '2026-03-01');
      cy.get('[aria-label="Previous range"]').click();
      cy.get('[data-testid="header-date"]').should('have.text', '2026-02-01');
      cy.get(
        '.sd-calendar__transition-wrap > div:not([inert]) > button.sd-calendar__title',
      ).click();
      cy.get('[data-testid="header-view"]').should('have.text', 'year');
      cy.get(
        '.sd-calendar__transition-wrap > div:not([inert]) > button.sd-calendar__title',
      ).click();
      cy.get('[data-testid="header-view"]').should('have.text', 'years');
      cy.get('div.sd-calendar__title').should('exist');
      cy.get('.sd-calendar__view-button').contains('Month').click();
      cy.get('.sd-calendar__view-button--active').should('have.attr', 'aria-pressed', 'true');
      cy.get('[data-testid="header-submits"]').should('have.text', '0');
    });
    it('prioritizes view titles, restores default arrows and disables today when in range', () => {
      cy.contains('button', 'Custom content').click();
      cy.get('.sd-calendar__transition-wrap > div:not([inert]) > .sd-calendar__title').should(
        'have.text',
        'Month specific: 2',
      );
      cy.get('[aria-label="Previous range"]')
        .should('have.text', 'Back')
        .and('not.have.class', 'sd-calendar__nav--default');
      cy.get('.sd-calendar__transition-wrap > div:not([inert]) > .sd-calendar__title').click();
      cy.get('.sd-calendar__transition-wrap > div:not([inert]) > .sd-calendar__title').should(
        'have.text',
        'Generic: year',
      );
      cy.get('[aria-label="Previous range"]').click();
      cy.contains('button', 'Custom today: false').click();
      cy.contains('button', 'Custom today: true').should('exist');
      cy.contains('button', 'Custom content').click();
      cy.get('.sd-calendar__nav--today').should('be.disabled');
      cy.get('[aria-label="Previous range"]').should('have.class', 'sd-calendar__nav--default');
    });
    it('replaces the whole header and respects independent visibility controls', () => {
      cy.contains('button', 'Override header').click();
      cy.get('.sd-calendar__header').should('have.text', 'Entire header: month');
      cy.get('.sd-calendar__title-bar').should('not.exist');
      cy.contains('button', 'Override header').click();
      cy.contains('button', 'Hide bars').click();
      cy.get('.sd-calendar__header').should('be.empty');
      cy.contains('button', 'Hide bars').click();
      cy.get('.sd-calendar__views-bar').should('be.visible');
    });
    it('keeps leaving titles inert, animates both directions and cleans up rapid reversals', () => {
      cy.get('form').invoke('css', '--sd-calendar-transition-duration', '0.8s');
      cy.get('[aria-label="Next range"]').click();
      cy.get('.sd-calendar__transition-wrap > [inert]').should('have.attr', 'aria-hidden', 'true');
      cy.get('.sd-calendar-slide-fade--right-enter-active').should('exist');
      cy.get('[aria-label="Previous range"]').click();
      cy.get('.sd-calendar-slide-fade--left-enter-active').should('exist');
      cy.get('[data-testid="header-date"]').should('have.text', '2026-02-01');
      cy.get('.sd-calendar__transition-wrap > div').should('have.length', 1);
      cy.get('.sd-calendar__transition-wrap > div').should('not.have.attr', 'inert');
      cy.get('[class*="-enter-active"], [class*="-leave-active"]').should('not.exist');
      cy.get('[aria-label="Next range"]').click();
      cy.contains('button', 'Override header').click();
      cy.get('.sd-calendar__transition-wrap').should('not.exist');
      cy.contains('button', 'Override header').click();
      cy.get('.sd-calendar__transition-wrap > div').should('have.length', 1);
      cy.get('[class*="-enter-active"], [class*="-leave-active"]').should('not.exist');
    });
  });
}

{
  describe('Calendar headings', () => {
    beforeEach(() => {
      cy.clock(new Date(2026, 10, 8).getTime(), ['Date']);
      cy.visit('/calendar.html?fixture=headings');
    });
    it('uses localized weekdays, selects by mouse and keyboard, and updates hidden days', () => {
      cy.get('.sd-calendar__weekday').should('have.length', 7);
      cy.get('.sd-calendar__weekday-day').first().should('have.text', 'Monday');
      cy.get('.sd-calendar__weekday').first().click();
      cy.get('[data-testid="selected-day"]').should('have.text', '2026-11-02');
      cy.get('.sd-calendar__weekday').eq(1).focus().type(' ');
      cy.get('[data-testid="selected-day"]').should('have.text', '2026-11-03');
      cy.contains('button', 'Compact headings').click();
      cy.get('.sd-calendar__weekday-day').first().should('have.text', 'Mo');
      cy.contains('button', 'Hide weekends').click();
      cy.get('.sd-calendar__weekday').should('have.length', 5);
      cy.get('.sd-calendar__all-day-cell').should('have.length', 5);
    });
    it('renders only all-day events and preserves custom heading and event priority', () => {
      cy.get('.sd-calendar__event-title').should('have.text', 'Holiday');
      cy.contains('Meeting').should('not.exist');
      cy.contains('button', 'Custom headings').click();
      cy.get('.sd-calendar__weekday').first().should('contain.text', 'mon|2|Monday');
      cy.get('.sd-calendar__event-details').should('have.text', 'All day Holiday');
      cy.contains('button', 'Schedules').click();
      cy.get('.sd-calendar__schedule--heading').should('have.length', 14);
      cy.get('.sd-calendar__schedule--heading').first().should('have.text', '0|2|23');
      cy.get('.sd-calendar__schedule--heading button').first().click();
      cy.get('[data-testid="headings-view"]').should('have.text', 'month');
    });
    it('hides date numbers in month view and hides headings in year and plain day views', () => {
      cy.contains('button', 'Month view').click();
      cy.get('.sd-calendar__weekday').should('have.length', 7).and('not.have.attr', 'role');
      cy.get('.sd-calendar__weekday-date, .sd-calendar__all-day').should('not.exist');
      cy.contains('button', 'Year view').click();
      cy.get('.sd-calendar__headings').should('not.exist');
      cy.contains('button', 'Day view').click();
      cy.get('.sd-calendar__weekdays-headings').should('not.exist');
      cy.get('.sd-calendar__all-day-cell').should('have.length', 1);
      cy.contains('button', 'All day bar').click();
      cy.get('.sd-calendar__headings').should('not.exist');
      cy.contains('button', 'Schedules').click();
      cy.get('.sd-calendar__schedule--heading').should('have.length', 2);
    });
    it('resizes the all-day bar, clamps its minimum and cleans up on release and unmount', () => {
      cy.get('.sd-calendar__all-day-resizer').trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
        clientX: 20,
        clientY: 60,
      });
      cy.get('.sd-calendar__all-day-resizer').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: 20,
        clientY: 100,
      });
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('100px'),
      );
      cy.get('.sd-calendar__all-day-resizer').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: 20,
        clientY: -100,
      });
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('20px'),
      );
      cy.get('.sd-calendar__all-day-resizer').trigger('pointerup', {
        eventConstructor: 'PointerEvent',
      });
      cy.get('.sd-calendar__all-day-resizer').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: 20,
        clientY: 200,
      });
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('20px'),
      );
      cy.get('.sd-calendar__all-day-resizer').trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
        clientX: 20,
        clientY: 20,
      });
      cy.contains('button', 'Mount headings').then(($button) => $button[0].click());
      cy.get('.sd-calendar__headings').should('not.exist');
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('20px'),
      );
    });
    it('uses the horizontal resize axis and cancels a gesture when orientation changes', () => {
      cy.contains('button', 'Orientation').click();
      cy.get('.sd-calendar__all-day-resizer').trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
        clientX: 60,
        clientY: 20,
      });
      cy.get('.sd-calendar__all-day-resizer').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: 100,
        clientY: 200,
      });
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('100px'),
      );
      cy.contains('button', 'Orientation').then(($button) => $button[0].click());
      cy.get('[data-testid="calendar-root"]').should('not.have.class', 'sd-calendar--horizontal');
      cy.get('.sd-calendar__all-day-resizer').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: 200,
        clientY: 300,
      });
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('100px'),
      );
    });
    it('resizes with touch and stops responding after pointercancel', () => {
      cy.get('.sd-calendar__all-day-resizer').trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
        pointerType: 'touch',
        clientX: 20,
        clientY: 60,
      });
      cy.get('.sd-calendar__all-day-resizer').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        pointerType: 'touch',
        clientX: 20,
        clientY: 100,
      });
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('100px'),
      );
      cy.get('.sd-calendar__all-day-resizer').trigger('pointercancel', {
        eventConstructor: 'PointerEvent',
        pointerType: 'touch',
      });
      cy.get('.sd-calendar__all-day-resizer').trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        pointerType: 'touch',
        clientX: 20,
        clientY: 200,
      });
      cy.get('[data-testid="calendar-root"]').should(($el) =>
        expect($el[0].style.getPropertyValue('--sd-calendar-all-day-bar-size')).to.equal('100px'),
      );
    });
  });
}

{
  describe('Calendar React text adapter', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=texts'));
    it('isolates explicit locales and follows provider changes and overrides', () => {
      cy.get('[data-testid="calendar-texts-live"]')
        .should('contain', '今天')
        .and('contain', '一月');
      cy.get('[data-testid="calendar-texts-fixed"]').should(
        'have.text',
        'Today|January|Monday|January|en',
      );
      cy.contains('button', 'Global language').click();
      cy.get('[data-testid="calendar-texts-live"]').should(
        'have.text',
        'Today|January|Monday|January|en',
      );
      cy.contains('button', 'Override language').click();
      cy.contains('button', 'Global language').click();
      cy.get('[data-testid="calendar-texts-live"]').should(
        'have.text',
        'Today|January|Monday|January|en',
      );
      cy.contains('button', 'Override language').click();
      cy.get('[data-testid="calendar-texts-live"]')
        .should('contain', '今天')
        .and('contain', '一月');
      cy.contains('button', 'Week start').click();
      cy.get('[data-testid="calendar-texts-fixed"]').should(
        'have.text',
        'Today|January|Monday|January|en',
      );
    });
    it('keeps the latest language during rapid changes and remounts cleanly in StrictMode', () => {
      cy.contains('button', 'Global language').click();
      cy.contains('button', 'Week start').click();
      cy.get('[data-testid="calendar-texts-live"]').should(
        'have.text',
        'Today|January|Monday|January|en',
      );
      cy.contains('button', 'Mount texts').click();
      cy.contains('button', 'Global language').click();
      cy.contains('button', 'Mount texts').click();
      cy.get('[data-testid="calendar-texts-live"]')
        .should('contain', '今天')
        .and('contain', '一月');
      cy.get('[data-testid="calendar-texts-fixed"]').should(
        'have.text',
        'Today|January|Monday|January|en',
      );
    });
  });
}

{
  describe('Calendar time column', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=time'));
    it('uses shared time ticks and truncates the last cell', () => {
      cy.get('.sd-calendar__time-cell').should('have.length', 3);
      cy.get('.sd-calendar__time-cell')
        .eq(0)
        .should('have.text', '10:00')
        .and('have.css', 'height', '50px');
      cy.get('.sd-calendar__time-cell')
        .eq(2)
        .should('have.text', '12:00')
        .and('have.css', 'height', '25px');
      cy.get('.sd-calendar__all-day-label').should('have.text', 'All Day');
      cy.contains('button', 'Clock format').click();
      cy.get('.sd-calendar__time-cell').eq(0).should('have.text', '10am');
      cy.get('.sd-calendar__time-cell').eq(2).should('have.text', '12pm');
      cy.contains('button', 'Language').click();
      cy.get('.sd-calendar__all-day-label').should('not.have.text', 'All Day').and('not.be.empty');
    });
    it('updates current time and switches its position axis without a stale inline axis', () => {
      cy.get('.sd-calendar__current-time')
        .should('have.attr', 'title', '11:45')
        .and('have.text', '11:45');
      cy.get('.sd-calendar__current-time').should(($el) =>
        expect($el[0].style.top).to.equal('70%'),
      );
      cy.contains('button', 'Advance time').click();
      cy.get('.sd-calendar__current-time')
        .should('have.text', '12:15')
        .and(($el) => expect($el[0].style.top).to.equal('90%'));
      cy.contains('button', 'Orientation').click();
      cy.get('.sd-calendar__current-time').should(($el) => {
        expect($el[0].style.left).to.equal('90%');
        expect($el[0].style.top).to.equal('');
      });
      cy.contains('button', 'Clock format').click();
      cy.get('.sd-calendar__current-time').should('have.text', '12:15 PM');
    });
    it('forwards all render parameters, restores defaults and removes optional labels', () => {
      cy.contains('button', 'Custom labels').click();
      cy.get('.sd-calendar__time-cell').eq(1).should('have.text', '1|11|0|660|11am|11:00');
      cy.get('.sd-calendar__all-day-label').should('have.text', 'Custom all day');
      cy.get('.sd-calendar__current-time').should('have.text', '45|11:45');
      cy.contains('button', 'Custom labels').click();
      cy.get('.sd-calendar__time-cell').eq(1).should('have.text', '11:00');
      cy.contains('button', 'Toggle labels').click();
      cy.get('.sd-calendar__all-day-label, .sd-calendar__current-time').should('not.exist');
      cy.get('.sd-calendar__time-cell').should('have.length', 3);
    });
  });
}

{
  describe('Calendar React view lifecycle', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=view'));
    it('publishes view-change only after the new range is committed', () => {
      cy.get('[data-testid="view-date"]').should('have.text', '2026-11-02');
      cy.get('[data-testid="view-log"]').should('have.text', '');
      cy.contains('button', 'Next range').click();
      cy.get('[data-testid="view-date"]').should('have.text', '2026-11-09');
      cy.get('[data-testid="view-log"]').should('have.text', '2026-11-09|2026-11-09');
      cy.contains('button', 'Previous range').click();
      cy.get('[data-testid="view-log"]').should(
        'have.text',
        '2026-11-09|2026-11-09;2026-11-02|2026-11-02',
      );
    });
    it('synchronizes external view and selected dates and retains the target when narrowing', () => {
      cy.contains('button', 'External dates').click();
      cy.get('[data-testid="view-kind"]').should('have.text', 'month');
      cy.get('[data-testid="view-date"]').should('have.text', '2026-12-01');
      cy.get('[data-testid="view-selected"]').should('have.text', '2026-12-20');
      cy.contains('button', 'Day view').click();
      cy.get('[data-testid="view-date"]').should('have.text', '2026-12-18');
      cy.contains('button', 'Clear selection').click();
      cy.get('[data-testid="view-selected"]').should('have.text', 'none');
    });
    it('cancels queued change callbacks after unmount and reconnects under StrictMode', () => {
      cy.contains('button', 'Navigate and unmount').click();
      cy.get('[data-testid="view-date"]').should('not.exist');
      cy.get('[data-testid="view-log"]').should('have.text', '');
      cy.contains('button', 'Mount view').click();
      cy.contains('button', 'Next range').click();
      cy.get('[data-testid="view-log"]').should('have.text', '2026-11-09|2026-11-09');
    });
    it('aligns real-time updates to the minute and stops when disabled', () => {
      cy.clock(new Date('2026-11-08T01:59:30Z').getTime());
      cy.contains('button', 'Watch time').click();
      cy.get('[data-testid="view-now"]').should('have.text', '2026-11-08T01:59:30.000Z');
      cy.tick(30000);
      cy.get('[data-testid="view-now"]').should('have.text', '2026-11-08T02:00:00.000Z');
      cy.contains('button', 'Watch time').click();
      cy.tick(60000);
      cy.get('[data-testid="view-now"]').should('have.text', '2026-11-08T02:00:00.000Z');
    });
  });
}

export {};
