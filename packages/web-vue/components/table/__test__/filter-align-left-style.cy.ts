import Table from '../index';

describe('Table left-aligned filter styles', () => {
  it('keeps the open left-aligned filter background transparent', () => {
    cy.mount(Table, {
      props: {
        pagination: false,
        filterIconAlignLeft: true,
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            filterable: {
              filters: [{ text: 'Alice', value: 'Alice' }],
              filter: (values, record) => values.includes(String(record.name)),
            },
          },
        ],
        data: [{ key: 'alice', name: 'Alice' }],
      },
    });
    cy.get('.sd-table').invoke(
      'css',
      '--component-table-color-bg-header-filters-icon-hover',
      'rgb(12, 34, 56)',
    );
    cy.get('.sd-table-filters').trigger('click');
    cy.get('.sd-table-filters-content').should('be.visible');
    cy.get('.sd-table-filters-align-left')
      .should('have.class', 'sd-table-filters-open')
      .invoke('css', 'transition', 'none')
      .should('have.css', 'background-color', 'rgba(0, 0, 0, 0)');
  });
});
