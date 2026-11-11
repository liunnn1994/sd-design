describe('React Tree shared checked state', () => {
  it('initializes linked defaults and preserves local state across ordinary rerenders', () => {
    cy.visit('/tree-checked.html');
    cy.get('[data-testid="checked"]').should('have.text', '["one"]');
    cy.get('[data-testid="half"]').should('have.text', '["root"]');
    cy.contains('button', 'Local two').click();
    cy.contains('button', 'Rerender').click();
    cy.get('[data-testid="checked"]').should('have.text', '["two"]');
    cy.get('[data-testid="half"]').should('have.text', '["root"]');
  });
  it('derives controlled values and resets after releasing control', () => {
    cy.visit('/tree-checked.html?controlled');
    cy.contains('button', 'Local two').click();
    cy.get('[data-testid="checked"]').should('have.text', '["one"]');
    cy.contains('button', 'External two').click();
    cy.get('[data-testid="checked"]').should('have.text', '["two"]');
    cy.contains('button', 'External empty').click();
    cy.get('[data-testid="checked"]').should('have.text', '[]');
    cy.contains('button', 'Release').click();
    cy.get('[data-testid="checked"]').should('have.text', '[]');
    cy.contains('button', 'Local two').click();
    cy.get('[data-testid="checked"]').should('have.text', '["two"]');
  });
  it('expands parent defaults and reinitializes using the latest indexed children', () => {
    cy.visit('/tree-checked.html?parent');
    cy.get('[data-testid="checked"]').should('have.text', '["root","one","two"]');
    cy.contains('button', 'Extend').click();
    cy.contains('button', 'Reinitialize parent').click();
    cy.get('[data-testid="checked"]').should('have.text', '["root","one","two","three"]');
    cy.get('[data-testid="half"]').should('have.text', '[]');
  });
  it('recomputes controlled parent selection for data and mode changes', () => {
    cy.visit('/tree-checked.html?controlled');
    cy.contains('button', 'Control parent').click();
    cy.contains('button', 'Extend').click();
    cy.get('[data-testid="checked"]').should('have.text', '["root","one","two","three"]');
    cy.contains('button', 'Only leaf').click();
    cy.get('[data-testid="checked"]').should('have.text', '[]');
    cy.contains('button', /^Strict$/).click();
    cy.get('[data-testid="checked"]').should('have.text', '["root"]');
  });
  it('honors external half-checked keys only in strict mode', () => {
    cy.visit('/tree-checked.html?half');
    cy.get('[data-testid="half"]').should('have.text', '["root"]');
    cy.contains('button', /^Strict$/).click();
    cy.get('[data-testid="half"]').should('have.text', '["external-half"]');
    cy.contains('button', 'Update half').click();
    cy.get('[data-testid="half"]').should('have.text', '["updated-half"]');
  });
});
