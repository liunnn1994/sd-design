describe('React checkbox', () => {
  beforeEach(() => cy.visit('/form-controls.html'));

  it('restores Checkbox indeterminate state and rejects controlled native toggles', () => {
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'indeterminate', true);
    cy.get('[aria-label="Mixed check"]').click({ force: true });
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'checked', true);
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'indeterminate', true);
    cy.contains('button', 'Toggle mixed state').click();
    cy.get('[aria-label="Mixed check"]').should('have.prop', 'indeterminate', false);
    cy.get('[aria-label="Locked check"]').click({ force: true }).should('not.be.checked');
    cy.get('[aria-label="Locked check"]').focus().should('be.focused');
    cy.press(Cypress.Keyboard.Keys.SPACE);
    cy.get('[aria-label="Locked check"]').should('not.be.checked');
    cy.get('[aria-label="False check"]').should('be.checked');
    cy.get('[aria-label="Independent check"]').should('be.checked').and('not.be.disabled');
  });

  it('enforces Checkbox group limits while allowing removal and dynamic disabling', () => {
    cy.get('[data-testid="checks"]').should('have.attr', 'role', 'group');
    cy.get('[data-testid="checks"] input').eq(0).should('be.checked');
    cy.get('[data-testid="checks"] label').eq(1).click();
    cy.get('[data-testid="check-values"]').should('have.text', '0,1');
    cy.get('[data-testid="checks"] input').eq(3).should('be.disabled');
    cy.get('[data-testid="checks"] label').eq(0).click();
    cy.get('[data-testid="checks"] input').eq(3).should('not.be.disabled');
    cy.get('[data-testid="checks"] input').eq(2).should('be.disabled');
    cy.contains('button', 'Toggle selection limit').click();
    cy.get('[data-testid="checks"] input').eq(0).should('be.disabled');
    cy.get('[data-testid="checks"] label').eq(1).click();
    cy.get('[data-testid="checks"] input').eq(0).should('not.be.disabled');
    cy.contains('button', 'Toggle choice disabled').click();
    cy.get('[data-testid="checks"] input').each((input) => cy.wrap(input).should('be.disabled'));
  });

  it('restores unchecked state on release while retaining the native mixed property', () => {
    const input = () => cy.get('[aria-label="Mixed check"]');
    input().focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    input().should('have.prop', 'checked', true);
    input().should('have.prop', 'indeterminate', true);
    cy.contains('button', 'Release checkbox value').click();
    input().should('have.prop', 'checked', false);
    input().should('have.prop', 'indeterminate', true);
    input().focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    input().should('have.prop', 'checked', true);
    input().should('have.prop', 'indeterminate', true);
  });

  it('associates the visible label with the native input and submits only enabled checked values', () => {
    const label = () => cy.contains('label', 'Include zero permission');
    const input = () => label().find('input[type="checkbox"]');
    const submit = () => cy.contains('button', 'Read submitted checkboxes').click();
    const result = () => cy.get('[data-testid="checkbox-submitted"]');
    input().should('have.attr', 'tabindex', '0').and('be.checked');
    submit();
    result().should('have.text', '["0"]');
    label().click();
    input().should('not.be.checked');
    submit();
    result().should('have.text', '[]');
    input().focus();
    cy.press(Cypress.Keyboard.Keys.SPACE);
    input().should('be.checked');
    cy.get('[data-testid="choice-events"]').should(
      'have.text',
      'native:false:click|native:true:click',
    );
    submit();
    result().should('have.text', '["0"]');
  });

  it('renders choice custom indicators and labels and validates Checkbox form changes', () => {
    cy.get('[data-testid="custom-check"]').should('have.text', 'true');
    cy.contains('.sd-checkbox-label', 'Custom 0').should('be.visible');
    cy.get('[data-testid="custom-radio"]').should('have.text', 'true');
    cy.get('[aria-label="Form check"]').click({ force: true });
    cy.get('[aria-label="Form check"]').click({ force: true });
    cy.contains('Accept required').should('be.visible');
    cy.get('[aria-label="Form check"]').click({ force: true });
    cy.contains('Accept required').should('not.exist');
  });
});
