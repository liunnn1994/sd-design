describe('React Cascader shared selection adapter', () => {
  it('selects enabled leaves and preserves update, change, form and close ordering', () => {
    cy.visit('/cascader-selection.html');
    cy.contains('button', /^Parent$/).click();
    cy.contains('button', /^Locked$/).click();
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.contains('button', /^One$/).click();
    cy.get('[data-testid="value"]').should('have.text', '"one"');
    cy.get('[data-testid="events"]').should('have.text', 'update|change|form|single');
  });
  it('retains controlled values until accepted and clears internal drafts on release', () => {
    cy.visit('/cascader-selection.html?controlled');
    cy.contains('button', /^Two$/).click();
    cy.get('[data-testid="value"]').should('have.text', '"one"');
    cy.contains('button', /^Accept$/).click();
    cy.contains('button', /^Two$/).click();
    cy.get('[data-testid="value"]').should('have.text', '"two"');
    cy.contains('button', /^Release$/).click();
    cy.get('[data-testid="value"]').should('have.text', '""');
    cy.contains('button', /^External$/).click();
    cy.get('[data-testid="keys"]').should('have.text', 'root-two');
  });
  it('combines consecutive multi selections in one event and deduplicates parent selection', () => {
    cy.visit('/cascader-selection.html?multiple');
    cy.contains('button', /^Both$/).click();
    cy.get('[data-testid="value"]').should('have.text', '["one","two"]');
    cy.contains('button', /^Parent$/).click();
    cy.get('[data-testid="value"]').should('have.text', '["one","two"]');
    cy.contains('button', 'Uncheck parent').click();
    cy.get('[data-testid="value"]').should('have.text', '[]');
  });
  it('preserves locked values on clear and removes unresolved tags', () => {
    cy.visit('/cascader-selection.html?multiple&locked');
    cy.contains('button', 'Remove missing').click();
    cy.get('[data-testid="value"]').should('have.text', '["locked"]');
    cy.contains('button', /^One$/).click();
    cy.contains('button', /^Clear$/).click();
    cy.get('[data-testid="value"]').should('have.text', '["locked"]');
  });
  it('blocks readonly select, remove and clear actions', () => {
    cy.visit('/cascader-selection.html?multiple&locked');
    cy.contains('button', /^Readonly$/).click();
    cy.contains('button', /^One$/).click();
    cy.contains('button', 'Remove missing').click();
    cy.contains('button', /^Clear$/).click();
    cy.get('[data-testid="value"]').should('have.text', '["locked","missing"]');
    cy.get('[data-testid="events"]').should('have.text', 'readonly|readonly|readonly');
  });
  it('stores full paths and permits strict parent selection', () => {
    cy.visit('/cascader-selection.html?path');
    cy.contains('button', /^One$/).click();
    cy.get('[data-testid="value"]').should('have.text', '["root","one"]');
    cy.contains('button', /^Strict$/).click();
    cy.contains('button', /^Parent$/).click();
    cy.get('[data-testid="value"]').should('have.text', '["root"]');
  });
  it('normalizes mode changes through the shared foundation and resets navigation on clear', () => {
    cy.visit('/cascader-selection.html');
    cy.contains('button', /^One$/).click();
    cy.contains('button', /^Multiple$/).click();
    cy.get('[data-testid="value"]').should('have.text', '["one"]');
    cy.contains('button', /^Path$/).click();
    cy.get('[data-testid="value"]').should('have.text', '[["root","one"]]');
    cy.contains('button', 'Reset events').click();
    cy.contains('button', /^Clear$/).click();
    cy.get('[data-testid="events"]').should(
      'have.text',
      'path-reset|active-reset|update|change|form',
    );
  });
});
