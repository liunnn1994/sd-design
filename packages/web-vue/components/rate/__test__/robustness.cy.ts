import Rate from '../index';

describe('Rate robustness', () => {
  for (const prop of ['disabled', 'readonly'] as const) {
    it(`clears a hover preview when ${prop} is enabled`, () => {
      cy.mount(Rate, { props: { modelValue: 2 } });
      cy.get('.sd-rate-character-right').eq(4).trigger('mouseenter', { force: true });
      cy.get('.sd-rate-character-full').should('have.length', 5);
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ [prop]: true }));
      cy.get('.sd-rate-character-full').should('have.length', 2);
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('hoverChange')).to.deep.equal([[5], [0]]);
        expect(wrapper.emitted('change')).to.equal(undefined);
      });
    });
  }
});
