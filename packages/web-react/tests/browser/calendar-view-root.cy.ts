describe('Calendar root view', () => {
  beforeEach(() => cy.visit('/calendar-root.html'));
  it('forwards cell listeners and date selection callbacks', () => {
    cy.get('.sd-calendar__weekday').first().click();
    cy.get('[data-testid="selected"]').should('not.have.text', '');
    cy.contains('button', 'Whole cell').click();
    cy.get('[data-testid="whole-cell"]').should('have.length', 7).first().click();
    cy.get('[data-testid="clicks"]').should('have.text', '1');
    cy.get('[data-testid="callback-payload"]').should('have.text', 'week:2:true');
    cy.get('[data-testid="hidden-count"]').should('not.exist');
    cy.get('.sd-calendar__event').should('not.exist');
  });
  it('forwards normalized event details with the native event', () => {
    cy.contains('button', 'Scroll ten').click();
    cy.get('.sd-calendar__event').click();
    cy.get('[data-testid="callback-payload"]').should('have.text', 'click:Meeting:60');
    cy.get('[data-testid="clicks"]').should('have.text', '0');
  });
  it('mounts the complete layout and emits ready once in StrictMode', () => {
    cy.get('[data-testid="ready"]').should('have.text', '1');
    cy.get('#calendar-root')
      .should('have.class', 'sd-calendar--ready')
      .and('have.class', 'custom-root')
      .and('have.attr', 'aria-label', 'Appointments');
    cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 7);
    cy.get('.sd-calendar__time-cell').should('have.length', 24);
    cy.get('.sd-calendar__event-title').should('have.text', 'Meeting');
    cy.get('#calendar-root').should(($root) => {
      expect($root[0].getBoundingClientRect().height).to.equal(400);
      expect($root.find('.sd-calendar__body')[0].getBoundingClientRect().width).to.be.greaterThan(
        500,
      );
    });
  });
  it('scrolls the actual viewport before and after a leaving panel is removed', () => {
    const viewport =
      '.sd-calendar__scrollable-wrap > div:not([inert]) [data-overlayscrollbars-viewport]';
    cy.contains('button', 'Scroll ten').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.be.greaterThan(300));
    cy.contains('button', 'API next').click();
    cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
    cy.contains('button', 'Scroll ten').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.be.greaterThan(300));
    cy.contains('button', 'Scroll top').click();
    cy.get(viewport).should(($el) => expect($el[0].scrollTop).to.equal(0));
  });
  it('navigates and exposes custom title, events and week numbers', () => {
    cy.contains('button', 'Custom').click();
    cy.get('[data-testid="title"]').should('have.text', 'week:1');
    cy.get('[data-testid="event"]').should('have.text', 'Meeting');
    cy.get('.sd-calendar__view-button').contains('Month').click();
    cy.get('[data-testid="view"]').should('have.text', 'month');
    cy.get('.sd-calendar__scrollable-wrap > [inert]').should('not.exist');
    cy.get('[data-testid="week-number"]').should('have.length', 6);
    cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 42);
    cy.get('.sd-calendar__time-column').should('not.exist');
  });
  it('supports DIY rendering and reconnects cleanly after unmount', () => {
    cy.contains('button', 'DIY').click();
    cy.get('.sd-calendar__header').should('not.exist');
    cy.get('[data-testid="diy"]').should('have.text', 'week').click().should('have.text', 'day');
    cy.contains('button', 'Mount').click();
    cy.get('#calendar-root').should('not.exist');
    cy.contains('button', 'Mount').click();
    cy.get('[data-testid="ready"]').should('have.text', '2');
    cy.get('[data-testid="diy"]').should('have.text', 'week');
    cy.contains('button', 'DIY').click();
    cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 7);
  });
});

describe('Calendar large event index', () => {
  it('refreshes rendered events above the index threshold and keeps the all-day end exclusive', () => {
    cy.visit('/calendar-root.html?index');
    const panel = '.sd-calendar__scrollable-wrap > div:not([inert])';
    const titles = `${panel} .sd-calendar__body .sd-calendar__event-title`;
    const allDayTitles = `${panel} .sd-calendar__all-day .sd-calendar__event-title`;
    cy.get(titles).should('have.text', 'Timed spanning');
    cy.get(allDayTitles).should('have.text', 'All-day spanning');
    cy.contains('button', 'Add event at the index threshold').click();
    cy.get(titles).should(($titles) => {
      expect($titles.toArray().map((title) => title.textContent)).to.have.members([
        'Timed spanning',
        'New appointment',
      ]);
    });
    cy.get(allDayTitles).should('have.text', 'All-day spanning');
    cy.contains('button', 'Next day').click();
    cy.get(allDayTitles).should('not.exist');
    cy.get(titles).should('have.text', 'Timed spanning');
  });
});

export {};
