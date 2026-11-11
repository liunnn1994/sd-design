describe('React Tree loading commit order', () => {
  it('rechecks new descendants after a loader updates data and immediately resolves', () => {
    cy.visit('/tree-loading.html');
    cy.get('.sd-tree-node-switcher-icon').click();
    cy.get('[data-key="child"]').should('be.visible');
    cy.get('[data-key="child"] input').should('be.checked');
    cy.get('output').should('have.text', 'expand|check:root,child');
  });
});
