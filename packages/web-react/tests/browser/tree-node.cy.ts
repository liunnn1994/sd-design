describe('React Tree node view', () => {
  it('prioritizes per-node icons over tree renderers and preserves draggable metadata', () => {
    cy.visit('/tree-node.html?local&custom');
    cy.get('[data-key="0"]').should('have.attr', 'data-tree-draggable', 'true');
    cy.get('.sd-tree-node-custom-icon').should('have.text', 'Local icon');
    cy.get('.sd-tree-node-switcher-icon').should('have.text', 'Local switcher');
    cy.get('.sd-tree-node-drag-icon').should('have.text', 'Local drag');
    cy.contains('button', 'Toggle loading').click();
    cy.get('.sd-tree-node-switcher').should('have.text', 'Local loading');
  });
  it('expands with the shared switcher and renders typed keys, indentation and ARIA', () => {
    cy.visit('/tree-node.html');
    cy.get('[role="treeitem"]')
      .should('have.length', 1)
      .and('have.attr', 'data-key-type', 'number')
      .and('have.attr', 'tabindex', '0')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-tree-node-switcher-icon').click();
    cy.get('[role="treeitem"]').should('have.length', 4);
    cy.get('[data-key="one"]')
      .should('have.attr', 'aria-level', '2')
      .and('not.have.attr', 'aria-expanded');
    cy.get('[data-key="one"] .sd-tree-node-indent-block').should('have.length', 1);
    cy.get('[data-key="one"] .sd-tree-node-title').should('have.class', 'sd-tree-node-title-block');
  });
  it('selects titles independently from checkboxes and respects disabled flags', () => {
    cy.visit('/tree-node.html?open');
    cy.get('[data-key="one"] .sd-tree-node-title').click();
    cy.get('[data-key="one"]')
      .should('have.attr', 'aria-selected', 'true')
      .and('have.class', 'sd-tree-node-selected');
    cy.get('[data-key="one"] label').click();
    cy.get('[data-testid="checked"]').should('have.text', '["one",0]');
    cy.get('[data-key="0"] input').should('be.checked').and('have.prop', 'indeterminate', false);
    cy.get('[data-key="locked"] .sd-tree-node-title').click();
    cy.get('[data-testid="selected"]').should('have.text', '["one"]');
    cy.get('[data-key="locked"] input, [data-key="no-check"] input').should('be.disabled');
  });
  it('forwards native node events and expands titles only when configured', () => {
    cy.visit('/tree-node.html?action');
    cy.get('[data-key="0"] .sd-tree-node-title').click().rightclick();
    cy.get('[data-key="0"]').focus().trigger('keydown', { key: 'ArrowDown' });
    cy.get('[role="treeitem"]').should('have.length', 4);
    cy.get('[data-testid="events"]').should(
      'have.text',
      'click:0:true|contextmenu:0:true|keydown:0:true|key:0:ArrowDown',
    );
  });
  it('renders custom title status, icons and extras while leaving plain leaf switchers empty', () => {
    cy.visit('/tree-node.html?custom&open');
    cy.get('[data-testid="switcher"]').should('have.length', 1);
    cy.get('[data-testid="icon"]').should('have.length', 4);
    cy.get('[data-key="one"] b').click().should('have.text', 'First leaf:true');
    cy.get('[data-key="one"] small').should('have.text', 'Extra:one');
    cy.contains('button', 'Toggle loading').click();
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="switcher"]').should('not.exist');
    cy.contains('button', 'Toggle switcher').click();
    cy.get('.sd-tree-node-switcher').should('not.exist');
  });
  it('renders line connectors, expansion markers and leaf file icons', () => {
    cy.visit('/tree-node.html?line');
    cy.get('.sd-tree-node-plus-icon').click();
    cy.get('.sd-tree-node-minus-icon').should('be.visible');
    cy.get('[data-key="one"] .sd-tree-node-switcher-icon svg').should('exist');
    cy.get('[data-key="no-check"]').should('have.class', 'sd-tree-node-is-tail');
  });
  it('uses shared ellipsis when no custom title is supplied', () => {
    cy.visit('/tree-node.html?ellipsis');
    cy.get('.sd-tree-node-title').should('have.class', 'sd-tree-node-title-with-ellipsis');
    cy.get('.sd-tree-node-title-ellipsis').should('contain.text', 'Root');
    cy.visit('/tree-node.html?ellipsis&custom');
    cy.get('.sd-tree-node-title-ellipsis').should('not.exist');
    cy.get('.sd-tree-node-title b').should('have.text', 'Root:false');
  });
});
