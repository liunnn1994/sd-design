import Anchor from '../index';

describe('Anchor initial URL hash', () => {
  afterEach(() => {
    cy.window().then((win) => {
      win.history.replaceState(null, '', win.location.pathname + win.location.search);
    });
  });

  for (const [hash, href] of [
    ['#section%', '#section%'],
    ['#%E4%B8%AD%E6%96%87', '#中文'],
  ]) {
    it(`initializes navigation for ${hash}`, () => {
      cy.window().then((win) => {
        win.history.replaceState(null, '', hash);
      });
      cy.mount(Anchor, {
        props: { smooth: false },
        slots: { default: `<sd-anchor-link href="${href}">Section</sd-anchor-link>` },
      });
      cy.get('a').should('have.attr', 'aria-current', 'location');
      cy.get('@vue').should(({ wrapper }) => {
        expect(wrapper.emitted('change')?.[0]).to.deep.equal([href]);
      });
    });
  }
});
