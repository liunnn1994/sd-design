describe('React TreeSelect shared selection adapter', () => {
  it('preserves zero and emits single selection then Form change after rendering', () => {
    cy.visit('/tree-select-selection.html');
    cy.get('[data-testid="keys"]').should('have.text', '[0]');
    cy.contains('button', 'Select two').click();
    cy.get('[data-testid="events"]').should('have.text', 'value:"two"|change:"two"|form');
    cy.get('[data-testid="input"]').should('have.text', '');
    cy.get('[data-testid="visible"]').should('have.text', 'false');
  });
  it('keeps controlled values authoritative and clears released control', () => {
    cy.visit('/tree-select-selection.html?controlled');
    cy.contains('button', 'Select two').click();
    cy.get('[data-testid="keys"]').should('have.text', '[0]');
    cy.contains('button', 'External two').click();
    cy.get('[data-testid="keys"]').should('have.text', '["two"]');
    cy.contains('button', 'Release').click();
    cy.get('[data-testid="keys"]').should('have.text', '[]');
  });
  it('emits full path label values and removes a numeric tag in multiple mode', () => {
    cy.visit('/tree-select-selection.html?multiple&label&path');
    cy.contains('button', 'Select both').click();
    cy.get('[data-testid="values"]').should(
      'have.text',
      '[{"value":0,"label":"Root / Zero"},{"value":"two","label":"Root / Two"}]',
    );
    cy.get('[data-testid="visible"]').should('have.text', 'true');
    cy.contains('button', 'Remove zero').click();
    cy.get('[data-testid="keys"]').should('have.text', '["two"]');
  });
  it('retains fallback labels and guards disabled or readonly actions', () => {
    cy.visit('/tree-select-selection.html?fallback');
    cy.get('[data-testid="values"]').should('have.text', '[{"value":"missing","label":"Saved"}]');
    cy.contains('button', 'Disabled').click();
    cy.contains('button', 'Clear').click();
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.visit('/tree-select-selection.html?readonly');
    cy.contains('button', 'Select two').click();
    cy.get('[data-testid="keys"]').should('have.text', '[0]');
  });
});
