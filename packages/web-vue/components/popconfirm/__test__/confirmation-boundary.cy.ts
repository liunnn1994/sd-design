import Popconfirm from '../popconfirm.vue';

describe('Popconfirm confirmation boundaries', () => {
  it('blocks a synchronously thrown confirmation and allows a successful retry', () => {
    let attempts = 0;
    cy.mount(Popconfirm, {
      props: {
        defaultPopupVisible: true,
        renderToBody: false,
        onBeforeOk: () => {
          if (attempts++ === 0) throw new Error('Confirmation unavailable');
          return true;
        },
      },
      slots: { default: '<button>Open</button>' },
    });
    cy.get('.sd-popconfirm-footer button').last().click();
    cy.then(() => Cypress.Promise.delay(0));
    cy.get('.sd-popconfirm-popup-content').should('be.visible');
    cy.get('.sd-popconfirm-footer button').last().should('not.have.class', 'sd-btn-loading');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.equal(undefined);
    });
    cy.get('.sd-popconfirm-footer button').last().click();
    cy.get('.sd-popconfirm-popup-content').should('not.be.visible');
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
  });
});
