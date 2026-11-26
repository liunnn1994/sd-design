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
        cy.wrap($th)
          .find('.sd-table-column-handle')
          .as('resizeHandle', { type: 'static' })
          .trigger('pointerdown', {
            isPrimary: true,
            eventConstructor: 'PointerEvent',
            clientX: right,
          });
        cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
          handle.dispatchEvent(new PointerEvent('pointermove', { clientX: right + 50 }));
        });
        cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
          handle.dispatchEvent(new PointerEvent('pointerup'));
        });
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
    cy.get('.sd-table-column-handle')
      .as('resizeHandle', { type: 'static' })
      .trigger('pointerdown', { isPrimary: true, eventConstructor: 'PointerEvent' });
    cy.get('@vue').then(({ wrapper }) => wrapper.setProps({ columns: [{ dataIndex: 'age' }] }));
    cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
      handle.dispatchEvent(new PointerEvent('pointermove', { clientX: 100 }));
    });
    cy.get('@resize').should('not.have.been.called');
    cy.get<JQuery<HTMLElement>>('@resizeHandle').then(([handle]) => {
      handle.dispatchEvent(new PointerEvent('pointerup'));
    });
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
