describe('React Toolbar', () => {
  const name = () => cy.get('input[placeholder="请输入Name"]');
  it('runs schema layout and search through click, Enter and the public ref', () => {
    cy.visit('/toolbar.html');
    name().should('have.value', 'Initial');
    cy.get('.sd-form-item').first().should('have.css', 'grid-column', 'span 2');
    cy.get('[data-testid="custom"]').should('have.text', 'Slot:custom');
    cy.get('[data-testid="leak"]').should('not.exist');
    name().clear().type('Ada{enter}');
    cy.get('[data-testid="snapshot"]').should('contain.text', '"name":"Ada"');
    cy.contains('.sd-toolbar button', '查询').click();
    cy.contains('button', 'Ref search').click();
    cy.get('[data-testid="events"]')
      .invoke('text')
      .then((text) =>
        expect(text.split('|').filter((item) => item === 'search')).to.have.length(3),
      );
  });
  it('restores deep initial values repeatedly, preserves skip keys and removes added fields', () => {
    cy.visit('/toolbar.html');
    cy.contains('button', 'Replace model').click();
    name().should('have.value', 'Edited');
    cy.contains('.sd-toolbar button', '重置').click();
    name().should('have.value', 'Initial');
    cy.get('input[placeholder="请输入Keep"]').should('have.value', 'preserved');
    name().clear().type('Again');
    cy.contains('button', 'Silent reset').click();
    name().should('have.value', 'Initial');
    cy.contains('button', 'Read model').click();
    cy.get('[data-testid="snapshot"]').should(
      'have.text',
      '{"filter":{"name":"Initial"},"keep":"preserved"}',
    );
    cy.get('[data-testid="events"]')
      .invoke('text')
      .then((text) => expect(text.split('|').filter((item) => item === 'reset')).to.have.length(1));
  });
  it('edits and resets an uncontrolled toolbar', () => {
    cy.visit('/toolbar.html?uncontrolled');
    name().clear().type('Local');
    cy.contains('button', 'Ref search').click();
    cy.get('[data-testid="snapshot"]').should('contain.text', '"name":"Local"');
    cy.contains('.sd-toolbar button', '重置').click();
    name().should('have.value', 'Initial');
  });
  it('measures collapsed content, expands it and reacts to responsive width changes', () => {
    cy.viewport(1200, 800);
    cy.visit('/toolbar.html');
    cy.get('.sd-toolbar-body').should('have.css', 'max-height', '32px');
    cy.contains('.sd-toolbar-expand', '展开').click();
    cy.get('.sd-toolbar-expand-icon--up').should('exist');
    cy.get('.sd-toolbar-body').should(($body) =>
      expect(parseFloat($body.css('max-height'))).to.be.greaterThan(32),
    );
    cy.contains('.sd-toolbar-expand', '收起').click();
    cy.contains('button', 'Resize').click();
    cy.get('.sd-toolbar-body').should('have.css', 'max-height', '32px');
    cy.contains('.sd-toolbar-expand', '展开').should('be.visible');
  });
  it('resolves provider/local loading options and live locale with explicit text overrides', () => {
    cy.visit('/toolbar.html?loading&local-spin&text');
    cy.get('.sd-toolbar-inner').should('have.attr', 'aria-busy', 'true');
    cy.get('.sd-dot-loading').should('exist');
    cy.get('.sd-spin-tip').should('have.text', 'Local loading');
    cy.contains('button', 'Language').click();
    cy.contains('.sd-toolbar button', 'Go').should('exist');
    cy.contains('.sd-toolbar button', 'Reset').should('exist');
  });
  it('uses explicit action content and honors action visibility', () => {
    cy.visit('/toolbar.html?extra');
    cy.get('[data-testid="extra"]').should('exist');
    cy.get('.sd-toolbar-actions button, [data-testid="prepend"], [data-testid="append"]').should(
      'not.exist',
    );
    cy.contains('button', 'Actions').click();
    cy.get('.sd-toolbar-actions').should('not.exist');
  });
  it('composes polymorphic search buttons without double-searching on Enter', () => {
    cy.visit('/toolbar.html?anchor');
    cy.contains('.sd-toolbar-actions a', '查询')
      .click()
      .focus()
      .trigger('keydown', { key: 'Enter' });
    cy.get('[data-testid="events"]').should('have.text', 'button|search');
  });
  it('lets manual content override schema fields and skips Enter in editing/action targets', () => {
    cy.visit('/toolbar.html?children');
    name().should('not.exist');
    cy.get('[data-testid="manual-input"]').type('{enter}');
    for (const selector of [
      '[data-testid="manual-textarea"]',
      '[data-testid="manual-editable"]',
      '.sd-toolbar-body button',
      '.sd-toolbar-body a',
    ]) {
      cy.get(selector).trigger('keydown', { key: 'Enter' });
    }
    cy.get('[data-testid="manual-input"]').trigger('keydown', { key: 'Enter', isComposing: true });
    cy.get('[data-testid="events"]').should('have.text', 'search');
  });
});
