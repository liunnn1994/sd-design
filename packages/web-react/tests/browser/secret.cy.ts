describe('React Secret', () => {
  beforeEach(() => cy.visit('/copy-secret.html'));

  it('toggles Secret with native keyboard activation, copies hidden text and honors controlled refusal', () => {
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').resolves(),
    );
    cy.get('[data-testid="secret-default"]').should('not.contain.text', 'demo-sensitive-content');
    cy.get('[data-testid="secret-default"] .sd-copy').click();
    cy.get('@copyWrite').should('have.been.calledWith', 'demo-sensitive-content');
    cy.get('[data-testid="secret-default"] .sd-secret-trigger')
      .should('have.attr', 'aria-label', 'Show sensitive information')
      .focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[data-testid="secret-default"] .sd-secret-trigger')
      .should('have.attr', 'aria-pressed', 'true')
      .should('have.attr', 'aria-label', 'Hide sensitive information');
    cy.get('[data-testid="secret-default"]').should('contain.text', 'demo-sensitive-content');
    cy.get('[data-testid="secret-default"] .sd-secret-trigger').click();
    cy.get('[data-testid="secret-default"] .sd-secret-placeholder').should('exist');
    cy.get('[data-testid="secret-controlled"] .sd-copy').should('not.exist');
    cy.get('[data-testid="secret-controlled"] .sd-secret-trigger').click();
    cy.get('[data-testid="secret-controlled"] .sd-secret-placeholder').should(
      'have.text',
      'Hidden',
    );
    cy.get('[data-testid="copy-events"]').should('have.text', '["true"]');
    cy.contains('button', 'Control secret').click();
    cy.get('[data-testid="secret-controlled"]').should('contain.text', 'controlled-content');
  });
});
