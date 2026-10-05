import Table from '../index';

describe('Table column boundaries', () => {
  it('resizes a column whose dataIndex is __proto__', () => {
    cy.mount(Table, {
      props: {
        data: [{ key: 'a', name: 'A' }],
        columns: [
          { dataIndex: '__proto__', width: 120, render: ({ record }) => String(record.name) },
          { dataIndex: 'age', width: 100 },
        ],
        pagination: false,
        columnResizable: true,
      },
    });
    cy.get('.sd-table-th')
      .first()
      .then(($th) => {
        const right = $th[0].getBoundingClientRect().right;
        cy.wrap($th).find('.sd-table-column-handle').trigger('mousedown', { clientX: right });
        cy.window().trigger('mousemove', { clientX: right + 50 });
        cy.window().trigger('mouseup');
      });
    cy.get('.sd-table-element')
      .first()
      .should('have.css', '--sd-table-grid-template', '170px 100px');
  });
  it('stops resizing when the resized column is removed', () => {
    const resize = cy.spy().as('resize');
    cy.mount(Table, {
      props: {
        data: [{ key: 'a', name: 'A', age: 1 }],
        columns: [{ dataIndex: 'name' }, { dataIndex: 'age' }],
        pagination: false,
        columnResizable: true,
        onColumnResize: resize,
      },
    });
    cy.get('.sd-table-column-handle').trigger('mousedown');
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ columns: [{ dataIndex: 'age' }] }));
    cy.window().trigger('mousemove', { clientX: 100 });
    cy.get('@resize').should('not.have.been.called');
    cy.window().trigger('mouseup');
  });

  it('does not use inherited filter values for a constructor column', () => {
    cy.mount(Table, {
      props: {
        data: [{ key: 'a', name: 'A' }],
        columns: [
          {
            dataIndex: 'constructor',
            render: ({ record }) => String(record.name),
            filterable: {
              filters: [{ text: 'A', value: 'A' }],
              filter: (values, record) => values.includes(String(record.name)),
            },
          },
        ],
        pagination: false,
      },
    });
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
    cy.get('.sd-table-filters-active').should('not.exist');
    cy.get('.sd-table-filters').click();
    cy.get('.sd-table-filters-list .sd-radio').click();
    cy.get('.sd-table-filters-bottom .sd-btn-primary').click();
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
  });
});
