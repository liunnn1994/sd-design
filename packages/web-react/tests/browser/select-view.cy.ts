describe('React select-view', () => {
  beforeEach(() => cy.visit('/select-view.html'));

  it('activates the focused selection clear button with native Enter input', () => {
    cy.get('[data-testid="select-view"] input').focus();
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn')
      .should('be.visible')
      .focus()
      .should('be.focused');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: {
          type: 'keyDown',
          key: 'Enter',
          code: 'Enter',
          windowsVirtualKeyCode: 13,
          text: '\r',
        },
      }),
    );
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Input.dispatchKeyEvent',
        params: { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 },
      }),
    );
    cy.get('[data-testid="view-events"]')
      .should('contain.text', 'clear')
      .should('not.contain.text', 'bubbled');
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn').should('not.exist');
  });

  it('switches selection labels and input, closes focus and dispatches form focus exactly once', () => {
    cy.get('[data-testid="select-view"] .sd-select-view-value').should('contain.text', 'One');
    cy.contains('button', 'Focus selection').click();
    cy.get('[data-testid="select-view"] input')
      .should('be.focused')
      .should('not.have.class', 'sd-select-view-input-hidden')
      .should('have.attr', 'placeholder', 'One')
      .type('search');
    cy.get('[data-testid="view-query"]').should('have.text', 'search');
    cy.get('[data-testid="view-events"]').should('have.text', 'view-focus|form-focus');
    cy.contains('button', 'Toggle view open').click();
    cy.get('[data-testid="select-view"] input')
      .should('not.be.focused')
      .should('have.class', 'sd-select-view-input-hidden');
    cy.get('[data-testid="view-events"]').should(
      'have.text',
      'view-focus|form-focus|view-blur|form-blur',
    );
  });

  it('renders one selection clear control, honors explicit opt-out and stops a cancelled native click', () => {
    cy.contains('button', 'Toggle selection mode').click();
    cy.get('[data-testid="select-view"] input').focus();
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn')
      .should('have.length', 1)
      .should('be.visible')
      .focus();
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn').should('be.focused').click();
    cy.get('[data-testid="select-view"] .sd-select-view-tag').should('not.exist');
    cy.get('[data-testid="view-events"]')
      .should('contain.text', 'clear')
      .should('not.contain.text', 'bubbled');
    cy.get('[data-testid="select-view-no-clear"] .sd-select-view-clear-btn').should('not.exist');
  });

  it('removes the last multiple selection on Backspace only when the query is empty', () => {
    cy.contains('button', 'Toggle selection mode').click();
    cy.contains('button', 'Focus selection').click();
    const input = '[data-testid="select-view"] input';
    const tags = '[data-testid="select-view"] .sd-select-view-tag';
    cy.get(input).type('x{backspace}').should('have.value', '');
    cy.get(tags).should('have.length', 2);
    cy.get(input).type('{backspace}');
    cy.get(tags).should('have.length', 1).and('contain.text', 'One');
    cy.get('[data-testid="view-events"]').should('contain.text', 'remove:2');
  });

  it('resolves selection icon priority, custom labels, disabled state and create-only input', () => {
    cy.get('[data-testid="select-view"] .sd-select-view-arrow-icon').should('exist');
    cy.contains('button', 'Toggle view open').click();
    cy.get('[data-testid="select-view"] .sd-icon-search').should('exist');
    cy.contains('button', 'Toggle selection loading').click();
    cy.get('[data-testid="select-view"] .sd-icon-loading').should('exist');
    cy.get('[data-testid="select-view"] .sd-icon-search').should('not.exist');
    cy.contains('button', 'Toggle selection loading').click();
    cy.contains('button', 'Toggle selection search').click();
    cy.get('[data-testid="select-view"] input').should('have.attr', 'readonly');
    cy.contains('button', 'Toggle selection disabled').click();
    cy.get('[data-testid="select-view"] input').should('be.disabled');
    cy.get('[data-testid="select-view"] .sd-select-view-clear-btn').should('not.exist');
    cy.get('[data-testid="select-view-no-clear"]')
      .should('contain.text', 'Custom arrow')
      .should('contain.text', 'Custom One');
    cy.get('[data-testid="select-view-create"] input').should('not.have.attr', 'readonly');
  });

  it('restores controlled label input and preserves IME drafts and native input styling', () => {
    cy.get('[data-testid="input-label-controlled"] input')
      .should('have.class', 'label-custom')
      .should('have.css', 'color', 'rgb(12, 34, 56)')
      .focus()
      .type('x')
      .should('have.value', 'fixed');
    cy.get('[data-testid="view-events"]').should('contain.text', 'label:fixedx');
    cy.get('[data-testid="input-label-controlled"] input')
      .trigger('compositionstart', { data: '' })
      .invoke('val', '中文')
      .trigger('compositionupdate', { data: '中文' })
      .trigger('input')
      .should('have.value', '中文');
    cy.get('[data-testid="input-label-controlled"] input')
      .trigger('compositionend', { data: '中文' })
      .should('have.value', 'fixed');
    cy.get('[data-testid="view-events"]').should('contain.text', 'label:中文');
  });
});
