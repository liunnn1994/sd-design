import Divider from '../index';

describe('Divider', () => {
  it('applies the direction class reactively', () => {
    cy.mount(Divider, { props: { direction: 'horizontal' } });
    cy.get('.sd-divider-horizontal').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ direction: 'vertical' })));
    cy.get('.sd-divider-vertical').should('exist');
  });
});
