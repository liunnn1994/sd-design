describe('React Empty', () => {
  it('updates local content and images and restores the configured provider fallback', () => {
    cy.visit('/layout-primitives.html?fixture=empty');
    cy.get('.empty-example').should('have.text', 'Provider empty empty');
    cy.get('[data-testid="default-empty"] .sd-icon-empty').should('exist');
    cy.get('[data-testid="default-empty"] .sd-empty-description').should('not.be.empty');
    cy.contains('button', 'Toggle local description').click();
    cy.get('.empty-example').should('have.text', 'Local description');
    cy.contains('button', 'Toggle custom image').click();
    cy.get('.empty-example .sd-empty-description').should('have.text', 'Custom content');
    cy.get('.empty-example img').should('have.attr', 'alt', 'Local description');
    cy.get('.empty-example .sd-icon-empty').should('not.exist');
    cy.contains('button', 'Toggle local description').click();
    cy.get('.empty-example img').should('have.attr', 'alt', 'empty');
    cy.contains('button', 'Toggle custom image').click();
    cy.get('.empty-example').should('have.text', 'Provider empty empty');
  });
});
