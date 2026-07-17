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

  it('exposes role=alert, aria-hidden icon, and a keyboard-operable close button', () => {
    cy.mount(Alert, { props: { closable: true, type: 'info' } });
    cy.get('.sd-alert').should('have.attr', 'role', 'alert');
    cy.get('.sd-alert-icon').should('have.attr', 'aria-hidden', 'true');
    // 关闭按钮键盘可达：tabindex=0，Enter 触发关闭
    cy.get('.sd-alert-close-btn').should('have.attr', 'tabindex', '0');
    cy.get('.sd-alert-close-btn').trigger('keydown', { key: 'Enter' });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('close')).to.have.length(1);
    });
  });
});
