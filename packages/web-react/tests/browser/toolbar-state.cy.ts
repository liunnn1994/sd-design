describe('React Toolbar state adapter', () => {
  it('restores initial values, preserves skipped fields and drops added keys', () => {
    cy.visit('/toolbar-state.html');
    cy.contains('button', 'Edit').click();
    cy.contains('button', 'Reset').click();
    cy.get('[data-testid="value"]').should(
      'have.text',
      '{"term":"initial","nested":{"count":1},"keep":"retained"}',
    );
    cy.get('[data-testid="events"]').should('have.text', 'value|value|clear|reset');
    cy.contains('button', 'Edit').click();
    cy.contains('button', 'Silent reset').click();
    cy.get('[data-testid="value"]').should('contain.text', '"count":1');
    cy.get('[data-testid="events"]').should(
      'have.text',
      'value|value|clear|reset|value|value|clear',
    );
  });
  it('honors controlled rejection, writeback and external changes', () => {
    cy.visit('/toolbar-state.html?controlled');
    cy.contains('button', 'Edit').click();
    cy.get('[data-testid="value"]').should('contain.text', '"term":"initial"');
    cy.contains('button', 'Accept').click();
    cy.contains('button', 'Edit').click();
    cy.get('[data-testid="value"]').should('contain.text', '"term":"edited"');
    cy.contains('button', 'External').click();
    cy.contains('button', 'Search').click();
    cy.get('[data-testid="events"]').should('contain.text', 'search:external');
    cy.contains('button', 'Reset').click();
    cy.get('[data-testid="value"]')
      .should('contain.text', '"term":"initial"')
      .and('contain.text', '"keep":"external"');
  });
  it('measures actual content height and updates expansion policy', () => {
    cy.visit('/toolbar-state.html');
    cy.contains('button', 'Measure').click();
    cy.get('[data-testid="overflow"]').should('have.text', 'false');
    cy.contains('button', 'Size').click();
    cy.contains('button', 'Measure').click();
    cy.get('[data-testid="overflow"]').should('have.text', 'true');
    cy.get('[data-testid="height"]').should('have.text', '32px');
    cy.contains('button', /^Expand$/).click();
    cy.get('[data-testid="height"]').should('have.text', '96px');
    cy.contains('button', 'Allow expand').click();
    cy.get('[data-testid="height"]').should('have.text', 'none');
  });
  it('preserves schema styles and deduplicates nested render slot names', () => {
    cy.visit('/toolbar-state.html');
    cy.get('[data-testid="schemas"]')
      .should('contain.text', '"gridColumn":"span 2"')
      .and('contain.text', '"gridColumn":"span 1"')
      .and('contain.text', '"color":"red"');
    cy.get('[data-testid="slots"]').should('have.text', 'field,nested');
  });
  it('searches from Enter but respects editable targets, cancellation and IME', () => {
    cy.visit('/toolbar-state.html');
    cy.get('input[aria-label="Search input"]').type('{enter}');
    cy.get('[data-testid="events"]').should('have.text', 'search:initial');
    cy.get('textarea').type('{enter}');
    cy.get('[contenteditable]').type('{enter}');
    cy.get('input[aria-label="Prevented"]').type('{enter}');
    cy.get('input[aria-label="Search input"]').trigger('keydown', {
      key: 'Enter',
      isComposing: true,
    });
    cy.get('[data-testid="events"]').should('have.text', 'search:initial');
  });
});
