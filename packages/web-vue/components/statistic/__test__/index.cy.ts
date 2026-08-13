import Statistic, { Countdown } from '../index';

describe('Statistic', () => {
  it('renders numeric values with NumberFlow and enables animation by default', () => {
    cy.mount(Statistic, { props: { value: 1234.5, precision: 1, showGroupSeparator: true } });
    cy.get('.sd-statistic-value .sd-number-flow')
      .should('have.class', 'sd-number-flow-animated')
      .and('have.attr', 'aria-label', '1,234.5');
  });

  it('can disable numeric animation', () => {
    cy.mount(Statistic, { props: { value: 42, animation: false } });
    cy.get('.sd-statistic-value .sd-number-flow').should(
      'not.have.class',
      'sd-number-flow-animated',
    );
  });
});

describe('Countdown', () => {
  it('renders numeric parts with NumberFlow and can disable animation', () => {
    const now = Date.now();
    cy.mount(Countdown, {
      props: {
        value: now + 5000,
        now,
        start: false,
        animation: false,
        format: 'mm:ss.SSS',
      },
    });

    cy.get('.sd-statistic-value .sd-number-flow').should('have.length.greaterThan', 0);
    cy.get('.sd-statistic-value .sd-number-flow-animated').should('not.exist');
  });
});
