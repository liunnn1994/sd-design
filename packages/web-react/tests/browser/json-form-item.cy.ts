describe('React JsonForm item adapter', () => {
  it('validates shared rules and updates nested control values through the form', () => {
    cy.visit('/json-form-item.html');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="errors"]').should('contain', 'name');
    cy.get('input').type('Alice').blur();
    cy.get('[data-testid="model"]').should('contain', '"name":"Alice"');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="errors"]').should('have.text', '{}');
    cy.get('[data-testid="extra"]').should('have.text', 'Extra name');
  });
  it('switches fields and replaces the model without stale input contents', () => {
    cy.visit('/json-form-item.html');
    cy.get('input').type('Alice');
    cy.contains('button', 'Toggle').click();
    cy.get('input').should('have.value', 'Other');
    cy.contains('button', 'Replace').click();
    cy.get('input').should('have.value', 'Replacement');
    cy.contains('button', 'Toggle').click();
    cy.get('input').should('have.value', '');
  });
  it('keeps hidden fields out of validation and registers them when shown', () => {
    cy.visit('/json-form-item.html?mode=hidden');
    cy.get('[data-testid="hidden"]').should('have.text', 'name:');
    cy.get('.sd-form-item').should('not.exist');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="errors"]').should('have.text', '{}');
    cy.contains('button', 'Toggle').click();
    cy.get('input').should('have.value', 'Other').clear();
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="errors"]').should('contain', 'other');
    cy.contains('button', 'Toggle').click();
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="errors"]').should('have.text', '{}');
  });
  it('renders bare slots without a form item', () => {
    cy.visit('/json-form-item.html?mode=bare');
    cy.get('[data-testid="bare"]').should('have.text', 'name');
    cy.get('.sd-form-item').should('not.exist');
  });
  for (const mode of ['slots', 'render']) {
    it(`supports dynamic ${mode} content with the form wrapper`, () => {
      cy.visit(`/json-form-item.html?mode=${mode}`);
      cy.get(mode === 'slots' ? '[data-testid="custom"]' : '[data-testid="rendered"]').should(
        'be.visible',
      );
      cy.get('.sd-form-item').should('have.length', 1);
      cy.get('input').should('not.exist');
      cy.contains('button', 'Toggle').click();
      cy.get('input').should('have.value', 'Other');
    });
  }
  it('recurses through rows and respects explicit column and form-item overrides', () => {
    cy.visit('/json-form-item.html?mode=row');
    cy.get('.sd-json-form-row > .sd-col-12').should('have.length', 1);
    cy.get('.sd-json-form-row > .sd-col-8').should('have.length', 1);
    cy.get('input').should('have.length', 2);
    cy.get('.sd-form-item-label').should('have.length', 1);
    cy.get('input').first().type('Row value');
    cy.get('[data-testid="model"]').should('contain', 'Row value');
  });
  it('uses normalized JSON Pointer fields for explicit rules and model updates', () => {
    cy.visit('/json-form-item.html?mode=pointer');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="errors"]').should('contain', 'Pointer required');
    cy.get('input').type('Pointer value').blur();
    cy.get('[data-testid="model"]').should('contain', '"a/b":"Pointer value"');
    cy.contains('button', 'Validate').click();
    cy.get('[data-testid="errors"]').should('have.text', '{}');
  });
});
