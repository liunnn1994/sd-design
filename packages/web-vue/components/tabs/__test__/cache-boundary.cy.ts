import { defineComponent, h, ref } from 'vue';

import Tabs, { TabPane } from '../index';

describe('Tabs content cache lifetime', () => {
  it('starts a fresh inactive content cache when its scrollbar wrapper is replaced', () => {
    cy.mount(
      defineComponent({
        setup() {
          const value = ref(0);
          const fullHeight = ref(false);
          return () =>
            h('div', [
              h('button', { 'data-test': 'update', 'onClick': () => value.value++ }, 'Update'),
              h(
                'button',
                {
                  'data-test': 'wrapper',
                  'onClick': () => {
                    fullHeight.value = !fullHeight.value;
                  },
                },
                'Toggle wrapper',
              ),
              h(
                Tabs,
                { fullHeight: fullHeight.value, style: 'height: 200px; width: 400px' },
                {
                  default: () =>
                    ['a', 'b'].map((key) =>
                      h(TabPane, { key, title: key }, () =>
                        h('span', { 'data-test': `cache-${key}` }, String(value.value)),
                      ),
                    ),
                },
              ),
            ]);
        },
      }),
    );
    cy.get('[data-test="cache-b"]').should('have.text', '0');
    cy.get('[data-test="update"]').click();
    cy.get('[data-test="cache-a"]').should('have.text', '1');
    cy.get('[data-test="cache-b"]').should('have.text', '0');
    cy.get('[data-test="wrapper"]').click();
    cy.get('.sd-tabs-pane-scrollbar').should('exist');
    cy.get('[data-test="cache-b"]').should('have.text', '1');
    cy.get('[data-test="update"]').click();
    cy.get('[data-test="cache-b"]').should('have.text', '1');
    cy.get('[data-test="wrapper"]').click();
    cy.get('.sd-tabs-pane-scrollbar').should('not.exist');
    cy.get('[data-test="cache-b"]').should('have.text', '2');
  });
});
