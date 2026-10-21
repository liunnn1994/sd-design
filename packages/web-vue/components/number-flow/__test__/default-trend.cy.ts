import NumberFlow, { continuous } from '../index';

describe('NumberFlow default trend', () => {
  for (const [from, to, start, end] of [
    [100, 200, '0', '-10'],
    [200, 100, '-10', '0'],
  ] as const) {
    it(`keeps continuous lower digits when the value changes from ${from} to ${to}`, () => {
      cy.clock();
      cy.mount(NumberFlow, {
        props: { value: from, plugins: [continuous], respectMotionPreference: false },
      });
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ value: to }));
      cy.get('.sd-number-flow-animating').should('exist');
      cy.get('.sd-number-flow-digit-track').last().children().should('have.length', 11);
      cy.get('.sd-number-flow-part').last().should('have.css', '--sd-number-flow-start', start);
      cy.get('.sd-number-flow-part').last().should('have.css', '--sd-number-flow-end', end);
    });
  }
});
