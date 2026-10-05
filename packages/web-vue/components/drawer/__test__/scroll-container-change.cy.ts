import { defineComponent, h, ref } from 'vue';

import Drawer from '../drawer.vue';

describe('Drawer scroll container changes', () => {
  it('moves its scroll lock with an open drawer and restores both containers', () => {
    const target = ref('#scroll-a');
    const mounted = ref(true);
    const styles = [
      { height: '100px', overflow: 'auto' },
      { height: '100px', overflow: 'auto' },
    ];
    cy.mount(
      defineComponent({
        setup: () => () => [
          ...['scroll-a', 'scroll-b'].map((id, index) =>
            h(
              'div',
              { id, style: styles[index] },
              h('div', { style: { height: '500px' } }, 'Content'),
            ),
          ),
          mounted.value ? h(Drawer, { visible: true, popupContainer: target.value }) : null,
        ],
      }),
    );
    cy.get('#scroll-a').should('have.css', 'overflow', 'hidden');
    cy.then(() => {
      target.value = '#scroll-b';
    });
    cy.get('#scroll-b .sd-drawer').should('exist');
    cy.get('#scroll-a').should('have.css', 'overflow', 'auto');
    cy.get('#scroll-b').should('have.css', 'overflow', 'hidden');
    cy.then(() => {
      mounted.value = false;
    });
    cy.get('#scroll-b').should('have.css', 'overflow', 'auto');
  });
});
