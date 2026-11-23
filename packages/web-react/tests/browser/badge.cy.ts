describe('React badge', () => {
  beforeEach(() => cy.visit('/number-flow.html'));

  it('updates badge counts and dots while preserving the status indicator', () => {
    cy.get('[data-testid="count-badge"] .sd-badge-status-success').should('exist');
    cy.get('[data-testid="count-badge"] [role="img"]').should('have.attr', 'aria-label', '9');
    cy.contains('button', '增加数值').click();
    cy.contains('button', '增加数值').click();
    cy.get('[data-testid="count-badge"] [role="img"]').should('have.attr', 'aria-label', '10+');
    cy.get('[data-testid="dot-badge"] [role="status"]').should('have.attr', 'aria-label', '11');
  });
});
