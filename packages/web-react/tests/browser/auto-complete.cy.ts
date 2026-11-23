describe('React auto-complete', () => {
  beforeEach(() => cy.visit('/form-controls.html'));

  it('preserves AutoComplete focus across remote data updates and releases controlled values', () => {
    cy.get('[data-testid="auto-remote"] input').focus();
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { remote: [] } })),
    );
    cy.get('[data-testid="auto-remote"] input')
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
    cy.window().then((win) =>
      win.dispatchEvent(
        new CustomEvent('auto-complete-update', { detail: { remote: ['Reloaded'] } }),
      ),
    );
    cy.get('[data-testid="auto-remote"] input').should('be.focused');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Reloaded').click();
    cy.get('[data-testid="auto-remote"] input').should('have.value', 'Reloaded');
    cy.contains('button', 'Auto release').click();
    cy.get('[data-testid="auto-release"] input').should('have.value', '');
    cy.get('[data-testid="auto-custom"] input').focus();
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Empty').click();
    cy.get('[data-testid="auto-custom"] input').should('have.value', '');
  });

  it('ignores composing AutoComplete selection and closes open popups when disabled or readonly changes', () => {
    cy.get('[data-testid="auto-main"] input')
      .focus()
      .trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('[data-testid="auto-events"]').should('have.text', '');
    cy.get('.sd-auto-complete-dropdown:visible').should('exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { readonly: true } })),
    );
    cy.get('[data-testid="auto-main"] input')
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { readonly: false } })),
    );
    cy.get('[data-testid="auto-main"] input').trigger('keydown', { key: 'Enter' });
    cy.get('.sd-auto-complete-dropdown:visible').should('exist');
    cy.window().then((win) =>
      win.dispatchEvent(new CustomEvent('auto-complete-update', { detail: { disabled: true } })),
    );
    cy.get('[data-testid="auto-main"] input')
      .should('be.disabled')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
  });

  it('emits AutoComplete scroll boundaries in both list modes and uses a custom popup container', () => {
    cy.get('[data-testid="auto-scroll"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible [data-overlayscrollbars-viewport]').scrollTo(
      'bottom',
    );
    cy.get('[data-testid="auto-events"]')
      .should('contain.text', 'normal-bottom')
      .and('contain.text', 'normal-scroll');
    cy.get('[data-testid="auto-virtual"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible .sd-select-option-active .sd-ellipsis-content')
      .first()
      .should('have.text', 'Item 400')
      .and('be.visible');
    cy.get('.sd-auto-complete-dropdown:visible [data-overlayscrollbars-viewport]').scrollTo(
      'bottom',
    );
    cy.get('[data-testid="auto-events"]')
      .should('contain.text', '|bottom')
      .and('contain.text', '|scroll');
    cy.get('[data-testid="auto-contained"] input').focus();
    cy.get('#auto-popup-host .sd-auto-complete-dropdown')
      .should('be.visible')
      .and('contain.text', 'Inside');
  });

  it('publishes AutoComplete search, update, change and select in Vue order', () => {
    cy.get('[data-testid="auto-main"] input').type('A');
    cy.get('[data-testid="auto-events"]').should('have.text', 'search:A|value:A|change:A');
    cy.get('.sd-auto-complete-dropdown:visible').should(($el) =>
      expect($el[0].getBoundingClientRect().width).to.be.closeTo(180, 1),
    );
    cy.get('.sd-auto-complete-dropdown:visible').should('contain.text', 'Suggestions footer');
    cy.get('[data-testid="auto-main"] input').trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="auto-value"]').should('have.text', 'Alpha');
    cy.get('[data-testid="auto-events"]').should(
      'contain.text',
      'select:Alpha|value:Alpha|change:Alpha',
    );
    cy.get('[data-testid="auto-main"] input')
      .should('not.be.focused')
      .and('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="auto-main"] input').focus();
    cy.get('[data-testid="auto-main"] .sd-input-clear-btn').click();
    cy.get('[data-testid="auto-value"]').should('have.text', '');
    cy.get('[data-testid="auto-events"]').should('contain.text', 'value:|change:|clear');
  });

  it('navigates AutoComplete groups and skips disabled options while preserving numeric zero', () => {
    cy.get('[data-testid="auto-main"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible .sd-select-group > ul > li').should(
      'have.length',
      2,
    );
    cy.get('[data-testid="auto-main"] input')
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="auto-value"]').should('have.text', '0');
    cy.get('[data-testid="auto-main"] input').focus().trigger('keydown', { key: 'Escape' });
    cy.get('[data-testid="auto-main"] input')
      .should('have.attr', 'aria-expanded', 'false')
      .trigger('keydown', { key: 'Enter' });
    cy.get('.sd-auto-complete-dropdown:visible').should('exist');
  });

  it('filters AutoComplete case-sensitively in strict mode and supports normalized custom options', () => {
    cy.get('[data-testid="auto-main"] input').type('a');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Alpha').should('exist');
    cy.contains('button', 'Auto strict').click();
    cy.get('[data-testid="auto-main"] input').focus().clear().type('AL');
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
    cy.get('[data-testid="auto-custom"] input').type('b');
    cy.get('.sd-auto-complete-dropdown:visible [role="option"]')
      .should('have.length', 2)
      .first()
      .should('contain.text', 'Beta')
      .click();
    cy.get('[data-testid="auto-custom"] input').should('have.value', 'Beta');
  });

  it('restores refused AutoComplete writes and responds to external values, empty data and readonly state', () => {
    cy.get('[data-testid="auto-rejected"] input').type('x').should('have.value', '');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Beta').click();
    cy.get('[data-testid="auto-rejected"] input').should('have.value', '');
    cy.contains('button', 'Auto external').click();
    cy.get('[data-testid="auto-main"] input').should('have.value', 'Beta');
    cy.get('[data-testid="auto-remote"] input').type('anything');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Remote').should('exist');
    cy.contains('button', 'Auto empty').click();
    cy.get('[data-testid="auto-remote"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible').should('not.exist');
    cy.contains('button', 'Auto reload').click();
    cy.get('[data-testid="auto-remote"] input').focus();
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'Reloaded').should('exist');
    cy.contains('button', 'Auto readonly').click();
    cy.get('[data-testid="auto-main"] input').focus().trigger('keydown', { key: 'a' });
    cy.contains('.sd-tooltip-content:visible', 'Locked autocomplete').should('be.visible');
    cy.get('[data-testid="auto-main"] input').should('have.attr', 'aria-expanded', 'false');
    cy.contains('button', 'Auto disabled').click();
    cy.get('[data-testid="auto-main"] input').should('be.disabled');
  });

  it('scrolls AutoComplete virtual suggestions and honors local provider opt-outs', () => {
    cy.get('[data-testid="auto-virtual"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible [role="option"]').should('have.length.lessThan', 40);
    cy.get('.sd-auto-complete-dropdown:visible .sd-select-option-active .sd-ellipsis-content')
      .first()
      .should('have.text', 'Item 400')
      .and('be.visible');
    cy.get('[data-testid="auto-virtual"] input')
      .trigger('keydown', { key: 'ArrowDown' })
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="auto-virtual"] input').should('have.value', 'Item 401');
    cy.get('[data-testid="auto-optout"] input').focus();
    cy.get('.sd-auto-complete-dropdown:visible .sd-virtual-list').should('not.exist');
    cy.get('[data-testid="auto-optout"] .sd-input-clear-btn').should('not.exist');
  });

  it('validates AutoComplete form changes and releases focus refs on unmount', () => {
    cy.get('[data-testid="auto-form"] input').focus().blur();
    cy.contains('Choose a suggestion').should('be.visible');
    cy.get('[data-testid="auto-form"] input').type('v');
    cy.contains('.sd-auto-complete-dropdown:visible [role="option"]', 'valid').click();
    cy.contains('Choose a suggestion').should('not.exist');
    cy.contains('button', 'Auto focus').click();
    cy.get('[data-testid="auto-main"] input').should('be.focused');
    cy.contains('button', 'Auto blur').click();
    cy.get('[data-testid="auto-main"] input').should('not.be.focused');
    cy.contains('button', 'Auto mount').click();
    cy.get('[data-testid="auto-main"]').should('not.exist');
    cy.contains('button', 'Auto focus').click();
    cy.contains('button', 'Auto mount').click();
    cy.contains('button', 'Auto focus').click();
    cy.get('[data-testid="auto-main"] input').should('be.focused');
  });
});
