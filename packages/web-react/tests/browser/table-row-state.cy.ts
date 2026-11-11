describe('React Table row adapters', () => {
  it('preserves off-page and disabled keys while selecting enabled rows and leafs', () => {
    cy.visit('/table-row-state.html');
    cy.get('[data-testid="current"]').should('have.text', '[2]');
    cy.contains('button', 'Select enabled').click();
    cy.get('[data-testid="selected"]').should('have.text', '["off-page",2,1]');
    cy.get('[data-testid="events"]').should('have.text', 'all:true,selection,selectedKeys');
    cy.contains('button', 'Deselect enabled').click();
    cy.get('[data-testid="selected"]').should('have.text', '["off-page",2]');
    cy.contains('button', 'Select leafs').click();
    cy.get('[data-testid="selected"]').should('have.text', '["off-page",2,1]');
    cy.get('[data-testid="events"]').should(
      'contain',
      'select:parent:Parent,selection,selectedKeys',
    );
  });
  it('honors top-level controlled empty arrays over nested options and retains local edits', () => {
    cy.visit('/table-row-state.html?controlled');
    cy.contains('button', 'Select one').click();
    cy.contains('button', 'Expand parent').click();
    cy.get('[data-testid="selected"]').should('have.text', '[]');
    cy.get('[data-testid="expanded"]').should('have.text', '[]');
    cy.get('[data-testid="events"]').should(
      'have.text',
      'select:1:One,selection,selectedKeys,expand:parent:Parent,expanded,expandedKeys',
    );
    cy.contains('button', 'Toggle controlled').click();
    cy.get('[data-testid="selected"]').should('have.text', '[1]');
    cy.get('[data-testid="expanded"]').should('have.text', '["parent"]');
  });
  it('updates synchronous batched operations and supports radio selection and clearing', () => {
    cy.visit('/table-row-state.html');
    cy.contains('button', 'Clear selection').click();
    cy.contains('button', 'Select batch').click();
    cy.get('[data-testid="selected"]').should('have.text', '[1,"parent"]');
    cy.contains('button', 'Radio').click();
    cy.contains('button', 'Select one').click();
    cy.get('[data-testid="selected"]').should('have.text', '[1]');
    cy.contains('button', 'Clear selection').click();
    cy.get('[data-testid="selected"]').should('have.text', '[]');
    cy.contains('button', 'Expand batch').click();
    cy.get('[data-testid="expanded"]').should('have.text', '[1,2]');
  });
  it('initializes expand-all once and reads current rows for later expand-all operations', () => {
    cy.visit('/table-row-state.html?all');
    cy.get('[data-testid="expanded"]').should('have.text', '["parent",1,2]');
    cy.contains('button', 'Change rows').click();
    cy.get('[data-testid="expanded"]').should('have.text', '["parent",1,2]');
    cy.contains('button', 'Collapse all').click();
    cy.get('[data-testid="expanded"]').should('have.text', '[]');
    cy.contains('button', 'Expand all').click();
    cy.get('[data-testid="expanded"]').should('have.text', '[1,3]');
  });
});
