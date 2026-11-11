describe('React TreeSelect Vue aliases and capabilities', () => {
  it('uses checkable/filterable aliases with real search and linked selection', () => {
    cy.visit('/tree-select-root.html?aliases');
    cy.get('[role="combobox"]').type('one');
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '["one"]');
    cy.get('.sd-tree-select-popup').should('be.visible');
  });
  it('expands leaf-only parents without selecting them', () => {
    cy.visit('/tree-select-root.html?leaf');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '');
    cy.get('.sd-tree-select-popup [data-key="one"]').should('be.visible');
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '"one"');
  });
  for (const disabled of [false, true])
    it(`resolves virtualScroll=${!disabled}`, () => {
      cy.visit(`/tree-select-root.html?virtual${disabled ? '&novirtual' : ''}`);
      cy.get('[role="combobox"]').click();
      cy.get('.sd-tree-select-tree-wrapper-virtual').should(disabled ? 'not.exist' : 'exist');
    });
});
