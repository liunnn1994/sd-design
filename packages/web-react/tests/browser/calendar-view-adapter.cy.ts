{
  describe('Calendar root adapter', () => {
    beforeEach(() => cy.visit('/calendar.html?fixture=adapter'));
    it('retains a live view API and filters events when navigating', () => {
      cy.get('[data-testid="events"]').should('have.text', 'Visible');
      cy.contains('button', 'Next').click();
      cy.get('[data-testid="events"]').should('have.text', '');
      cy.contains('button', 'Previous').click();
      cy.get('[data-testid="events"]').should('have.text', 'Visible');
      cy.contains('button', 'Month').click();
      cy.get('[data-testid="view"]').should('have.text', 'month');
      cy.get('.sd-calendar__body > .sd-calendar__cell').should('have.length', 42);
      cy.get('[data-testid="log"]').should('contain.text', 'view-change');
    });
    it('derives view-specific configuration from the current view', () => {
      cy.contains('button', 'Horizontal').click();
      cy.get('[data-testid="horizontal"]').should('have.text', 'true');
      cy.contains('button', 'Month').click();
      cy.get('[data-testid="horizontal"]').should('have.text', 'false');
      cy.contains('button', 'Week').click();
      cy.get('[data-testid="horizontal"]').should('have.text', 'true');
    });
    it('creates and deletes through the exposed view without mutating input events', () => {
      cy.get('[data-testid="input"]')
        .invoke('text')
        .then((before) => {
          cy.contains('button', 'Create', { matchCase: true }).click();
          cy.get('[data-testid="events"]').should('have.text', 'Visible|Created');
          cy.get('[data-testid="input"]').should('have.text', before);
          cy.contains('button', 'Delete created').click();
          cy.get('[data-testid="events"]').should('have.text', 'Visible');
          cy.get('[data-testid="input"]').should('have.text', before);
        });
    });
    it('uses updated configuration for scrolling and loads locale independently', () => {
      cy.get('[data-testid="locale"]').should('have.text', 'en');
      cy.contains('button', 'Scroll eleven').click();
      cy.get('[data-testid="scroll"]').should('have.text', '160');
      cy.contains('button', 'Start at ten').click();
      cy.contains('button', 'Scroll eleven').click();
      cy.get('[data-testid="scroll"]').should('have.text', '80');
      cy.contains('button', 'Scroll top').click();
      cy.get('[data-testid="scroll"]').should('have.text', '0');
      cy.contains('button', 'Locale').click();
      cy.get('[data-testid="locale"]').should('have.text', 'zh-cn');
    });
  });
}

export {};
