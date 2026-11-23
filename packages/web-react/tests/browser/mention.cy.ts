describe('React mention', () => {
  beforeEach(() => cy.visit('/form-controls.html'));

  const mentionAction = (detail: string) =>
    cy.window().then((win) => win.dispatchEvent(new CustomEvent('mention-action', { detail })));

  it('searches Mention groups, skips disabled candidates and publishes selection in Vue order', () => {
    cy.get('[data-testid="mention-main"] input').type('@');
    cy.get('.sd-mention-dropdown .sd-select-option').should('have.length', 4);
    cy.get('.sd-mention-dropdown .sd-select-option-active').should('have.text', 'Alice');
    cy.get('.sd-mention-dropdown .sd-select-option-disabled').click();
    cy.get('[data-testid="mention-events"]').should('have.text', 'search:@:|update:@|change:@');
    cy.get('[data-testid="mention-main"] input').type('{downarrow}{downarrow}{enter}');
    cy.get('[data-testid="mention-main"] input').should('have.value', '@0');
    cy.get('[data-testid="mention-events"]').should(
      'have.text',
      'search:@:|update:@|change:@|select:0|update:@0|change:@0',
    );
    cy.get('[data-testid="mention-main"] input')
      .should('be.focused')
      .and('have.attr', 'aria-expanded', 'false');
  });

  it('filters Mention text and reopens after Escape without opening on plain Enter', () => {
    cy.get('[data-testid="mention-main"] input').type('{enter}');
    cy.get('.sd-mention-dropdown .sd-select-option').should('not.exist');
    cy.get('[data-testid="mention-main"] input').type('@a');
    cy.get('.sd-mention-dropdown .sd-select-option')
      .should('have.length', 1)
      .and('have.text', 'Alice');
    cy.get('[data-testid="mention-main"] input').type('{esc}');
    cy.get('[data-testid="mention-main"] input').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="mention-main"] input').type('l');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    cy.get('[data-testid="mention-main"] input').type(' ');
    cy.get('[data-testid="mention-main"] input').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="mention-main"] input').clear().type('Hello#bo');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Bob').click();
    cy.get('[data-testid="mention-main"] input').should('have.value', 'Hello #Bob');
  });

  it('preserves the latest controlled Mention tail and clears local state on release', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    mentionAction('controlled');
    cy.get('[data-testid="mention-main"] input')
      .should('have.value', '@a old')
      .focus()
      .then((element) => {
        (element[0] as HTMLInputElement).setSelectionRange(2, 2);
      })
      .trigger('input');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('tail');
    cy.get('[data-testid="mention-main"] input').should('have.value', '@a new');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Alice').click();
    cy.get('[data-testid="mention-events"]').should(
      'contain.text',
      'select:Alice|update:@Alice new|change:@Alice new',
    );
    cy.get('[data-testid="mention-main"] input').should('have.value', '@a new');
    mentionAction('release');
    cy.get('[data-testid="mention-main"] input').should('have.value', '');
  });

  it('supports Mention custom filters, multiple-character prefixes and custom separators', () => {
    cy.get('[data-testid="mention-custom-filter"] input').type('::two words');
    cy.get('.sd-mention-dropdown .sd-select-option')
      .should('have.length', 1)
      .and('have.text', 'Second')
      .click();
    cy.get('[data-testid="mention-custom-filter"] input').should('have.value', '::Second');
    mentionAction('split');
    mentionAction('filter');
    cy.get('[data-testid="mention-main"] input').type('x#unknown');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Bob').click();
    cy.get('[data-testid="mention-main"] input').should('have.value', 'x:#Bob');
  });

  it('closes Mention on readonly or disabled changes and follows remote option updates', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    cy.get('[data-testid="mention-main"] input').type('@');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('empty');
    cy.get('[data-testid="mention-main"] input').should('have.attr', 'aria-expanded', 'false');
    mentionAction('reload');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('readonly');
    cy.get('[data-testid="mention-main"] input').should('have.prop', 'readOnly', true);
    cy.get('[data-testid="mention-main"] input')
      .should('have.attr', 'aria-expanded', 'false')
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'select:');
    mentionAction('readonly');
    cy.get('.sd-mention-dropdown .sd-select-option').should('be.visible');
    mentionAction('disabled');
    cy.get('[data-testid="mention-main"] input')
      .should('be.disabled')
      .and('have.attr', 'aria-expanded', 'false');
  });

  it('measures Mention textarea on type changes and parent resize while retaining keyboard selection', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    mentionAction('textarea');
    cy.get('[data-testid="mention-main"] textarea').type('Hello\n@');
    cy.get('.sd-mention-measure').should((element) => {
      const field = element[0].parentElement!.querySelector('textarea')!;
      expect(element[0].style.width).to.equal(getComputedStyle(field).width);
      expect(element[0].style.fontSize).to.equal(getComputedStyle(field).fontSize);
    });
    cy.get('[data-testid="mention-main"] textarea')
      .type('{downarrow}{enter}')
      .should('have.value', 'Hello\n@Bob');
    mentionAction('input');
    cy.get('[data-testid="mention-main"] input').should('exist');
    mentionAction('textarea');
    cy.get('[data-testid="mention-main"] textarea').clear().type('@');
    cy.get('[data-testid="mention-main"] textarea').then((element) => {
      element[0].style.width = '240px';
    });
    cy.get('.sd-mention-measure').should('have.css', 'width', '240px');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Alice').click();
    cy.get('[data-testid="mention-main"] textarea').should('have.value', '@Alice');
  });

  it('supports Mention refs, clearing configuration and form validation', () => {
    cy.contains('button', 'Mention focus').click();
    cy.get('[data-testid="mention-main"] input').should('be.focused').type('@');
    cy.get('[data-testid="mention-main"] .sd-input-clear-btn').click();
    cy.get('[data-testid="mention-events"]').should('contain.text', 'update:|change:|clear');
    cy.contains('button', 'Mention blur').click();
    cy.get('[data-testid="mention-main"] input').should('not.be.focused');
    cy.get('[data-testid="mention-config"] .sd-input-clear-btn').should('exist');
    cy.get('[data-testid="mention-no-clear"] .sd-input-clear-btn').should('not.exist');
    cy.get('[data-testid="mention-form"] input').type('@');
    cy.contains('.sd-mention-dropdown .sd-select-option', 'Alice').click();
    cy.get('[data-testid="mention-form"] .sd-input-clear-btn').click();
    cy.get('[data-testid="mention-fixture"]').should('contain.text', 'Mention required');
  });

  it('keeps Mention IME Enter uncommitted and selects an empty value with native events', () => {
    cy.get('[data-testid="mention-empty"] input').type('@');
    cy.get('.sd-mention-dropdown .sd-select-option').should('have.text', 'Empty value');
    cy.get('[data-testid="mention-empty"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: true,
    });
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'empty:');
    cy.get('[data-testid="mention-empty"] input').trigger('keydown', {
      key: 'Enter',
      isComposing: false,
    });
    cy.get('[data-testid="mention-events"]')
      .should('contain.text', 'native-input')
      .and('contain.text', 'native-keydown')
      .and('contain.text', 'empty:');
    cy.get('[data-testid="mention-empty"] input')
      .should('have.value', '@')
      .and('have.attr', 'aria-expanded', 'false');
  });

  it('suppresses Mention textarea selection while readonly or disabled', () => {
    cy.get('[data-testid="mention-fixture"]').should('have.attr', 'data-ready', 'true');
    mentionAction('textarea');
    cy.get('[data-testid="mention-main"] textarea').type('@');
    cy.get('.sd-mention-dropdown').should('be.visible');
    mentionAction('readonly');
    cy.get('[data-testid="mention-main"] textarea')
      .should('have.prop', 'readOnly', true)
      .trigger('keydown', { key: 'Enter' });
    cy.get('.sd-mention-dropdown').should('not.exist');
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'select:');
    mentionAction('readonly');
    cy.get('.sd-mention-dropdown').should('be.visible');
    mentionAction('disabled');
    cy.get('[data-testid="mention-main"] textarea')
      .should('be.disabled')
      .trigger('keydown', { key: 'Enter', force: true });
    cy.get('.sd-mention-dropdown').should('not.exist');
    cy.get('[data-testid="mention-events"]').should('not.contain.text', 'select:');
  });
});
