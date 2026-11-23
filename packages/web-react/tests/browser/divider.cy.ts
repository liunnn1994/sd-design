describe('React Divider', () => {
  beforeEach(() => cy.visit('/layout-primitives.html?fixture=divider'));

  it('exposes orientation, updates text and applies the correct border and margins', () => {
    cy.get('[role="separator"]')
      .should('have.attr', 'aria-orientation', 'horizontal')
      .and('have.css', 'border-bottom-style', 'dashed');
    cy.get('[role="separator"]').should('have.css', 'margin-top', '12px');
    cy.get('.sd-divider-text').should('not.exist');
    cy.contains('button', 'Toggle label').click();
    cy.get('.sd-divider-text-right').should('have.text', 'Section label');
    cy.contains('button', 'Toggle direction').click();
    cy.get('[role="separator"]')
      .should('have.attr', 'aria-orientation', 'vertical')
      .and('have.css', 'border-left-style', 'dashed');
    cy.get('[role="separator"]').should('have.css', 'margin-left', '12px');
    cy.get('.sd-divider-text').should('not.exist');
    cy.contains('button', 'Toggle direction').click();
    cy.contains('button', 'Toggle label').click();
    cy.get('[role="separator"]').should('not.have.class', 'sd-divider-with-text');
  });

  it('honors zero border width and restores the default in both directions', () => {
    for (const property of ['border-bottom-width', 'border-left-width']) {
      for (const width of ['0px', '4px', '1px']) {
        cy.contains('button', 'Cycle size').click();
        cy.get('[role="separator"]').should('have.css', property, width);
      }
      cy.contains('button', 'Toggle direction').click();
    }
  });
});
