{
  const moveToMiddle = () =>
    cy.get('.sd-calendar__body').then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      cy.wrap($el).trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      });
    });
  describe('Calendar body', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=body'));
    it('renders shared grid dimensions and filters all-day events from the timed cells', () => {
      cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 7);
      cy.get('.sd-calendar__body').should(($el) => {
        expect($el[0].style.getPropertyValue('--sd-calendar-grid-columns')).to.equal('7');
        expect($el[0].style.getPropertyValue('--sd-calendar-grid-rows')).to.equal('1');
      });
      cy.get('.sd-calendar__event-title').should('have.text', 'Meeting');
      cy.contains('Holiday').should('not.exist');
      cy.contains('button', 'Hide weekends').click();
      cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 5);
      cy.contains('button', 'Day view').click();
      cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 1);
      cy.contains('button', 'Custom cells').click();
      cy.get('.sd-calendar__cell').should('contain.text', 'Cell 3 events 1');
      cy.get('.sd-calendar__event').should('not.exist');
    });
    it('shows cursor time, keeps its label during exit and removes it when disabled', () => {
      moveToMiddle();
      cy.get('.sd-calendar__time-at-cursor').should('have.text', '11:30');
      cy.get('.sd-calendar__body').trigger('pointerleave', { eventConstructor: 'PointerEvent' });
      cy.get('.sd-calendar-shrink-leave-active').should('have.text', '11:30');
      cy.get('.sd-calendar__time-at-cursor').should('not.exist');
      moveToMiddle();
      cy.contains('button', 'Cursor label').click();
      cy.get('.sd-calendar__time-at-cursor').should('not.exist');
      moveToMiddle();
      cy.get('.sd-calendar__time-at-cursor').should('not.exist');
    });
    it('uses the horizontal cursor axis and suppresses labels in month and year views', () => {
      cy.contains('button', 'Orientation').click();
      moveToMiddle();
      cy.get('.sd-calendar__time-at-cursor')
        .should('have.text', '11:30')
        .and(($el) => expect($el[0].style.left).to.equal('50%'));
      cy.contains('button', 'Month view').click();
      cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 42);
      moveToMiddle();
      cy.get('.sd-calendar__time-at-cursor').should('not.exist');
      cy.contains('button', 'Year view').click();
      cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 12);
    });
    it('routes touch cursor updates and releases their label at touchend', () => {
      cy.get('.sd-calendar__body').then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        cy.wrap($el).trigger('touchmove', {
          touches: [{ clientX: rect.left + 20, clientY: rect.top + rect.height / 2 }],
        });
      });
      cy.get('.sd-calendar__time-at-cursor').should('have.text', '11:30');
      cy.get('.sd-calendar__body').trigger('touchend');
      cy.get('.sd-calendar__time-at-cursor').should('not.exist');
      cy.contains('button', 'Mount body').click();
      cy.get('.sd-calendar__body').should('not.exist');
      cy.contains('button', 'Mount body').click();
      moveToMiddle();
      cy.get('.sd-calendar__time-at-cursor').should('have.text', '11:30');
    });
    it('updates the resize target using the cell under the pointer and commits its date', () => {
      cy.get('.sd-calendar__event-resizer').then(($el) => {
        const rect = $el[0].getBoundingClientRect();
        cy.wrap($el).trigger('pointerdown', {
          isPrimary: true,
          eventConstructor: 'PointerEvent',
          clientX: rect.left + 15,
          clientY: rect.top + 3,
          button: 0,
        });
      });
      cy.get('.sd-calendar__body > .sd-calendar__cell')
        .eq(2)
        .then(($el) => {
          const rect = $el[0].getBoundingClientRect();
          const clientX = rect.left + rect.width / 2,
            clientY = rect.top + rect.height / 2;
          cy.get('.sd-calendar__body').trigger('pointermove', {
            eventConstructor: 'PointerEvent',
            clientX,
            clientY,
          });
          cy.get('[data-testid="resize-cell"]').should(
            'have.text',
            String(new Date(2026, 10, 4).getTime()),
          );
          cy.document().trigger('pointerup', {
            eventConstructor: 'PointerEvent',
            clientX,
            clientY,
          });
        });
      cy.get('[data-testid="timed-end"]').should('have.text', '2026-11-04|11:30');
    });
  });
}

export {};
