describe('React TreeSelect Tree panel', () => {
  it('selects raw numeric keys through a real tree title', () => {
    cy.visit('/tree-select-panel.html');
    cy.get('[data-key="0"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '[0]');
    cy.get('[data-key="0"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-key="locked"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '[0]');
  });
  it('toggles linked checks from both titles and checkbox labels', () => {
    cy.visit('/tree-select-panel.html?check');
    cy.get('[data-key="one"] .sd-tree-node-title').click();
    cy.get('[data-key="one"] input').should('be.checked');
    cy.get('output').should('have.text', '["one",0]');
    cy.get('[data-key="one"] label').click();
    cy.get('output').should('have.text', '[]');
  });
  it('respects controlled rejection and uses virtual wrapper layout', () => {
    cy.visit('/tree-select-panel.html?check&controlled&virtual');
    cy.get('.sd-tree-select-tree-wrapper-virtual').should('exist');
    cy.get('[data-key="one"] .sd-tree-node-title').click();
    cy.get('[data-key="one"] input').should('not.be.checked');
    cy.get('output').should('have.text', '[]');
  });
});
