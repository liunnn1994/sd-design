import Popover from '../index';

describe('Popover', () => {
  it('wires aria-haspopup/expanded on the trigger and closes on ESC', () => {
    cy.mount(Popover, {
      props: {
        trigger: 'click',
        content: 'Popup content',
        defaultPopupVisible: true,
        renderToBody: false,
      },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('button').should('have.attr', 'aria-haspopup', 'true');
    cy.get('button').should('have.attr', 'aria-expanded', 'true');
    // ESC 关闭（aria-expanded 翻 false）
    cy.document().trigger('keydown', { key: 'Escape' });
    cy.get('button').should('have.attr', 'aria-expanded', 'false');
  });
});
