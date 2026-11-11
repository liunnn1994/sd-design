describe('React Tree Vue API defaults', () => {
  it('expands branches by default and applies the medium size class', () => {
    cy.visit('/tree-root.html?defaults');
    cy.get('[role="tree"]').should('have.class', 'sd-tree-size-medium');
    cy.get('[role="treeitem"]').should('have.length', 3);
    cy.get('[data-key="0"]').should('have.attr', 'aria-expanded', 'true');
  });
  it('applies mini row geometry and preserves an explicitly collapsed initial state', () => {
    cy.visit('/tree-root.html?mini');
    cy.get('[role="tree"]').should('have.class', 'sd-tree-size-mini');
    cy.get('[role="treeitem"]').should('have.length', 1);
    cy.get('.sd-tree-node-switcher').should('have.css', 'height', '24px');
  });
});
