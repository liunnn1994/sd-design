describe('React textarea', () => {
  beforeEach(() => cy.visit('/form-controls.html'));

  it('publishes Textarea input and blur/change in Vue order and supports keyboard clearing', () => {
    cy.get('[data-testid="textarea-fixture"]').within(() => {
      cy.get('[aria-label="Model textarea"]').type('a');
      cy.get('[data-testid="textarea-events"]').should('have.text', 'value:a|input:a');
      cy.get('[aria-label="Model textarea"]').blur();
      cy.get('[data-testid="textarea-events"]').should(
        'have.text',
        'value:a|input:a|blur|change:a',
      );
      cy.contains('button', 'Clear textarea events').click();
      cy.get('[aria-label="Model textarea"]').focus();
      cy.get('.sd-form .sd-textarea-clear-btn').should('be.visible').focus().type('{enter}');
      cy.get('[data-testid="textarea-events"]').should('have.text', 'blur|value:|change:|clear');
      cy.get('[aria-label="Model textarea"]').should('have.value', '');
      cy.contains('button', 'Focus textarea ref').click();
      cy.get('[aria-label="Model textarea"]').should('be.focused');
    });
  });

  it('preserves Textarea composition drafts, controlled rejection and grapheme limits', () => {
    cy.get('[data-testid="textarea-fixture"]').within(() => {
      cy.get('[aria-label="Locked textarea"]').type('x').should('have.value', 'fixed');
      cy.get('[aria-label="Model textarea"]')
        .trigger('compositionstart')
        .invoke('val', '中文')
        .trigger('input', { inputType: 'insertCompositionText' });
      cy.get('[data-testid="textarea-value"]').should('have.text', '');
      cy.get('[aria-label="Model textarea"]').trigger('compositionend', { data: '中文' });
      cy.get('[data-testid="textarea-value"]').should('have.text', '中文');
      cy.get('[aria-label="Limited textarea"]')
        .invoke('val', '😀ab')
        .trigger('input', { inputType: 'insertFromPaste' })
        .should('have.value', '😀a');
      cy.get('[aria-label="Limited textarea"]')
        .parent()
        .find('.sd-textarea-word-limit')
        .should('have.text', '2/2');
      cy.get('[aria-label="Fit textarea"]')
        .invoke('outerWidth')
        .then((width) => {
          cy.get('[aria-label="Fit textarea"]')
            .type(' longer content')
            .invoke('outerWidth')
            .should('be.greaterThan', width);
        });
    });
    cy.get('[aria-label="Readonly textarea"]').trigger('keydown', { key: 'x' });
    cy.contains('.sd-tooltip-content', 'Textarea cannot be edited').should('be.visible');
  });

  it('renders an accessible error for an over-limit value and renders a custom word count', () => {
    const error = '[aria-label="Error-only textarea"]';
    cy.get(error).should('have.attr', 'maxlength', '30');
    cy.get(error).type('hello world').should('have.value', 'hello world');
    cy.get(error).should('have.attr', 'aria-invalid', 'true');
    cy.get(error).parent().should('have.class', 'sd-textarea-error');
    cy.get(error).parent().find('.sd-textarea-word-limit').should('have.text', '11/5');
    cy.get(error).clear().type('hello');
    cy.get(error).should('not.have.attr', 'aria-invalid');
    cy.get(error).parent().should('not.have.class', 'sd-textarea-error');

    const weighted = '[aria-label="Weighted textarea"]';
    cy.get(weighted)
      .invoke('val', 'abc')
      .trigger('input', { inputType: 'insertFromPaste' })
      .should('have.value', 'ab');
    cy.get(weighted).parent().find('.sd-textarea-word-limit').should('have.text', '4/4');
  });

  it('syncs external values and native attributes and guards clearing while disabled', () => {
    const model = '[aria-label="Model textarea"]';
    cy.get(model).should('have.attr', 'name', 'notes');
    cy.get(model).should('have.attr', 'required');
    cy.contains('button', 'Replace textarea value').click();
    cy.get(model).should('have.value', 'server');
    cy.get('[data-testid="textarea-events"]').should('be.empty');
    cy.get(model).focus();
    cy.get(model).parent().find('.sd-textarea-clear-btn').should('be.visible');

    cy.contains('button', 'Toggle textarea disabled').click();
    cy.get(model).should('be.disabled').and('have.value', 'server');
    cy.get(model).should('have.attr', 'name', 'locked-notes');
    cy.get(model).should('not.have.attr', 'required');
    cy.get(model).parent().find('.sd-textarea-clear-btn').should('not.exist');
    cy.contains('button', 'Toggle textarea disabled').click();
    cy.get(model).should('be.enabled').focus();
    cy.get(model).parent().find('.sd-textarea-clear-btn').should('be.visible');
  });

  it('measures Textarea row limits and parent resize and restores native resize', () => {
    cy.get('[data-testid="textarea-fixture"]').within(() => {
      cy.get('[aria-label="Auto textarea"]')
        .should('have.css', 'resize', 'none')
        .invoke('outerHeight')
        .should('be.greaterThan', 100);
      cy.contains('button', 'Toggle textarea maximum').click();
      cy.get('[aria-label="Auto textarea"]').invoke('outerHeight').should('be.lessThan', 80);
      cy.get('[aria-label="Auto textarea"]').should('have.css', 'overflow-y', 'auto');
      cy.contains('button', 'Toggle textarea maximum').click();
      cy.get('[aria-label="Auto textarea"]').clear().type('One');
      cy.get('[aria-label="Auto textarea"]')
        .invoke('outerHeight')
        .then((height) => {
          cy.contains('button', 'Toggle textarea minimum').click();
          cy.get('[aria-label="Auto textarea"]')
            .invoke('outerHeight')
            .should('be.greaterThan', height);
        });
      cy.contains('button', 'Toggle textarea minimum').click();
      cy.get('[aria-label="Auto textarea"]')
        .clear()
        .type('A long sentence that will wrap when the parent becomes narrow');
      cy.get('[aria-label="Auto textarea"]')
        .invoke('outerHeight')
        .then((height) => {
          cy.contains('button', 'Resize textarea parent').click();
          cy.get('[aria-label="Auto textarea"]')
            .invoke('outerHeight')
            .should('be.greaterThan', height);
        });
      cy.contains('button', 'Toggle textarea auto size').click();
      cy.get('[aria-label="Auto textarea"]').should('have.css', 'resize', 'vertical');
      cy.get('.sd-textarea-mirror').should('not.exist');
      cy.contains('button', 'Toggle textarea mount').click();
      cy.get('[aria-label="Auto textarea"]').should('not.exist');
      cy.contains('button', 'Toggle textarea mount').click();
      cy.get('[aria-label="Auto textarea"]').should('exist');
    });
  });
});
