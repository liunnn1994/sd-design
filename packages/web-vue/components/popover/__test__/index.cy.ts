import Popover from '../index';

describe('Popover', () => {
  it('keeps the bordered arrow behind the popup content', () => {
    cy.mount(Popover, {
      props: {
        content: 'Popup content',
        defaultPopupVisible: true,
        position: 'bottom',
        renderToBody: false,
      },
      attrs: { style: 'max-width: 240px;' },
      slots: { default: '<button>Trigger</button>' },
    });
    cy.get('.sd-trigger-popup.sd-popover')
      .should('have.css', 'position', 'absolute')
      .and('have.css', 'max-width', '240px');
    cy.get('.sd-popover-popup-arrow')
      .should('have.css', 'z-index', '-1')
      .and(($arrow) => {
        const style = getComputedStyle($arrow[0]);
        const borderStyles = [
          style.borderTopStyle,
          style.borderRightStyle,
          style.borderBottomStyle,
          style.borderLeftStyle,
        ];
        expect(borderStyles.filter((value) => value === 'none')).to.have.length(2);
      });
  });

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
