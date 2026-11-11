import { defineComponent, h, ref } from 'vue';

import List from '../list.vue';

describe('List controlled pagination release', () => {
  it('uses shared autoAdjust when releasing an externally changed page size', () => {
    const controlled = ref(true);
    const current = ref(1);
    const pageSize = ref(5);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            List,
            {
              data: Array.from({ length: 25 }, (_, index) => index),
              paginationProps: {
                defaultPageSize: 5,
                current: controlled.value ? current.value : undefined,
                pageSize: controlled.value ? pageSize.value : undefined,
              },
            },
            { item: ({ item }: { item: number }) => h('output', String(item)) },
          ),
      }),
    );
    cy.contains('.sd-pagination-item', /^2$/).click();
    cy.get('output').first().should('have.text', '0');
    cy.then(() => {
      current.value = 3;
      pageSize.value = 10;
    });
    cy.get('output').first().should('have.text', '20');
    cy.then(() => {
      controlled.value = false;
    });
    cy.get('output').first().should('have.text', '10');
  });
});
