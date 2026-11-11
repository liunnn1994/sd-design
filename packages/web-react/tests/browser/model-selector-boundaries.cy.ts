describe('React ModelSelector lifecycle and keyboard boundaries', () => {
  it('forwards native content attributes to the actual local modal container', () => {
    cy.visit('/model-selector.html?local&width');
    cy.get('.sd-model-selector-trigger').click();
    cy.get('#root .sd-modal-container.custom-content').should('exist');
    cy.get('.sd-model-selector-modal').should('have.css', 'width', '480px');
  });
  const input = () => cy.get('input[placeholder="Search models"]');
  const open = () => cy.contains('.sd-model-selector-trigger', 'Choose models').click();
  it('keeps search across actual content unmount/reopen when resetQueryOnClose is disabled', () => {
    cy.visit('/model-selector.html?preserve');
    open();
    input().type('Alpha{esc}');
    input().should('not.exist');
    open();
    input().should('have.value', 'Alpha');
    cy.get('[role="option"]:visible').should('have.length', 1).and('contain.text', 'Alpha');
  });
  it('resets uncontrolled searches after closing and restores focus to its trigger', () => {
    cy.visit('/model-selector.html');
    open();
    input().type('Alpha{esc}');
    input().should('not.exist');
    cy.get('.sd-model-selector-trigger').should('have.focus');
    open();
    input().should('have.value', '');
    cy.get('[role="option"]:visible').should('have.length', 3);
  });
  it('synchronizes externally changed query values and removes stale active descendants', () => {
    cy.visit('/model-selector.html?inline&input-controlled&keep');
    cy.contains('button', 'Set query').click();
    input().should('have.value', 'Beta');
    cy.get('[role="option"]:visible').should('have.length', 1).and('contain.text', 'Beta');
    input().clear().type('Alpha');
    cy.contains('button', 'Remove Alpha').click();
    input().should('not.have.attr', 'aria-activedescendant');
    cy.get('.sd-model-selector-empty').should('be.visible');
  });
  it('keeps groups without headings expanded despite a collapsed default', () => {
    cy.visit('/model-selector.html?inline&collapsed&no-heading');
    cy.get('.sd-model-selector-group').first().find('button').should('not.exist');
    cy.get('.sd-model-selector-group').first().should('not.have.attr', 'aria-labelledby');
    cy.get('.sd-model-selector-group-content').first().should('not.have.attr', 'inert');
    input().type('{downarrow}{enter}');
    cy.get('[data-testid="events"]').should('contain.text', 'root:alpha:keydown');
  });
  it('ignores composing Enter and uses current disabled values after a rerender', () => {
    cy.visit('/model-selector.html?inline&keep&ime');
    input().type('{downarrow}').trigger('keydown', {
      key: 'Enter',
      code: 'Enter',
      isComposing: true,
      eventConstructor: 'KeyboardEvent',
    });
    cy.get('[data-testid="events"]').should('not.contain.text', 'root:');
    cy.contains('button', 'Disable Beta').click();
    input().type('{downarrow}{enter}');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'root:third:keydown')
      .and('not.contain.text', 'root:alpha');
  });
  it('tracks multi-key chords, clears focus transitions and accepts literal minus aliases', () => {
    cy.visit('/model-selector.html?inline&keep&chord');
    cy.get('body')
      .trigger('keydown', { key: 'a', code: 'KeyA' })
      .trigger('keydown', { key: 'b', code: 'KeyB' });
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'item:alpha:keydown|root:alpha:keydown',
    );
    cy.window().then((window) => window.dispatchEvent(new window.FocusEvent('blur')));
    cy.get('body').trigger('keydown', { key: 'b', code: 'KeyB' });
    cy.get('[data-testid="events"]')
      .invoke('text')
      .then((text) => expect(text.split('root:alpha').length).to.equal(2));
    cy.get('body').trigger('keydown', { key: '-', code: 'Minus', ctrlKey: true });
    cy.get('[data-testid="events"]').should('contain.text', 'item:beta:keydown|root:beta:keydown');
  });
  it('reacts to locale changes in title and empty state', () => {
    cy.visit('/model-selector.html');
    cy.contains('button', 'Language').click();
    open();
    cy.get('.sd-modal-title').should('contain.text', 'Select a model');
    input().type('unmatched');
    cy.get('.sd-model-selector-empty').should('have.text', 'No matching models found');
  });
  it('prevents disabled triggers and detaches global shortcut handling after unmount', () => {
    cy.visit('/model-selector.html?trigger-disabled');
    cy.get('.sd-model-selector-trigger')
      .should('have.attr', 'aria-disabled', 'true')
      .click({ force: true });
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.visit('/model-selector.html?inline&keep');
    cy.contains('button', 'Unmount').click();
    cy.get('body').trigger('keydown', { key: '!', code: 'Digit1', altKey: true, shiftKey: true });
    cy.get('[data-testid="events"]').should('have.text', '');
  });
});
