import Copy from '../index';

describe('Copy trigger props', () => {
  it('preserves default link ellipsis and allows it to be disabled', () => {
    cy.mount(Copy, { slots: { default: 'Copy content' } });
    cy.get('.sd-copy .sd-ellipsis').should('exist');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ ellipsis: false }));
    cy.get('.sd-copy .sd-ellipsis').should('not.exist');
  });

  it('forwards button appearance and native type', () => {
    cy.mount(Copy, {
      props: { component: 'button', type: 'primary', size: 'mini', htmlType: 'submit' },
    });
    cy.get('.sd-copy')
      .should('have.class', 'sd-btn-primary')
      .and('have.class', 'sd-btn-size-mini')
      .and('have.attr', 'type', 'submit');
  });

  it('forwards link href and status', () => {
    cy.mount(Copy, { props: { href: '#copy-target', status: 'danger' } });
    cy.get('.sd-copy')
      .should('have.attr', 'href', '#copy-target')
      .and('have.class', 'sd-link-status-danger');
  });

  it('blocks copying while the trigger is loading and reacts to updates', () => {
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, 'writeText').resolves().as('writeText');
    });
    cy.mount(Copy, { props: { content: 'copy-content', loading: true } });
    cy.get('.sd-copy').click();
    cy.get('@writeText').should('not.have.been.called');
    cy.get('.sd-copy').should('have.class', 'sd-link-loading');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ loading: false }));
    cy.get('.sd-copy').should('not.have.class', 'sd-link-loading');
  });
});
