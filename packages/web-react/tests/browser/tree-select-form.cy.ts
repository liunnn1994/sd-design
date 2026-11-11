describe('React TreeSelect Form and provider integration', () => {
  it('validates blur and clears the error when a real tree selection updates the form', () => {
    cy.visit('/tree-select-form.html');
    cy.contains('button', 'Focus').click();
    cy.get('[role="combobox"]').should('be.focused');
    cy.contains('button', 'Blur').click();
    cy.contains('Choose team').should('be.visible');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '{"choice":"one"}');
    cy.contains('Choose team').should('not.exist');
  });
  it('inherits disabled state and global virtual configuration with tree ARIA', () => {
    cy.visit('/tree-select-form.html');
    cy.get('[role="combobox"]')
      .should('have.attr', 'aria-haspopup', 'tree')
      .and('have.attr', 'aria-autocomplete', 'list')
      .click();
    cy.get('.sd-tree-select-tree-wrapper-virtual').should('exist');
    cy.contains('button', 'Disable').click();
    cy.get('[role="combobox"]').should('be.disabled');
    cy.contains('button', 'Focus').click();
    cy.get('[role="combobox"]').should('not.be.focused');
  });
  it('clears search on blur through the shared selection behavior', () => {
    cy.visit('/tree-select-form.html');
    cy.get('[role="combobox"]').type('one');
    cy.contains('button', 'Blur').click();
    cy.get('[role="combobox"]').should('have.value', '');
  });
});
