describe('React NumberFlow', () => {
  beforeEach(() => cy.visit('/number-flow.html'));

  it('synchronizes changed number-flow group members and leaves unchanged members idle', () => {
    cy.get('[data-testid="group-first"]').should('have.class', 'sd-number-flow-animated');
    cy.contains('button', '增加数值').click();
    cy.get('[data-testid="number-group"]').should(($group) => {
      expect($group.find('.sd-number-flow-animating')).to.have.length(2);
      expect($group.find('[data-testid="group-unchanged"]')).not.to.have.class(
        'sd-number-flow-animating',
      );
    });
    cy.get('[data-testid="group-first"]').should('have.attr', 'aria-label', '10');
    cy.get('[data-testid="group-second"]').should('have.attr', 'aria-label', '20');
    cy.get('[data-testid="number-group"] .sd-number-flow-animating').should('not.exist');
  });

  it('cancels the prior number-flow completion timer when a new value arrives', () => {
    cy.get('[data-testid="number-flow"]').should('have.class', 'sd-number-flow-animated');
    cy.clock();
    cy.contains('button', '增加数值').click();
    cy.tick(100);
    cy.contains('button', '增加数值').click();
    cy.tick(51);
    cy.get('[data-testid="number-events"]').should('have.text', 'SS');
    cy.get('[data-testid="number-flow"]')
      .should('have.attr', 'aria-label', '11')
      .should('have.class', 'sd-number-flow-animating');
    cy.tick(100);
    cy.get('[data-testid="number-events"]').should('have.text', 'SSF');
  });

  it('animates changed digits and finishes without animating disabled instances', () => {
    cy.get('[data-testid="number-flow"]').should('have.class', 'sd-number-flow-animated');
    cy.clock();
    cy.contains('button', '增加数值').click();
    cy.get('[data-testid="number-flow"]')
      .should('have.attr', 'aria-label', '10')
      .should('have.class', 'sd-number-flow-animating');
    cy.get('[data-testid="number-flow"] .sd-number-flow-digit-value').should(
      'have.length.greaterThan',
      2,
    );
    cy.get('[data-testid="static-number-flow"]')
      .should('have.attr', 'aria-label', '10')
      .should('not.have.class', 'sd-number-flow-animating');
    cy.tick(151);
    cy.get('[data-testid="number-flow"]').should('not.have.class', 'sd-number-flow-animating');
    cy.get('[data-testid="number-events"]').should('have.text', 'SF');
    cy.get('[data-testid="number-flow"] .sd-number-flow-digit-value').should('have.length', 2);
  });

  it('formats signed numeric strings and keeps custom visual content out of the accessible name', () => {
    const flow = () => cy.get('[data-testid="formatted-flow"]');
    flow().should('have.attr', 'aria-label', '-1,234.50');
    flow().find('.sd-number-flow-sign').should('contain.text', '-');
    flow().find('.sd-number-flow-content').should('have.attr', 'aria-hidden', 'true');
    flow()
      .find('.sd-number-flow-custom-prefix')
      .should('have.text', 'Decorative prefix')
      .and('have.attr', 'aria-hidden', 'true');
    flow().should('not.contain.text', 'ignored');
    cy.contains('label', 'Formatted number').find('input').clear().type('invalid');
    flow().should('have.attr', 'aria-label', '0.00');
  });

  it('scopes styles to the instance with its nonce and clears the will-change hint', () => {
    const flow = () => cy.get('[data-testid="formatted-flow"]');
    flow().find('style').should('have.prop', 'nonce', 'example-nonce');
    flow().should('have.class', 'sd-number-flow-will-change');
    cy.contains('button', 'Toggle will-change').click();
    flow().should('not.have.class', 'sd-number-flow-will-change');
  });

  it('honors a reduced-motion preference while explicit opt-out still animates', () => {
    cy.visit('/number-flow.html', {
      onBeforeLoad(win) {
        const matchMedia = win.matchMedia.bind(win);
        cy.stub(win, 'matchMedia').callsFake((query: string) =>
          query === '(prefers-reduced-motion: reduce)'
            ? { matches: true, addEventListener() {}, removeEventListener() {} }
            : matchMedia(query),
        );
      },
    });
    cy.clock();
    cy.contains('button', '增加数值').click();
    cy.get('[data-testid="motion-flow"]').should('have.attr', 'aria-label', '10');
    cy.get('[data-testid="motion-flow"]').should('not.have.class', 'sd-number-flow-animating');
    cy.get('[data-testid="number-flow"]').should('have.class', 'sd-number-flow-animating');
  });
});
