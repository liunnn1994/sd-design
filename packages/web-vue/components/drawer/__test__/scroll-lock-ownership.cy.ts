import { defineComponent, h, ref } from 'vue';

import Drawer from '../drawer.vue';

describe('Drawer scroll lock ownership', () => {
  for (const first of [0, 1]) {
    it(`keeps the shared container locked when drawer ${first} closes first`, () => {
      const visible = [ref(true), ref(true)];
      const containerStyle = { height: '100px', overflow: 'auto' };
      cy.mount(
        defineComponent({
          setup: () => () =>
            h('div', { id: 'scroll-container', style: containerStyle }, [
              h('div', { style: { height: '500px' } }, 'Scrollable content'),
              ...visible.map((value, index) =>
                h(Drawer, {
                  key: index,
                  visible: value.value,
                  popupContainer: '#scroll-container',
                }),
              ),
            ]),
        }),
        { global: { stubs: { 'transition': false, 'transition-group': false } } },
      );
      cy.get('#scroll-container').should('have.css', 'overflow', 'hidden');
      cy.then(() => {
        visible[first].value = false;
      });
      cy.get('.sd-drawer').eq(first).should('not.be.visible');
      cy.get('#scroll-container').should('have.css', 'overflow', 'hidden');
      cy.then(() => {
        visible[1 - first].value = false;
      });
      cy.get('#scroll-container').should('have.css', 'overflow', 'auto');
    });
  }
});
