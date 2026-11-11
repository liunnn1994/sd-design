describe('React JsonForm control adapter', () => {
  it('binds Input and composes field updates before schema callbacks', () => {
    cy.visit('/json-form-control.html');
    cy.get('input').type('x');
    cy.get('[data-testid="value"]').should('have.text', 'x');
    cy.get('[data-testid="events"]').should('have.text', 'value:x|props-update|event-update');
    cy.get('input').blur();
    cy.get('[data-testid="events"]').should(
      'have.text',
      'value:x|props-update|event-update|props-change|event-change',
    );
    cy.get('.custom-control')
      .should('have.class', 'sd-json-form-control')
      .and('have.class', 'custom-control');
  });
  for (const type of ['checkbox', 'radio', 'switch']) {
    it(`uses the actual ${type} model contract`, () => {
      cy.visit(`/json-form-control.html?type=${type}`);
      cy.get(type === 'switch' ? '[role="switch"]' : `.sd-${type}`).click();
      cy.get('[data-testid="value"]').should('have.text', type === 'radio' ? 'choice' : 'true');
      cy.get('[data-testid="events"]')
        .invoke('text')
        .then((text) =>
          expect(text.split('|').filter((event) => event.startsWith('value:'))).to.have.length(1),
        );
      if (type === 'checkbox') cy.get('.sd-checkbox').should('contain.text', 'Name');
    });
  }
  it('uses localized placeholders and preserves explicit empty placeholders', () => {
    cy.visit('/json-form-control.html');
    cy.get('input').should('have.attr', 'placeholder', '请输入Name');
    cy.contains('button', 'Language').click();
    cy.get('input').should('have.attr', 'placeholder', 'Enter Name');
    cy.visit('/json-form-control.html?empty');
    cy.get('input').should('have.attr', 'placeholder', '');
  });
  it('falls back to the input registry entry for unknown component names', () => {
    cy.visit('/json-form-control.html?type=unknown');
    cy.get('input').type('fallback');
    cy.get('[data-testid="value"]').should('have.text', 'fallback');
  });
  it('renders default content and applies schema render props ahead of forwarded ones', () => {
    cy.visit('/json-form-control.html?type=custom');
    cy.get('[data-testid="default-slot"]').should('have.text', 'Default content');
    cy.contains('button', 'Custom update').click();
    cy.get('[data-testid="tail"]').should('have.text', 'Override custom');
    cy.contains('button', 'Slots').click();
    cy.get('[data-testid="tail"]').should('have.text', 'Forwarded custom');
  });
});
