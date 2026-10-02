import NumberFlow from '../index';

describe('NumberFlow localized digits', () => {
  for (const numberingSystem of ['arab', 'hanidec', 'mathsans']) {
    it(`preserves ${numberingSystem} digits before, during and after animation`, () => {
      const format = { numberingSystem, useGrouping: false, minimumFractionDigits: 1 };
      const formatter = new Intl.NumberFormat('en', format);
      cy.clock();
      cy.mount(NumberFlow, {
        props: { value: 98.5, locales: 'en', format, respectMotionPreference: false },
      });
      cy.get('.sd-number-flow-content').should('have.text', formatter.format(98.5));
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ value: 100.5 }));
      cy.get('.sd-number-flow-animating').should('exist');
      cy.get('.sd-number-flow-content').should('not.contain.text', 'NaN');
      cy.get('.sd-number-flow-digit-value').should(($digits) => {
        const alphabet = new Set(
          Array.from(
            new Intl.NumberFormat('en', {
              numberingSystem,
              useGrouping: false,
            }).format(9876543210),
          ),
        );
        for (const digit of $digits) expect(alphabet.has(digit.textContent ?? '')).to.equal(true);
      });
      cy.tick(1000);
      cy.get('.sd-number-flow-content').should('have.text', formatter.format(100.5));
      cy.get('.sd-number-flow').should('have.attr', 'aria-label', formatter.format(100.5));
    });
  }
});
