describe('React Copy', () => {
  beforeEach(() => cy.visit('/copy-secret.html'));

  it('copies through StrictMode, refreshes feedback and inherits localized success messages', () => {
    cy.clock();
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').resolves(),
    );
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledWith', 'test-copy-content');
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('exist');
    cy.contains('.sd-message', 'Copied').should('exist');
    cy.get('[data-testid="copy-events"]').should('contain.text', 'test-copy-content');
    cy.tick(2000);
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledTwice');
    cy.get('[data-testid="copy-events"]').should(
      'have.text',
      '["test-copy-content","test-copy-content"]',
    );
    cy.tick(1000);
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('exist');
    cy.tick(1500);
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('not.exist');
    cy.contains('button', 'Toggle copy language').click();
    cy.get('[data-testid="copy-link"]').should('have.attr', 'aria-label', '复制').click();
    cy.contains('.sd-message', '复制成功').should('exist');
  });

  it('forwards button styling, custom icon and tooltip while suppressing disabled and empty copies', () => {
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').resolves(),
    );
    cy.get('[data-testid="copy-disabled"]').click({ force: true });
    cy.get('[data-testid="copy-empty"]').click();
    cy.get('@copyWrite').should('not.have.been.called');
    cy.get('[data-testid="copy-button"]').should('have.class', 'sd-btn-primary').click();
    cy.get('@copyWrite').should('have.been.calledWith', 'button-content');
    cy.contains('.sd-message', 'Custom success').should('exist');
    cy.get('[data-testid="copy-custom"]')
      .should('not.have.class', 'sd-copy-inherit')
      .should('contain.text', 'Custom icon')
      .trigger('mouseover');
    cy.contains('[role="tooltip"]', 'Override tooltip').should('be.visible');
  });

  it('suppresses async copy completion after unmount and supports remounting', () => {
    let finish: () => void;
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText')
        .callsFake(
          () =>
            new Promise<void>((resolve) => {
              finish = resolve;
            }),
        )
        .as('copyWrite');
    });
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledOnce');
    cy.contains('button', 'Toggle copy mount').click();
    cy.get('[data-testid="copy-link"]')
      .should('not.exist')
      .then(() => finish());
    cy.get('[data-testid="copy-events"]').should('have.text', '[]');
    cy.get('.sd-message').should('not.exist');
    cy.contains('button', 'Toggle copy mount').click();
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite')
      .should('have.been.calledTwice')
      .then(() => finish());
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('exist');
    cy.get('[data-testid="copy-events"]').should('have.text', '["test-copy-content"]');
  });

  it('reports the original content when props change during a pending clipboard write', () => {
    let finish!: () => void;
    cy.window().then((win) => {
      const write = cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite');
      write.resolves();
      write.onFirstCall().callsFake(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
    });
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledOnceWith', 'test-copy-content');
    cy.contains('button', 'Change source').click();
    cy.then(() => finish());
    cy.get('[data-testid="copy-events"]').should('have.text', '["test-copy-content"]');
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledWith', 'updated-copy-content');
    cy.get('[data-testid="copy-events"]').should(
      'have.text',
      '["test-copy-content","updated-copy-content"]',
    );
  });

  it('restores an accessible name when the visible copy label is removed', () => {
    const copy = () => cy.get('[data-testid="copy-label"]');
    copy().should('contain.text', 'Visible copy label').and('not.have.attr', 'aria-label');
    cy.contains('button', 'Toggle visible copy label').click();
    copy().should('have.attr', 'aria-label', 'Copy label');
    cy.contains('button', 'Toggle visible copy label').click();
    copy().should('contain.text', 'Visible copy label').and('not.have.attr', 'aria-label');
  });

  it('does not claim copy success when the clipboard API and fallback both fail', () => {
    const errors: string[] = [];
    cy.on('uncaught:exception', (error) => {
      if (error.message.includes('[sdCopy]')) {
        errors.push(error.message);
        return false;
      }
      return undefined;
    });
    cy.window().then((win) =>
      cy.stub(win.navigator.clipboard, 'writeText').as('copyWrite').rejects(new Error('denied')),
    );
    cy.document().then((doc) => cy.stub(doc, 'execCommand').as('copyFallback').returns(false));
    cy.get('[data-testid="copy-link"]').click();
    cy.get('@copyWrite').should('have.been.calledOnce');
    cy.get('@copyFallback').should('have.been.calledWith', 'copy');
    cy.wrap(errors).should('have.length', 1);
    cy.get('[data-testid="copy-link"] .sd-copy-feedback').should('not.exist');
    cy.get('[data-testid="copy-events"]').should('have.text', '[]');
    cy.get('.sd-message').should('not.exist');
  });
});
