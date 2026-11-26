{
  const drag = () => {
    cy.get('[data-testid="cell"]').then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      cy.wrap($el).trigger('pointerdown', {
        isPrimary: true,
        eventConstructor: 'PointerEvent',
        clientX: rect.left + 20,
        clientY: rect.top + 60,
        button: 0,
      });
      cy.document().trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: rect.left + 20,
        clientY: rect.top + 180,
      });
    });
  };
  describe('Calendar cell adapter', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=cell'));
    it('selects through the shared controller and refreshes disabled listeners', () => {
      cy.get('[data-testid="cell"]').click();
      cy.get('[data-testid="selected"]').should('have.text', '2026-11-08');
      cy.get('[data-testid="clicks"]').should('have.text', '1');
      cy.contains('button', 'Disable day').click();
      cy.get('[data-testid="cell"]').should('have.class', 'sd-calendar__cell--disabled').click();
      cy.get('[data-testid="clicks"]').should('have.text', '1');
      cy.contains('button', 'Disable day').click();
      cy.get('[data-testid="cell"]').click();
      cy.get('[data-testid="clicks"]').should('have.text', '2');
    });
    it('renders a live creation placeholder and creates the snapped range on release', () => {
      drag();
      cy.get('[data-testid="placeholder"]').should('exist');
      cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent' });
      cy.get('[data-testid="created"]').should('have.text', '11:00-13:00');
      cy.get('[data-testid="placeholder"]').should('not.exist');
    });
    it('preserves an approved proposal after its cell unmounts and reconnects in StrictMode', () => {
      cy.contains('button', 'Defer creation').click();
      drag();
      cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent' });
      cy.contains('Awaiting creation').should('exist');
      cy.contains('button', 'Mount cell').click();
      cy.contains('button', 'Accept creation').click();
      cy.get('[data-testid="created"]').should('have.text', '11:00-13:00');
      cy.contains('button', 'Mount cell').click();
      cy.contains('button', 'Defer creation').click();
      drag();
      cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent' });
      cy.get('[data-testid="created"]').should('have.text', '11:00-13:00|11:00-13:00');
    });
    it('clears a live gesture and its hold timer when the cell unmounts', () => {
      cy.clock();
      drag();
      cy.contains('button', 'Mount cell').then(($button) => $button[0].click());
      cy.get('[data-testid="cell"]').should('not.exist');
      cy.tick(1500);
      cy.document().trigger('pointermove', {
        eventConstructor: 'PointerEvent',
        clientX: 30,
        clientY: 250,
      });
      cy.document().trigger('pointerup', { eventConstructor: 'PointerEvent' });
      cy.get('[data-testid="holds"]').should('have.text', '0');
      cy.get('[data-testid="created"]').should('have.text', '');
    });
  });
}

export {};
