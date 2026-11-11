describe('React Cascader public entries and standalone styles', () => {
  it('shares default/named/compound identities and supplies theme and dropdown styles', () => {
    cy.visit('/cascader-entry.html');
    cy.get('[data-testid="identity"]').should('have.text', 'true');
    cy.get('.sd-cascader').should('have.css', 'width', '250px');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-cascader-dropdown-panel')
      .should('be.visible')
      .and('have.css', 'display', 'inline-flex');
    cy.get('.sd-cascader-dropdown-panel').then(($panel) => {
      expect(
        $panel[0].ownerDocument.defaultView!.getComputedStyle($panel[0]).backgroundColor,
      ).not.to.equal('rgba(0, 0, 0, 0)');
    });
    cy.get('.sd-cascader-dropdown-panel button[title="Root"]').click();
    cy.get('.sd-cascader-dropdown-panel button[title="Leaf"]').click();
    cy.get('[data-testid="value"]').should('have.text', '"leaf"');
  });
  it('renders the compound standalone panel with working columns', () => {
    cy.visit('/cascader-entry.html');
    cy.get('[data-testid="standalone"] button[title="Root"]').click();
    cy.get('[data-testid="standalone"] .sd-cascader-panel-column').should('have.length', 2);
    cy.get('[data-testid="standalone"] button[title="Leaf"]').click();
    cy.get('[data-testid="value"]').should('have.text', '"leaf"');
  });
});
