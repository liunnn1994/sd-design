import { defineComponent, h } from 'vue';

import Anchor, { AnchorLink } from '../index';

describe('Anchor literal target IDs', () => {
  beforeEach(() => {
    cy.window().then((win) => win.history.replaceState(null, '', win.location.pathname));
  });

  for (const id of ["anchor'quoted", 'anchor\\slash']) {
    it(`scrolls to ${JSON.stringify(id)} without treating it as CSS syntax`, () => {
      cy.mount(
        defineComponent({
          setup() {
            return () =>
              h('div', [
                h('div', { id: 'literal-anchor-container', style: 'height:180px;overflow:auto' }, [
                  h('section', { style: 'height:200px' }, 'First'),
                  h('section', { id, style: 'height:200px' }, 'Target'),
                ]),
                h(
                  Anchor,
                  {
                    scrollContainer: '#literal-anchor-container',
                    smooth: false,
                    changeHash: false,
                  },
                  () => h(AnchorLink, { href: `#${id}`, title: 'Target' }),
                ),
              ]);
          },
        }),
      );
      cy.get('.sd-anchor-link').click();
      cy.get('#literal-anchor-container').should(($container) => {
        expect($container[0].scrollTop).to.be.closeTo(200, 1);
      });
      cy.get('.sd-anchor-link').should('have.attr', 'aria-current', 'location');
    });
  }
});
