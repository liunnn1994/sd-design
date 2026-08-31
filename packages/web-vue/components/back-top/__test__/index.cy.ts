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
      .and('have.attr', 'type', 'button')
      .focus()
      .should('have.css', 'box-shadow')
      .and('not.equal', 'none');
    cy.get('.sd-back-top').should('have.css', 'z-index', '999');
  });

  it('scrolls immediately when reduced motion is preferred', () => {
    let scrollTop = 500;

    cy.window().then((win) => {
      cy.stub(win, 'matchMedia').returns({ matches: true } as MediaQueryList);
      Object.defineProperty(win.document.documentElement, 'scrollTop', {
        configurable: true,
        get: () => scrollTop,
        set: (value) => {
          scrollTop = value;
        },
      });
    });

    cy.mount(BackTop);
    cy.window().then((win) => win.dispatchEvent(new win.Event('scroll')));
    cy.get('.sd-back-top-btn').click();
    cy.then(() => expect(scrollTop).to.equal(0));
  });
});
