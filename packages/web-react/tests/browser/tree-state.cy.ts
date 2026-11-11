describe('React Tree shared state operations', () => {
  it('preserves defaults, filters disabled nodes and reports raw selected nodes', () => {
    cy.visit('/tree-state.html?default');
    cy.get('[data-testid="expandedKeys"]').should('have.text', '[0]');
    cy.contains('button', 'Select two').click();
    cy.get('[data-testid="selectedKeys"]').should('have.text', '["one","two"]');
    cy.get('[data-testid="events"]').should(
      'have.text',
      'selected:one,two|select:one,two:two:one,two',
    );
  });
  it('uses fresh checked values for consecutive actions and applies public parent strategy', () => {
    cy.visit('/tree-state.html?parent');
    cy.contains('button', 'Check siblings').click();
    cy.get('[data-testid="checkedKeys"]').should('have.text', '["one","two",0]');
    cy.get('[data-testid="indeterminateKeys"]').should('have.text', '[]');
    cy.get('[data-testid="events"]').should(
      'have.text',
      'checked:one|half:0|check:one|checked:0|half:|check:0',
    );
  });
  it('keeps controlled state authoritative and clears local state when released', () => {
    cy.visit('/tree-state.html?controlled');
    cy.contains('button', 'Select two').click();
    cy.contains('button', 'Check siblings').click();
    cy.contains('button', 'Expand root').click();
    for (const name of ['selectedKeys', 'checkedKeys', 'expandedKeys'])
      cy.get(`[data-testid="${name}"]`).should('have.text', '[]');
    cy.contains('button', 'External two').click();
    cy.get('[data-testid="selectedKeys"]').should('have.text', '["two"]');
    cy.contains('button', 'Release').click();
    for (const name of ['selectedKeys', 'checkedKeys', 'expandedKeys'])
      cy.get(`[data-testid="${name}"]`).should('have.text', '[]');
  });
  it('limits selectAll to one node in single mode', () => {
    cy.visit('/tree-state.html?single');
    cy.contains('button', 'Select all').click();
    cy.get('[data-testid="selectedKeys"]').should('have.text', '[0]');
  });
  it('guards overlapping expansion until animation ends and preserves event order', () => {
    cy.visit('/tree-state.html?animate');
    cy.contains('button', 'Expand root').click();
    cy.contains('button', 'Collapse root').click();
    cy.get('[data-testid="expandedKeys"]').should('have.text', '[0]');
    cy.get('[data-testid="events"]').should('have.text', 'expand:0|expanded:0');
    cy.contains('button', 'End animation').click();
    cy.contains('button', 'Collapse root').click();
    cy.get('[data-testid="expandedKeys"]').should('have.text', '[]');
    cy.contains('button', 'Expand all').click();
    cy.get('[data-testid="expandingKeys"]').should('have.text', '[]');
  });
  it('deduplicates pending loading, expands on success and permits retry after rejection', () => {
    cy.visit('/tree-state.html');
    cy.contains('button', 'Load twice').click();
    cy.get('[data-testid="calls"]').should('have.text', '1');
    cy.get('[data-testid="loadingKeys"]').should('have.text', '["lazy"]');
    cy.contains('button', 'Reject').click();
    cy.get('[data-testid="loadingKeys"]').should('have.text', '[]');
    cy.get('[data-testid="events"]').should('have.text', 'error:offline');
    cy.contains('button', 'Load twice').click();
    cy.get('[data-testid="calls"]').should('have.text', '2');
    cy.contains('button', 'Resolve').click();
    cy.get('[data-testid="loadingKeys"]').should('have.text', '[]');
    cy.get('[data-testid="expandedKeys"]').should('have.text', '["lazy"]');
  });
});
