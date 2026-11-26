describe('React Input', () => {
  beforeEach(() => cy.visit('/input.html'));

  it('rounds only the outer corners of buttons in a mixed input group', () => {
    cy.get('[data-testid="mixed-input-group"] > .sd-btn').should(($buttons) => {
      expect($buttons).to.have.length(3);
      const [first, middle, last] = $buttons
        .toArray()
        .map((button) => button.ownerDocument.defaultView!.getComputedStyle(button));

      for (const style of [first, middle]) {
        expect(style.borderTopRightRadius).to.equal('0px');
        expect(style.borderBottomRightRadius).to.equal('0px');
      }
      for (const style of [middle, last]) {
        expect(style.borderTopLeftRadius).to.equal('0px');
        expect(style.borderBottomLeftRadius).to.equal('0px');
      }
      expect(parseFloat(first.borderTopLeftRadius)).to.be.greaterThan(0);
      expect(parseFloat(first.borderBottomLeftRadius)).to.be.greaterThan(0);
      expect(parseFloat(last.borderTopRightRadius)).to.be.greaterThan(0);
      expect(parseFloat(last.borderBottomRightRadius)).to.be.greaterThan(0);
    });
  });

  it('publishes Input value/input before commit change and clears through the keyboard', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Model input"]').type('a');
      cy.get('[data-testid="input-events"]').should('have.text', 'value:a|input:a');
      cy.get('[aria-label="Model input"]').type('{enter}');
      cy.get('[data-testid="input-events"]').should('have.text', 'value:a|input:a|change:a|enter');
      cy.contains('button', 'Clear input events').click();
      cy.get('[aria-label="Model input"]').focus();
      cy.get('.sd-form .sd-input-clear-btn').should('be.visible').focus().type(' ');
      cy.get('[data-testid="input-events"]').should('have.text', 'value:|change:|clear');
      cy.get('[aria-label="Model input"]').should('have.value', '');
      cy.contains('button', 'Focus input ref').click();
      cy.get('[aria-label="Model input"]').should('be.focused');
    });
  });

  it('restores controlled Input values, counts graphemes and marks error-only limits', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Locked input"]').type('x').should('have.value', 'fixed');
      cy.get('[aria-label="Limited input"]')
        .invoke('val', '😀😀😀')
        .trigger('input', { inputType: 'insertFromPaste' })
        .should('have.value', '😀😀');
      cy.get('[aria-label="Limited input"]')
        .parent()
        .find('.sd-input-word-limit')
        .should('have.text', '2/2');
      cy.get('[aria-label="Error limit input"]')
        .type('abc')
        .should('have.value', 'abc')
        .and('have.attr', 'aria-invalid', 'true');
      cy.get('[aria-label="Global clear input"]')
        .parent()
        .find('.sd-input-clear-btn')
        .should('exist');
      cy.get('[aria-label="No clear input"]')
        .parent()
        .find('.sd-input-clear-btn')
        .should('not.exist');
    });
  });

  it('keeps Input composition drafts and updates outer layout and fit width', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Model input"]')
        .trigger('compositionstart')
        .invoke('val', '中文')
        .trigger('input', { inputType: 'insertCompositionText' });
      cy.get('[data-testid="input-model"]').should('have.text', '');
      cy.get('[aria-label="Model input"]').trigger('compositionend', { data: '中文' });
      cy.get('[data-testid="input-model"]').should('have.text', '中文');
      cy.contains('button', 'Toggle input outer').click();
      cy.get('.sd-form .sd-input-outer')
        .should('contain.text', 'https://')
        .and('contain.text', 'suffix');
      cy.get('[aria-label="Model input"]').should('have.value', '中文');
      cy.get('[aria-label="Numeric affix input"]')
        .closest('.sd-input-outer')
        .find('.sd-input-prepend, .sd-input-append, .sd-input-prefix, .sd-input-suffix')
        .should('have.length', 4)
        .each(($node) => expect($node.text()).to.equal('0'));
      cy.get('[aria-label="Numeric affix input"]').type('a');
      cy.get('[data-testid="input-event-target"]').should('have.text', 'INPUT');
      cy.get('[aria-label="Fit input"]')
        .invoke('outerWidth')
        .then((width) => {
          cy.get('[aria-label="Fit input"]')
            .type('longer value')
            .invoke('outerWidth')
            .should('be.greaterThan', width);
        });
    });
  });

  it('toggles password masking and blocks disabled search overrides', () => {
    cy.get('[data-testid="input-fixture"]').within(() => {
      cy.get('[aria-label="Password input"]').should('have.attr', 'type', 'password');
      cy.get('[aria-label="Password input"]').type('2');
      cy.get('[aria-label="Password input"]')
        .closest('.sd-input-password')
        .find('[aria-label="Show password"]')
        .click();
      cy.get('[aria-label="Password input"]')
        .should('have.attr', 'type', 'text')
        .and('have.value', 'password2')
        .and('be.focused');
      cy.contains('button', 'Run search').click();
      cy.get('[data-testid="input-searches"]').should('have.text', 'query');
      cy.contains('button', 'Disable input search').click();
      cy.contains('button', 'Run search').should('be.disabled');
      cy.get('[aria-label="Search input"]').should('be.disabled');
    });
    cy.get('[aria-label="Readonly input"]').trigger('keydown', { key: 'x' });
    cy.contains('.sd-tooltip-content', 'Cannot edit this value').should('be.visible');
    cy.get('[aria-label="Readonly input"]').should('have.value', 'secret');
  });

  it('commits a changed draft once and still publishes later Enter presses', () => {
    const model = () => cy.get('[aria-label="Model input"]');
    const events = () => cy.get('[data-testid="input-events"]');
    model().type('a{enter}{enter}').blur();
    events().should('have.text', 'value:a|input:a|change:a|enter|enter');
    model().type('b').blur();
    events().should(
      'have.text',
      'value:a|input:a|change:a|enter|enter|value:ab|input:ab|change:ab',
    );
    model().focus().blur();
    events().should(
      'have.text',
      'value:a|input:a|change:a|enter|enter|value:ab|input:ab|change:ab',
    );
  });

  it('applies custom word counting and slicing while forwarding native and wrapper attributes', () => {
    cy.get('[data-testid="native-inputs"]').should('have.class', 'sd-input-group');
    cy.get('[data-testid="weighted-input"]').should('have.class', 'sd-input-wrapper');
    cy.get('input[name="weighted"]').type('abcd').should('have.value', 'ab');
    cy.get('[data-testid="weighted-input"] .sd-input-word-limit').should('have.text', '4/4');
    cy.get('[aria-label="Custom slice input"]')
      .invoke('val', 'abcdef')
      .trigger('input', { inputType: 'insertFromPaste' })
      .should('have.value', 'ABCD');
  });

  it('omits clear controls for disabled and readonly inputs and respects password writeback', () => {
    cy.get('[aria-label="Disabled input"]').should('be.disabled');
    for (const label of ['Disabled input', 'Readonly input']) {
      cy.get(`[aria-label="${label}"]`)
        .closest('.sd-input-wrapper')
        .find('.sd-input-clear-btn')
        .should('not.exist');
    }
    cy.get('[aria-label="Plain password"]').should('have.attr', 'type', 'text');
    cy.get('[aria-label="Locked password"]')
      .closest('.sd-input-password')
      .find('[aria-label="Show password"]')
      .click();
    cy.get('[data-testid="password-requests"]').should('have.text', '1');
    cy.get('[aria-label="Locked password"]').should('have.attr', 'type', 'password');
  });
});
