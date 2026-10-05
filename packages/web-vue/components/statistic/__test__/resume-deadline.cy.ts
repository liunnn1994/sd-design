import { Countdown } from '../index';

describe('Countdown resume after deadline', () => {
  it('finishes when resumed after the deadline and does not finish twice', () => {
    cy.clock(10000);
    cy.mount(Countdown, { props: { now: 10000, value: 11000, start: false, format: 'ss' } });
    cy.get('.sd-number-flow').should('have.attr', 'aria-label', '01');
    cy.tick(2000);
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ start: true }));
    cy.get('.sd-number-flow').should('have.attr', 'aria-label', '00');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('finish')).to.have.length(1);
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ start: false }));
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ start: true }));
    cy.tick(100);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('finish')).to.have.length(1);
    });
  });
});
