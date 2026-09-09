import { defineComponent, h, ref } from 'vue';

import Grid, { GridItem } from '../index';

describe('Grid collapsed row geometry', () => {
  for (const suffix of [false, true]) {
    it(`accounts for unused cells between rows ${suffix ? 'with' : 'without'} a suffix`, () => {
      const collapsed = ref(true);
      cy.mount(
        defineComponent({
          setup: () => () =>
            h(
              Grid,
              {
                cols: 3,
                collapsed: collapsed.value,
                collapsedRows: 2,
                rowGap: 10,
                style: { width: '300px' },
              },
              {
                default: () => [
                  ...[2, 2, suffix ? 1 : 2].map((span, index) =>
                    h(
                      GridItem,
                      { span, class: `cell-${index}`, style: { height: '20px' } },
                      { default: () => String(index) },
                    ),
                  ),
                  ...(suffix
                    ? [
                        h(
                          GridItem,
                          { suffix: true, style: { height: '20px' }, class: 'suffix' },
                          { default: ({ overflow }: { overflow: boolean }) => String(overflow) },
                        ),
                      ]
                    : []),
                ],
              },
            ),
        }),
      );
      cy.get('.cell-0').should('be.visible');
      cy.get('.cell-1').should('be.visible');
      cy.get('.cell-2').should('not.be.visible');
      cy.get('.sd-grid').should('have.css', 'height', '50px');
      if (suffix) cy.get('.suffix').should('have.text', 'true');
      cy.then(() => {
        collapsed.value = false;
      });
      cy.get('.cell-2').should('be.visible');
      cy.get('.sd-grid').should('have.css', 'height', '80px');
      cy.then(() => {
        collapsed.value = true;
      });
      cy.get('.cell-2').should('not.be.visible');
      cy.get('.sd-grid').should('have.css', 'height', '50px');
    });
  }
});
