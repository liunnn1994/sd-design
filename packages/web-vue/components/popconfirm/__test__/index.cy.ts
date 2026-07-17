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

  it('wires aria-haspopup=dialog and aria-expanded on the trigger', () => {
    cy.mount(Popconfirm, {
      props: { content: 'Content', defaultPopupVisible: true, renderToBody: false },
      slots: { default: '<button>Button</button>' },
    });
    cy.get('button').should('have.attr', 'aria-haspopup', 'dialog');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
  });
});
