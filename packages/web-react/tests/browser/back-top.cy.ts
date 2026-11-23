describe('React back-top', () => {
  beforeEach(() => cy.visit('/back-top.html'));

  it('tracks BackTop thresholds, supports keyboard activation and removes its leaving content', () => {
    cy.contains('button', 'Instant BackTop').click();
    cy.contains('button', 'Mount BackTop').click();
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('#back-top-first').scrollTo(0, 200);
    cy.get('[data-testid="back-top"] button')
      .should('have.attr', 'aria-label', 'Back to top')
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
    cy.get('#back-top-first').should(($el) => expect($el[0].scrollTop).to.equal(0));
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('[data-testid="back-top-clicks"]').should('have.text', '1');
    cy.get('#back-top-first').scrollTo(0, 300);
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Change BackTop threshold').click();
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.contains('button', 'Change BackTop threshold').click();
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Custom BackTop').click();
    cy.contains('button', 'Instant BackTop').click();
    cy.contains('button', 'Custom return').click();
    cy.get('#back-top-first').should(($el) => expect($el[0].scrollTop).to.equal(0));
    cy.get('[data-testid="back-top-clicks"]').should('have.text', '2');
  });

  it('rebinds BackTop targets and detaches listeners on unmount', () => {
    cy.contains('button', 'Mount BackTop').click();
    cy.get('#back-top-first')
      .scrollTo(0, 300)
      .then(($el) => {
        cy.spy($el[0], 'removeEventListener').as('backTopOldOff');
      });
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Switch BackTop target').click();
    cy.get('@backTopOldOff').should('have.been.calledWith', 'scroll');
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('#back-top-second')
      .scrollTo(0, 300)
      .then(($el) => {
        cy.spy($el[0], 'removeEventListener').as('backTopOff');
      });
    cy.get('[data-testid="back-top"]').should('be.visible');
    cy.contains('button', 'Unmount BackTop').click();
    cy.get('@backTopOff').should('have.been.calledWith', 'scroll');
    cy.get('[data-testid="back-top"]').should('not.exist');
  });

  it('returns immediately when BackTop inherits reduced-motion preference', () => {
    cy.window().then((win) => {
      const original = win.matchMedia.bind(win);
      cy.stub(win, 'matchMedia').callsFake((query) => {
        const media = original(query);
        if (query === '(prefers-reduced-motion: reduce)')
          Object.defineProperty(media, 'matches', { value: true });
        return media;
      });
    });
    cy.contains('button', /^Mount BackTop$/).click({ scrollBehavior: 'center' });
    cy.get('#back-top-first').scrollTo(0, 300);
    cy.get('[data-testid="back-top"] button')
      .should('be.visible')
      .then(($button) => {
        $button[0].click();
        expect($button[0].ownerDocument.querySelector('#back-top-first')?.scrollTop).to.equal(0);
      });
    cy.get('[data-testid="back-top"]').should('not.exist');
  });

  it('cancels BackTop scrolling when unmounted during an animation', () => {
    cy.contains('button', 'Mount BackTop').click();
    cy.get('#back-top-first').scrollTo(0, 300);
    cy.get('[data-testid="back-top"] button')
      .should('be.visible')
      .then(($button) => {
        $button[0].click();
        Array.from($button[0].ownerDocument.querySelectorAll('button'))
          .find((button) => button.textContent === 'Unmount BackTop')
          ?.click();
      });
    cy.get('[data-testid="back-top"]').should('not.exist');
    cy.get('#back-top-first').then(($target) => {
      const position = $target[0].scrollTop;
      expect(position).to.be.greaterThan(0);
      cy.wait(250).then(() => expect($target[0].scrollTop).to.equal(position));
    });
  });
});
