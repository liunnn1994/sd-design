import Switch from '../index';

describe('Switch automatic loading ownership', () => {
  for (const props of [{ autoLoading: false }, { loading: false }]) {
    it(`stops pending automatic loading when ${JSON.stringify(props)} is applied`, () => {
      cy.mount(Switch, { props: { modelValue: false, autoLoading: true } });
      cy.get('button').click();
      cy.get('button').should('have.class', 'sd-switch-loading');
      cy.get('@vue').then(({ wrapper }) => wrapper.setProps(props));
      cy.get('button').should('not.have.class', 'sd-switch-loading');
    });
  }
});
