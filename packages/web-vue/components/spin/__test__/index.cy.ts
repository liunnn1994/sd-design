import Spin from '../index';

describe('Spin', () => {
  it('exposes role=status / aria-live and hides the decorative icon', () => {
    cy.mount(Spin, { props: { tip: 'Loading data' } });
    cy.get('.sd-spin').should('have.attr', 'role', 'status');
    cy.get('.sd-spin').should('have.attr', 'aria-live', 'polite');
    cy.get('.sd-spin-icon').should('have.attr', 'aria-hidden', 'true');
    cy.get('.sd-spin-tip').should('contain', 'Loading data');
  });
});
