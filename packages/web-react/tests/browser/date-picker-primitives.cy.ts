describe('React DatePicker primitive adapters', () => {
  beforeEach(() => cy.visit('/date-picker-primitives.html'));
  it('updates localized labels and replaces custom navigation icons', () => {
    cy.get('.sd-picker-header-title').should('have.text', '2026年-11月');
    cy.contains('button', 'Custom icons').click();
    cy.contains('.sd-picker-header-icon', 'Next custom').click();
    cy.get('.sd-picker-header-title').should('have.text', '2026年-12月');
    cy.contains('.sd-picker-header-label', '2026年').click();
    cy.get('[data-testid="events"]').should('contain.text', 'year');
    cy.contains('button', 'Custom icons').click();
    cy.get('.sd-icon-right').should('exist');
    cy.contains('Next custom').should('not.exist');
  });
  it('blocks disabled and hidden cells and restores revealed outer cells', () => {
    cy.get('[aria-label="2026-11-07"]').should('have.attr', 'aria-disabled', 'true').click();
    cy.get('[aria-label="2026-11-09"]').should('have.attr', 'aria-disabled', 'true').click();
    cy.get('[data-testid="events"]').should('not.contain.text', 'click:');
    cy.contains('button', 'Show outer dates').click();
    cy.get('[aria-label="2026-11-07"]').should('not.have.attr', 'aria-disabled');
    cy.get('[aria-label="2026-11-07"] ').click();
    cy.get('[data-testid="events"]').should('contain.text', 'click:7');
  });
  it('sorts range styles and forwards selected-cell hover and click events', () => {
    cy.get('[aria-label="2026-11-08"]')
      .should('have.attr', 'aria-selected', 'true')
      .and('have.class', 'sd-picker-cell-range-start')
      .trigger('mouseenter')
      .click();
    cy.get('[aria-label="2026-11-10"]').should('have.class', 'sd-picker-cell-range-end');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'hover:8')
      .and('contain.text', 'click:8');
  });
  it('keeps the week-number column outside selectable grid cells', () => {
    cy.contains('button', 'Week mode').click();
    cy.get('[role="gridcell"]').should('have.length', 3);
    cy.get('.sd-picker-cell-week').should('have.text', '7').click();
    cy.get('[data-testid="events"]').should('not.contain.text', 'click:7');
  });
});

describe('React DatePicker period panels', () => {
  for (const [mode, cell] of [
    ['month', '2026-07-01'],
    ['quarter', '2026-07-01'],
    ['year', '2026-01-01'],
  ]) {
    for (const all of [false, true]) {
      it(`${all ? 'rejects fully disabled' : 'accepts partially enabled'} ${mode}`, () => {
        cy.visit(`/date-picker-period.html?mode=${mode}&restricted${all ? '&all' : ''}`);
        cy.get(`[aria-label="${cell}"]`).should(($cell) => {
          expect($cell.attr('aria-disabled') === 'true').to.equal(all);
        });
        cy.get(`[aria-label="${cell}"]`).click();
        cy.get('[data-testid="events"]').should(
          all ? 'have.text' : 'contain.text',
          all ? '' : `select:${cell}`,
        );
      });
    }
  }
  for (const [mode, count, selected] of [
    ['month', 12, '2026-08-01'],
    ['quarter', 4, '2026-07-01'],
    ['year', 12, '2026-01-01'],
  ]) {
    it(`renders ${mode} rows and selects by its period`, () => {
      cy.visit(`/date-picker-period.html?mode=${mode}`);
      cy.get('[role="gridcell"]').should('have.length', count);
      cy.get('[aria-selected="true"]').should('have.attr', 'aria-label', selected);
    });
  }
  it('advances decade headers with shared navigation operations', () => {
    cy.visit('/date-picker-period.html?mode=year');
    cy.get('.sd-picker-header-title').should('have.text', '2020-2029');
    cy.get('.sd-picker-header-icon').last().click();
    cy.get('.sd-picker-header-title').should('have.text', '2030-2039');
    cy.get('[data-testid="events"]').should('have.text', 'header:2036');
    cy.get('.sd-picker-header-icon').first().click();
    cy.get('.sd-picker-header-title').should('have.text', '2020-2029');
  });
});

describe('React DatePicker calendar and clock adapters', () => {
  for (const [start, expected] of [
    [0, '2026-11-08'],
    [1, '2026-11-02'],
    [6, '2026-11-07'],
  ]) {
    it(`normalizes a selected week to start=${start}`, () => {
      cy.visit(`/date-picker-calendar.html?week&start=${start}`);
      cy.get('.sd-picker-cell-week').should('have.length', 6);
      cy.get('[aria-label="2026-11-08"]').click();
      cy.get('[data-testid="events"]').should('have.text', `date:${expected}`);
    });
  }
  it('hides outer dates without removing the six-week grid', () => {
    cy.visit('/date-picker-calendar.html');
    cy.get('[role="gridcell"]').should('have.length', 42);
    cy.get('.sd-picker-cell-hidden').should('have.attr', 'aria-disabled', 'true');
    cy.contains('button', 'Outer dates').click();
    cy.get('.sd-picker-cell-hidden').should('not.exist');
    cy.get('[aria-label="2026-12-01"]').click();
    cy.get('[data-testid="events"]').should('have.text', 'date:2026-12-01');
  });
  it('blocks disabled dates while retaining enabled selection', () => {
    cy.visit('/date-picker-calendar.html');
    cy.get('[aria-label="2026-11-09"]').should('have.attr', 'aria-disabled', 'true').click();
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.get('[aria-label="2026-11-10"]').click();
    cy.get('[data-testid="events"]').should('have.text', 'date:2026-11-10');
  });
  it('keeps controlled range view changes pending until accepted', () => {
    cy.visit('/date-picker-calendar.html?range&time&controlled&reject');
    cy.get('.sd-panel-date-view-tab-pane').last().click();
    cy.get('[data-testid="events"]').should('have.text', 'view:time');
    cy.get('[role="grid"]').should('be.visible');
    cy.get('.sd-timepicker-column').should('not.exist');
    cy.contains('button', 'External view').click();
    cy.get('[role="grid"]').should('not.exist');
    cy.get('.sd-timepicker-column').should('be.visible');
  });
  it('switches uncontrolled range views in both directions', () => {
    cy.visit('/date-picker-calendar.html?range&time');
    cy.get('.sd-panel-date-view-tab-pane').last().click();
    cy.get('.sd-timepicker-column').should('be.visible');
    cy.get('.sd-panel-date-view-tab-pane').first().click();
    cy.get('[role="grid"]').should('be.visible');
    cy.get('.sd-timepicker-column').should('not.exist');
  });
  it('updates the mounted clock from external values and applies disabled hours', () => {
    cy.visit('/date-picker-calendar.html?time');
    cy.get('.sd-timepicker-column')
      .first()
      .find('[aria-selected="true"]')
      .should('have.text', '09');
    cy.contains('button', 'External clock').click();
    cy.get('.sd-timepicker-column')
      .first()
      .find('[aria-selected="true"]')
      .should('have.text', '18');
    cy.get('.sd-timepicker-column')
      .first()
      .contains('li', /^10$/)
      .should('have.attr', 'aria-disabled', 'true')
      .click();
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.get('.sd-timepicker-column').first().contains('li', /^11$/).click();
    cy.get('[data-testid="events"]').should('have.text', 'time:11:45:20');
  });
});

describe('React DatePicker footer and shortcuts', () => {
  beforeEach(() => cy.visit('/date-picker-actions.html'));
  it('forwards shortcut identity and evaluates lazy values only on selection', () => {
    cy.get('[data-testid="factory"]').should('have.text', '0');
    cy.contains('.sd-picker-shortcuts button', 'Midmonth').trigger('mouseover');
    cy.get('[data-testid="events"]').should('contain.text', 'enter:midmonth');
    cy.get('[data-testid="factory"]').should('have.text', '0');
    cy.contains('.sd-picker-shortcuts button', 'Midmonth').click().trigger('mouseout');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'click:2026-11-15')
      .and('contain.text', 'leave:midmonth');
    cy.get('[data-testid="factory"]').should('have.text', '1');
    cy.get('.sd-picker-shortcuts button').last().should('have.text', '0');
    cy.get('.sd-picker-shortcuts button').first().click();
    cy.get('[data-testid="events"]').should('contain.text', 'now');
  });
  it('preserves extra and custom content and guards disabled confirmation', () => {
    cy.get('.sd-picker-footer-extra-wrapper').should('have.text', 'Extra footer');
    cy.get('.sd-picker-btn-confirm').should('be.disabled');
    cy.contains('button', 'Custom action').click();
    cy.get('.sd-picker-footer-now-wrapper a').click();
    cy.get('[data-testid="events"]')
      .should('contain.text', 'custom|today')
      .and('not.contain.text', 'confirm');
    cy.contains('button', 'Toggle confirm').click();
    cy.get('.sd-picker-btn-confirm').should('not.be.disabled').click();
    cy.get('[data-testid="events"]').should('contain.text', 'confirm');
  });
});

export {};
