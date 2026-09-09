import { defineComponent, h, ref } from 'vue';

import Grid, { GridItem } from '../index';

describe('Grid dynamic item collection', () => {
  it('recalculates collapsed content after deleting and reordering keyed items', () => {
    const items = ref(['A', 'B', 'C']);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Grid,
            { cols: 3, collapsed: true },
            {
              default: () => [
                ...items.value.map((label) =>
                  h(GridItem, { key: label, class: `item-${label}` }, { default: () => label }),
                ),
                h(
                  GridItem,
                  { suffix: true, class: 'suffix' },
                  { default: ({ overflow }: { overflow: boolean }) => String(overflow) },
                ),
              ],
            },
          ),
      }),
    );
    cy.get('.item-A').should('be.visible');
    cy.get('.item-B').should('be.visible');
    cy.get('.item-C').should('not.be.visible');
    cy.get('.suffix').should('have.text', 'true');
    cy.then(() => {
      items.value = ['A', 'C'];
    });
    cy.get('.item-B').should('not.exist');
    cy.get('.item-C').should('be.visible');
    cy.get('.suffix').should('have.text', 'false');
    cy.then(() => {
      items.value = ['D', 'C', 'A'];
    });
    cy.get('.item-D').should('be.visible');
    cy.get('.item-C').should('be.visible');
    cy.get('.item-A').should('not.be.visible');
    cy.get('.suffix').should('have.text', 'true');
  });
});
