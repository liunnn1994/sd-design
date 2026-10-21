import { h, ref } from 'vue';

import Menu, { MenuItem } from '../index';

describe('Menu responsive subscription', () => {
  it('refreshes after enabling or changing the breakpoint and releases media listeners on unmount', () => {
    cy.viewport(900, 600);
    const breakpoint = ref<'md' | 'lg' | undefined>(undefined);
    const visible = ref(true);
    cy.mount({
      setup: () => () =>
        visible.value
          ? h(Menu, { breakpoint: breakpoint.value }, () =>
              h(MenuItem, { key: 'item' }, () => 'Item'),
            )
          : h('div', { class: 'unmounted' }),
    });
    cy.get('.sd-menu').should('not.have.class', 'sd-menu-collapsed');
    cy.then(() => {
      breakpoint.value = 'lg';
    });
    cy.get('.sd-menu').should('have.class', 'sd-menu-collapsed');
    cy.then(() => {
      breakpoint.value = 'md';
    });
    cy.get('.sd-menu').should('not.have.class', 'sd-menu-collapsed');
    cy.viewport(500, 600);
    cy.get('.sd-menu').should('have.class', 'sd-menu-collapsed');
    cy.then(() => {
      visible.value = false;
    });
    cy.get('.unmounted').should('exist');
    cy.viewport(1200, 600);
    cy.then(() => {
      visible.value = true;
    });
    cy.get('.sd-menu').should('not.have.class', 'sd-menu-collapsed');
  });
});
