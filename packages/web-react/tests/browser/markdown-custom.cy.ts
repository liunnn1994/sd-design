describe('React Markdown custom node recursive children', () => {
  it('inherits custom tag registration through multiple levels of parsed content', () => {
    cy.visit('/markdown-custom.html');
    cy.get('.fixture-card[data-flavor="recursive"] .fixture-card[data-flavor="deep"]')
      .should('have.attr', 'data-dark', 'true')
      .find('strong')
      .should('have.text', 'Deep child');
    cy.contains('button', 'Change config').click();
    cy.get('.fixture-card[data-flavor="deep"]').should('have.attr', 'data-dark', 'false');
  });
  it('prefers supplied AST children and sanitizes attributes on the custom component', () => {
    cy.visit('/markdown-custom.html');
    cy.get('.fixture-card[data-flavor="AST"]')
      .should('have.attr', 'data-dark', 'true')
      .and('have.attr', 'data-unsafe', 'false')
      .within(() => {
        cy.get('h2.sd-typography').should('have.text', 'AST child');
        cy.contains('Ignored content').should('not.exist');
      });
  });
  it('parses content children with inherited options and updates them with parent configuration', () => {
    cy.visit('/markdown-custom.html');
    cy.get('.fixture-card[data-flavor="parsed"]').within(() => {
      cy.get('h2.sd-typography').should('have.text', 'Parsed child');
      cy.contains('<div>Escaped</div>').should('exist');
      cy.get('.node-slot, .markdown-renderer').should('not.exist');
    });
    cy.contains('button', 'Change config').click();
    cy.get('.fixture-card[data-flavor="parsed"]')
      .should('have.attr', 'data-dark', 'false')
      .within(() => {
        cy.get('h2').should('not.exist');
        cy.contains('## Parsed child').should('exist');
      });
    cy.get('.fixture-card[data-flavor="AST"] h2').should('have.text', 'AST child');
  });
});
