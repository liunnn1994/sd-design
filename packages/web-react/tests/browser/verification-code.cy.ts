describe('React verification-code', () => {
  beforeEach(() => cy.visit('/verification-code.html'));

  it('labels each cell and redirects a click on a later empty cell to the first empty cell', () => {
    const cells = () => cy.get('[data-testid="verification"] input');
    cy.get('[data-testid="verification"]')
      .should('have.attr', 'role', 'group')
      .and('have.attr', 'aria-label', '验证码');
    cells().first().should('have.attr', 'aria-label', '第 1 个字符,共 4 个').type('9');
    cells().last().should('have.attr', 'aria-label', '第 4 个字符,共 4 个').click();
    cells().eq(1).should('be.focused');
    cells().first().click();
    cells().first().should('be.focused').and('have.prop', 'selectionStart', 1);
  });

  it('protects a partial readonly code from paste and from Backspace on an empty cell', () => {
    const cells = () => cy.get('[data-testid="verification-readonly"] input');
    cells()
      .first()
      .then(([$input]) => {
        const data = new DataTransfer();
        data.setData('text/plain', '34');
        $input.dispatchEvent(
          new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }),
        );
      });
    cells().eq(2).focus().trigger('keydown', { key: 'Backspace', code: 'Backspace' });
    cells().first().should('have.value', '1');
    cells().eq(1).should('have.value', '2');
    cells().eq(2).should('have.value', '');
    cy.get('[data-testid="verification-events"]').should('be.empty');
  });

  it('keeps imperative focus and blur safe when there are no cells', () => {
    cy.contains('button', 'Remove code cells').click();
    cy.get('[data-testid="verification"] input').should('not.exist');
    cy.contains('button', 'Focus code').click();
    cy.contains('button', 'Blur code').click();
    cy.contains('button', 'Resize code').click();
    cy.contains('button', 'Focus code').click();
    cy.get('[data-testid="verification"] input')
      .should('have.length', 4)
      .first()
      .should('be.focused');
  });

  it('formats VerificationCode typing and emits ordered completion events', () => {
    cy.get('[data-testid="verification"] input').first().type('a1234');
    cy.get('[data-testid="verification-value"]').should('have.text', '1234');
    cy.get('[data-testid="verification-events"]').should(
      'contain.text',
      'update:1234|change:1234|finish:1234',
    );
    cy.get('[data-testid="verification"] input').last().should('be.focused');
    cy.get('[data-testid="verification-separator"]').should('have.text', '-');
  });

  it('pastes filtered VerificationCode and restores declined controlled writes', () => {
    cy.get('[data-testid="verification"] input')
      .first()
      .then(($input) => {
        const data = new DataTransfer();
        data.setData('text', '1a2b34');
        $input[0].dispatchEvent(
          new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }),
        );
      });
    cy.get('[data-testid="verification-value"]').should('have.text', '1234');
    cy.get('[data-testid="verification-locked"] input').eq(2).type('3');
    cy.get('[data-testid="verification-locked"] input').eq(2).should('have.value', '');
    cy.get('[data-testid="verification-events"]').should('contain.text', 'locked:123');
    cy.get('[data-testid="verification-locked"] input').eq(2).type('4');
    cy.get('[data-testid="verification-events"]').should('contain.text', 'locked:124');
  });

  it('synchronizes VerificationCode length, external values, navigation and refs', () => {
    cy.contains('button', 'Set code').click();
    cy.contains('button', 'Focus code').click();
    cy.get('[data-testid="verification"] input')
      .eq(2)
      .should('be.focused')
      .trigger('keydown', { key: 'Backspace' });
    cy.get('[data-testid="verification-value"]').should('have.text', '9');
    cy.get('[data-testid="verification"] input')
      .eq(1)
      .should('be.focused')
      .trigger('keydown', { key: 'ArrowLeft' });
    cy.get('[data-testid="verification"] input')
      .first()
      .should('be.focused')
      .trigger('keydown', { key: 'ArrowRight' });
    cy.get('[data-testid="verification"] input').eq(1).should('be.focused');
    cy.contains('button', 'Blur code').click();
    cy.get('[data-testid="verification"] input').eq(1).should('not.be.focused');
    cy.get('[data-testid="verification-default"] input').eq(2).type('3');
    cy.contains('button', 'Resize code').click();
    cy.get('[data-testid="verification"] input').should('have.length', 6);
    cy.get('[data-testid="verification-default"] input').eq(2).should('have.value', '3');
    cy.get('[data-testid="verification-default"] input').should('have.length', 6);
  });

  it('preserves VerificationCode masks, readonly and inherited disabled inputs', () => {
    cy.get('[data-testid="verification-readonly"] input')
      .should('have.attr', 'type', 'password')
      .and('have.attr', 'readonly');
    cy.get('[data-testid="verification-form-disabled"] input').each(($input) =>
      cy.wrap($input).should('be.disabled'),
    );
    cy.contains('button', 'Disable code').click();
    cy.get('[data-testid="verification"] input').each(($input) =>
      cy.wrap($input).should('be.disabled'),
    );
  });
});
