describe('React radio', () => {
  beforeEach(() => cy.visit('/form-controls.html'));

  it('restores both controlled Radio peers on repeated rejected updates', () => {
    cy.get('[data-testid="locked-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="locked-radios"] label').eq(1).click();
    cy.get('[data-testid="locked-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="locked-radios"] input').eq(1).should('not.be.checked');
    cy.get('[data-testid="locked-radios"] label').eq(1).click();
    cy.get('[data-testid="locked-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="choice-events"]').should('have.text', 'locked:b|locked:b');
  });

  it('navigates native Radio groups by keyboard and preserves values across option and type changes', () => {
    cy.get('[data-testid="radios"] input').eq(0).focus().should('be.focused');
    cy.press(Cypress.Keyboard.Keys.RIGHT);
    cy.get('[data-testid="radio-value"]').should('have.text', '1');
    cy.contains('button', 'Toggle radio type').click();
    cy.get('[data-testid="radios"] .sd-radio-button').should('have.length', 3);
    cy.contains('button', 'Replace radio options').click();
    cy.get('[data-testid="radios"] input:checked').should('not.exist');
    cy.get('[data-testid="radios"] label').eq(0).click();
    cy.get('[data-testid="radio-value"]').should('have.text', '2');
    cy.get('[data-testid="boolean-radios"] input').eq(0).should('be.checked');
    cy.get('[data-testid="boolean-radios"] label').eq(1).click();
    cy.get('[data-testid="boolean-radios"] input').eq(1).should('be.checked');
    cy.contains('button', 'Toggle choice disabled').click();
    cy.get('[data-testid="radios"] input').each((input) => cy.wrap(input).should('be.disabled'));
  });

  it('skips disabled native options and keeps peer groups isolated during keyboard navigation', () => {
    const group = () => cy.get('[data-testid="radios"]');
    const inputs = () => group().find<HTMLInputElement>('input[type="radio"]');
    group().should('have.attr', 'role', 'radiogroup');
    cy.contains('button', 'Toggle second radio option').click();
    group().contains('label', 'Unavailable second choice').find('input').should('be.disabled');
    inputs().should(($radio) => {
      const groupName = $radio[0].name;
      expect(groupName).not.to.equal('');
      expect([...$radio].every((radio) => radio.name === groupName)).to.equal(true);
      const peer = $radio[0].ownerDocument.querySelector<HTMLInputElement>(
        '[data-testid="boolean-radios"] input',
      );
      expect(peer?.name).not.to.equal(groupName);
    });
    inputs().first().focus();
    cy.press(Cypress.Keyboard.Keys.RIGHT);
    inputs().last().should('be.focused').and('be.checked');
    cy.get('[data-testid="radio-value"]').should('have.text', '2');
    cy.get('[data-testid="boolean-radios"] input').first().should('be.checked');
    cy.press(Cypress.Keyboard.Keys.RIGHT);
    inputs().first().should('be.focused').and('be.checked');
    cy.get('[data-testid="radio-value"]').should('have.text', '0');
  });

  it('keeps a standalone radio independent of the enclosing disabled group', () => {
    cy.contains('label', 'Disabled parent choice')
      .find('input')
      .should('be.disabled')
      .and('be.checked');
    const input = () => cy.get('[aria-label="Independent radio"]');
    input().should('be.enabled').and('not.be.checked');
    cy.contains('label', 'Independent radio choice').click();
    input().should('be.checked');
    cy.contains('label', 'Disabled parent choice').find('input').should('be.checked');
    cy.get('[data-testid="choice-events"]').should('have.text', 'independent:independent:click');
  });
});
