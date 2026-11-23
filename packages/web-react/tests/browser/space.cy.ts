describe('React Space', () => {
  it('updates gaps, alignment, RTL and splits without replacing a focused child', () => {
    cy.visit('/layout-primitives.html?fixture=space');
    cy.get('[data-testid="space"]')
      .should('have.css', 'column-gap', '4px')
      .and('have.class', 'sd-space-align-center')
      .and('have.class', 'sd-space-wrap')
      .and('have.class', 'sd-space-fill');
    cy.get('.sd-space-item').should('have.length', 2);
    cy.get('.sd-space-item-split').should('have.length', 1).and('have.text', '|');
    cy.get('input[aria-label="Draft"]')
      .type('draft')
      .then(($input) => {
        cy.wrap($input).type('{enter}');
        cy.get('[data-testid="space"]')
          .should('have.class', 'sd-space-vertical')
          .and('have.class', 'sd-space-rtl')
          .and('not.have.class', 'sd-space-align-center')
          .and('have.css', 'row-gap', '24px');
        cy.get('[data-testid="space"]').should('have.css', 'column-gap', '0px');
        cy.focused().type('{enter}');
        cy.get('[data-testid="space"]')
          .should('have.class', 'sd-space-align-baseline')
          .and('have.css', 'column-gap', '6px');
        cy.focused()
          .should('have.value', 'draft')
          .and(($focused) => expect($focused[0]).to.equal($input[0]));
      });
  });
});
