describe('React Tree expand transitions', () => {
  it('animates descendant height and restores ordinary rows after expanding and collapsing', () => {
    cy.visit('/tree-root.html');
    cy.get('[data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-node-list').should('exist').and('have.css', 'overflow', 'hidden');
    cy.get('[data-key="one"]').should('be.visible');
    cy.get('.sd-tree-node-list').should('not.exist');
    cy.get('[role="treeitem"]').should('have.length', 3);
    cy.get('[data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-node-list').should('exist');
    cy.get('.sd-tree-node-list').should('not.exist');
    cy.get('[role="treeitem"]').should('have.length', 1);
    cy.get('[data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('[data-key="two"]').should('be.visible');
    cy.get('.sd-tree-node-list').should('not.exist');
  });
  it('supports animation=false without retaining a temporary descendant list', () => {
    cy.visit('/tree-root.html?noanimation');
    cy.get('[data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('[role="treeitem"]').should('have.length', 3);
    cy.get('.sd-tree-node-list').should('not.exist');
    cy.get('[data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('[role="treeitem"]').should('have.length', 1);
  });

  it('collapses an animated branch with filtered descendants and expands fresh rows when revealed', () => {
    cy.visit('/tree-root.html?filter');
    const parent = () => cy.get('[role="treeitem"][data-key="0"]');
    const toggle = () => parent().find('.sd-tree-node-switcher-icon').click();
    toggle();
    parent().should('have.attr', 'aria-expanded', 'true');
    cy.get('[role="treeitem"]').should('have.length', 1);
    toggle();
    parent().should('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-tree-node-list').should('not.exist');
    cy.contains('button', 'Reveal descendants').click();
    cy.get('[role="treeitem"]').should('have.length', 1);
    toggle();
    cy.get('[role="treeitem"][data-key="one"]').should('be.visible');
    cy.get('[role="treeitem"][data-key="two"]').should('be.visible');
    cy.get('.sd-tree-node-list').should('not.exist');
  });
});
