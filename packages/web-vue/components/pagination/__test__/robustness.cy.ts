import { defineComponent, h, ref } from 'vue';

import Pagination from '../index';

describe('Pagination robustness', () => {
  it('adjusts a controlled page only once when its page size changes', () => {
    const current = ref(8);
    const pageSize = ref(10);
    const onChange = cy.spy().as('change');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Pagination, {
            'total': 100,
            'current': current.value,
            'pageSize': pageSize.value,
            'onUpdate:current': (value: number) => {
              current.value = value;
            },
            onChange,
          }),
      }),
    );
    cy.then(() => {
      pageSize.value = 20;
    });
    cy.get('.sd-pagination-item-active').should('have.text', '4');
    cy.get('@change').should('have.been.calledOnceWith', 4);
  });

  it('keeps the first item visible after accepting a controlled page size selection', () => {
    const current = ref(4);
    const pageSize = ref(10);
    const onChange = cy.spy().as('change');
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Pagination, {
            'total': 100,
            'current': current.value,
            'pageSize': pageSize.value,
            'showPageSize': true,
            'pageSizeOptions': [5, 10, 20],
            'onUpdate:current': (value: number) => {
              current.value = value;
            },
            'onUpdate:pageSize': (value: number) => {
              pageSize.value = value;
            },
            onChange,
          }),
      }),
    );
    cy.get('.sd-pagination-options .sd-select').click();
    cy.contains('.sd-select-option', '5 条/页').click();
    cy.get('.sd-pagination-item-active').should('have.text', '7');
    cy.get('@change').should('have.been.calledOnceWith', 7);
  });

  it('keeps the page size selector disabled when its custom props specify disabled false', () => {
    cy.mount(Pagination, {
      props: { total: 100, disabled: true, showPageSize: true, pageSizeProps: { disabled: false } },
    });
    cy.get('.sd-pagination-options .sd-select').should('have.class', 'sd-select-view-disabled');
  });
});
