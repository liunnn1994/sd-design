describe('React theme-provider-lifecycle', () => {
  beforeEach(() => cy.visit('/'));

  it('updates local theme and removes the popup theme container on unmount', () => {
    cy.get('[data-testid="local-theme"] .sd-theme-provider').should(
      'have.attr',
      'sd-theme',
      'light',
    );
    cy.get('.sd-theme-popup-container').then(($containers) => {
      const count = $containers.length;
      const targets = $containers
        .toArray()
        .filter((element) => element.style.getPropertyValue('--color-primary-6') === '#123456');
      expect(targets, 'owned local theme popup containers').to.have.length(1);
      const target = targets[0];
      cy.wrap(target).should('have.attr', 'sd-theme', 'light');
      cy.contains('button', '切换局部主题').click();
      cy.get('[data-testid="local-theme"] .sd-theme-provider').should(
        'have.attr',
        'sd-theme',
        'dark',
      );
      cy.wrap(target).should('have.attr', 'sd-theme', 'dark');
      cy.contains('button', '卸载局部主题').click();
      cy.wrap({ target }).should(({ target }) => expect(target.isConnected).to.equal(false));
      cy.get('.sd-theme-popup-container').should('have.length', count - 1);
    });
  });

  it('observes ambient theme after StrictMode replay and restores global mode on unmount', () => {
    cy.get('[data-testid="inherited-theme"] .sd-theme-provider').should(
      'have.attr',
      'data-sd-theme',
      'light',
    );
    cy.document().then((document) => document.body.setAttribute('sd-theme', 'dark'));
    cy.get('[data-testid="inherited-theme"] .sd-theme-provider').should(
      'have.attr',
      'data-sd-theme',
      'dark',
    );
    cy.document().then((document) => document.body.removeAttribute('sd-theme'));
    cy.get('[data-testid="inherited-theme"] .sd-theme-provider').should(
      'have.attr',
      'data-sd-theme',
      'light',
    );
    cy.contains('button', '切换全局主题').click();
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.contains('button', '切换全局主题').click();
    cy.get('body').should('not.have.attr', 'sd-theme');
  });
});
