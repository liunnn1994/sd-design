{
  describe('Calendar cell view', () => {
    beforeEach(() => {
      cy.clock(new Date(2026, 10, 8, 11, 30).getTime(), ['Date']);
      cy.visit('/calendar.html?fixture=cell-view');
    });
    it('renders overlapping events, counts, special hours and the current time line', () => {
      cy.get('.sd-calendar__event').should('have.length', 2);
      cy.get('.sd-calendar__event')
        .eq(0)
        .should(($el) => expect($el[0].style.width).to.equal('50%'));
      cy.get('.sd-calendar__event')
        .eq(1)
        .should(($el) => expect($el[0].style.left).to.equal('50%'));
      cy.get('.sd-calendar__cell-events-count').should('not.exist');
      cy.get('.sd-calendar__special-hours').should('have.text', 'Default hours');
      cy.get('.sd-calendar__now-line').should('have.text', '11:30');
      cy.contains('button', 'Month view').click();
      cy.get('.sd-calendar__cell-events-count').should('have.text', '2');
      cy.get('.sd-calendar__event').should('not.exist');
    });
    it('groups events by numeric schedule and applies schedule-specific hours or defaults', () => {
      cy.contains('button', 'Schedules').click();
      cy.get('[data-schedule="0"] .sd-calendar__event-title').should('have.text', 'First');
      cy.get('[data-schedule="1"] .sd-calendar__event-title').should('have.text', 'Second');
      cy.get('[data-schedule="0"] .sd-calendar__special-hours').should('have.text', 'Zero hours');
      cy.get('[data-schedule="1"] .sd-calendar__special-hours').should(
        'have.text',
        'Default hours',
      );
      cy.contains('button', 'Custom cell content').click();
      cy.get('[data-schedule="0"] .sd-calendar__cell-date').should('have.text', '8|0|1');
      cy.get('[data-schedule="1"] .sd-calendar__cell-events').should('have.text', 'Events Second');
      cy.get('[data-schedule="0"] .sd-calendar__special-hours').should('have.text', '0:Zero hours');
      cy.get('.sd-calendar__event').should('not.exist');
    });
    it('supports a full cell override while retaining special hours, counts and now line', () => {
      cy.contains('button', 'Override cell').click();
      cy.contains('Entire cell 2').should('exist');
      cy.get('.sd-calendar__event').should('not.exist');
      cy.get('.sd-calendar__special-hours').should('have.text', 'Default hours');
      cy.get('.sd-calendar__cell-events-count').should('not.exist');
      cy.get('.sd-calendar__now-line').should('exist');
      cy.contains('button', 'Override cell').click();
      cy.get('.sd-calendar__event').should('have.length', 2);
    });
    it('retains an inert leaving event at its old geometry and finalizes local deletion on cell unmount', () => {
      cy.document().then((doc) => {
        const style = doc.createElement('style');
        style.textContent =
          '.sd-calendar-event-delete-leave-active { transition-duration: 1s !important; }';
        doc.head.appendChild(style);
      });
      cy.contains('button', 'Visual deletion').click();
      cy.get('.sd-calendar-event-delete-leave-active').should(($el) => {
        expect($el[0].hasAttribute('inert')).to.equal(true);
        expect($el[0].style.width).to.equal('50%');
      });
      cy.get('.sd-calendar__event').should('have.length', 1);
      cy.get('.sd-calendar__event-title').should('have.text', 'Second');
      cy.get('[data-testid="source-count"]').should('have.text', '2');
      cy.contains('button', 'Mount cell').click();
      cy.get('[data-testid="source-count"]').should('have.text', '1');
      cy.contains('button', 'Mount cell').click();
      cy.get('.sd-calendar__event-title').should('have.text', 'Second');
    });
    it('removes the event container after the final source deletion finishes animating', () => {
      cy.contains('button', 'Final deletion').click();
      cy.get('.sd-calendar__event').should('have.length', 1);
      cy.contains('button', 'Final deletion').click();
      cy.get('[data-testid="source-count"]').should('have.text', '0');
      cy.get('.sd-calendar__cell-events').should('not.exist');
    });
  });
}

export {};
