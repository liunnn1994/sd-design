import Popconfirm from '../index';

describe('Popconfirm', () => {
  it('emits ok/cancel events', () => {
    cy.mount(Popconfirm, {
      props: { content: 'Content', defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('.sd-btn').eq(0).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('cancel')).to.have.length(1);
    });
    cy.get('.sd-btn').eq(1).click({ force: true });
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('ok')).to.have.length(1);
    });
  });
});
