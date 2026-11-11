describe('React TreeSelect dropdown root', () => {
  it('opens the tree, selects a leaf and closes the popup', () => {
    cy.visit('/tree-select-root.html');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '"one"');
    cy.get('.sd-tree-select-popup').should('not.exist');
    cy.contains('button', 'Focus').click();
    cy.get('[role="combobox"]').should('be.focused');
  });
  it('searches mapped keys and renders an empty result', () => {
    cy.visit('/tree-select-root.html');
    cy.get('[role="combobox"]').type('one');
    cy.get('.sd-tree-select-popup [data-key="one"]').should('be.visible');
    cy.get('.sd-tree-select-popup [data-key="two"]').should('not.exist');
    cy.get('[role="combobox"]').clear().type('absent');
    cy.get('.sd-tree-select-popup').should('contain.text', 'No teams');
  });
  it('checks through node titles and keeps a multiple popup open', () => {
    cy.visit('/tree-select-root.html?check');
    cy.get('[role="combobox"]').click();
    cy.get('.sd-tree-select-popup [data-key="0"] .sd-tree-node-switcher-icon').click();
    cy.get('.sd-tree-select-popup [data-key="one"] .sd-tree-node-title').click();
    cy.get('output').should('have.text', '["one"]');
    cy.get('.sd-tree-select-popup').should('be.visible');
    cy.get('.sd-tree-select-popup [data-key="one"] input').should('be.checked');
  });
});
