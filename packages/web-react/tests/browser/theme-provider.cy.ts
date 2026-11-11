describe('React ThemeProvider public adapter', () => {
  it('loads the standalone provider layout and detached popup positioning', () => {
    cy.visit('/theme-provider.html');
    cy.get('#theme-root').should('have.css', 'min-width', '0px');
    cy.get('.sd-theme-popup-container')
      .should('have.css', 'position', 'fixed')
      .and('have.css', 'top', '0px')
      .and('have.css', 'left', '0px')
      .and('have.css', 'height', '0px')
      .and('have.css', 'pointer-events', 'none');
    cy.get('.sd-theme-popup-container').should(($node) => {
      expect($node[0].getBoundingClientRect().width).to.equal(
        $node[0].ownerDocument.defaultView!.innerWidth,
      );
    });
  });
  it('renders custom tags, native attributes and configured prefixes', () => {
    cy.visit('/theme-provider.html?prefix');
    cy.get('section#theme-root')
      .should('have.class', 'custom-theme-provider')
      .and('have.class', 'extra')
      .and('have.attr', 'aria-label', 'Themed area')
      .and('have.css', 'padding', '12px');
    cy.get('.custom-theme-popup-container')
      .should('have.length', 1)
      .and('have.attr', 'sd-theme', 'light');
    cy.get('.sd-theme-popup-container').should('not.exist');
  });
  it('cleans the detached theme target and applies variables to the replacement tag', () => {
    cy.visit('/theme-provider.html');
    cy.get('#theme-root').then(($root) => {
      const original = $root[0];
      cy.contains('button', 'Tag').click();
      cy.get('article#theme-root').should('have.attr', 'sd-theme', 'light');
      cy.wrap({ original }).should(({ original }) => {
        expect(original.isConnected).to.equal(false);
        expect(original.style.getPropertyValue('--color-primary-6')).to.equal('');
        expect(original.hasAttribute('sd-theme')).to.equal(false);
      });
    });
    cy.get('.sd-theme-popup-container').should('have.length', 1);
    cy.contains('button', 'Mode').click();
    cy.get('article#theme-root').should('have.attr', 'sd-theme', 'dark');
    cy.get('.sd-theme-popup-container').should('have.attr', 'sd-theme', 'dark');
  });
  it('prunes old token overrides on root and popup then disposes the popup', () => {
    cy.visit('/theme-provider.html');
    cy.contains('button', 'Tokens').click();
    cy.get('#theme-root, .sd-theme-popup-container').each(($node) => {
      expect($node[0].style.getPropertyValue('--color-primary-6')).to.equal('#abcdef');
      expect($node[0].style.getPropertyValue('--color-text-2')).not.to.equal('#234567');
    });
    cy.contains('button', 'Mount').click();
    cy.get('.sd-theme-popup-container').should('not.exist');
  });
  it('passes children through without a local theme container', () => {
    cy.visit('/theme-provider.html?plain');
    cy.get('[data-testid="content"]').should('be.visible');
    cy.get('#theme-root, .sd-theme-provider, .sd-theme-popup-container').should('not.exist');
  });
  it('inherits ambient mode and merges nested popup tokens', () => {
    cy.visit('/theme-provider.html?inherited&nested');
    cy.get('#theme-root').should('have.attr', 'data-sd-theme', 'light');
    cy.document().then((document) => document.body.setAttribute('sd-theme', 'dark'));
    cy.get('#theme-root').should('have.attr', 'data-sd-theme', 'dark');
    cy.get('.sd-theme-popup-container')
      .should('have.length', 2)
      .each(($node) => {
        expect($node.attr('sd-theme')).to.equal('dark');
        expect($node[0].style.getPropertyValue('--color-primary-6')).to.equal('#123456');
      });
    cy.get('.sd-theme-popup-container').should(($nodes) => {
      expect(
        $nodes
          .toArray()
          .some((node) => node.style.getPropertyValue('--color-text-1') === '#345678'),
      ).to.equal(true);
    });
  });
  it('restores the global target on unmount without rendering a local wrapper', () => {
    cy.visit('/theme-provider.html?global');
    cy.get('body').should('have.attr', 'sd-theme', 'light');
    cy.get('#theme-root, .sd-theme-popup-container').should('not.exist');
    cy.contains('button', 'Mode').click();
    cy.get('body').should('have.attr', 'sd-theme', 'dark');
    cy.contains('button', 'Mount').click();
    cy.get('body').should('not.have.attr', 'sd-theme');
  });
});
