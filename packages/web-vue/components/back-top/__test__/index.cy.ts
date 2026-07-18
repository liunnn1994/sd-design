import BackTop from '../index';

describe('BackTop', () => {
  it('renders an icon button with an accessible name once visible', () => {
    cy.mount(BackTop);
    // simulate scrolling past visibleHeight so the back-top control mounts
    cy.window().then((win) => {
      Object.defineProperty(win.document.documentElement, 'scrollTop', {
        configurable: true,
        get: () => 500,
      });
      win.dispatchEvent(new win.Event('scroll'));
    });
    cy.get('.sd-back-top-btn')
      .should('have.attr', 'aria-label', '回到顶部')
      .and('have.attr', 'type', 'button');
  });
});
