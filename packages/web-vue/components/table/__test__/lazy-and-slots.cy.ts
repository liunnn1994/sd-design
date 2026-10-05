import { defineComponent, h, ref } from 'vue';

import Table from '../index';

describe('Table lazy loading and slots', () => {
  it('does not start another load while a row is already loading', () => {
    const load = cy.spy().as('load');
    cy.mount(Table, {
      props: {
        data: [{ key: 'parent', name: 'Parent' }],
        columns: [{ dataIndex: 'name' }],
        pagination: false,
        loadMore: load,
      },
    });
    cy.get('.sd-table-expand-btn').click();
    cy.get('.sd-icon-loading').should('exist');
    cy.get('.sd-table-cell-inline-icon').click();
    cy.get('@load').should('have.been.calledOnce');
  });

  it('updates the tree expand-icon slot when added and removed', () => {
    const visible = ref(false);
    const data = [{ key: 'parent', name: 'Parent', children: [{ key: 'child', name: 'Child' }] }];
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Table,
            { data, columns: [{ dataIndex: 'name' }], pagination: false },
            visible.value
              ? { 'expand-icon': () => h('span', { class: 'custom-expand' }, 'Expand') }
              : {},
          ),
      }),
    );
    cy.get('.custom-expand').should('not.exist');
    cy.then(() => {
      visible.value = true;
    });
    cy.get('.custom-expand').should('exist');
    cy.then(() => {
      visible.value = false;
    });
    cy.get('.custom-expand').should('not.exist');
  });
});
