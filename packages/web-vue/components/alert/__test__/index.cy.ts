import Alert from '../index';

describe('Alert', () => {
  it('should emit close event', () => {
    cy.mount(Alert, { props: { closable: true } });
    cy.get('.sd-alert-close-btn').click();
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });

  it('should apply type classes reactively', () => {
    cy.mount(Alert, { props: { type: 'info' } });
    cy.get('.sd-alert-info').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ type: 'success' })));
    cy.get('.sd-alert-success').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ type: 'warning' })));
    cy.get('.sd-alert-warning').should('exist');
    cy.get('@vue').then(({ wrapper }) => cy.wrap(wrapper.setProps({ type: 'error' })));
    cy.get('.sd-alert-error').should('exist');
  });
});
