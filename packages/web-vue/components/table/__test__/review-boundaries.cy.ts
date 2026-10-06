import { h } from 'vue';

import Table from '../index';

describe('Table source review boundaries', () => {
  for (const width of [undefined, 72]) {
    it(`offsets fixed selection after an expand column of width ${width ?? 'default'}`, () => {
      cy.mount(Table, {
        props: {
          columns: [{ dataIndex: 'name', title: 'Name', width: 600 }],
          data: [{ key: 1, name: 'One', expand: 'Details' }],
          expandable: { fixed: true, width },
          rowSelection: { fixed: true },
          pagination: false,
          scrollbar: false,
          scroll: { x: 800 },
        },
        attrs: { style: 'width:400px' },
      });

      cy.get('.sd-table-content').invoke('scrollLeft', 150).trigger('scroll');
      for (const cell of ['th', 'td']) {
        cy.get(`.sd-table-${cell}.sd-table-operation`).should(($cells) => {
          const first = $cells[0].getBoundingClientRect();
          const second = $cells[1].getBoundingClientRect();
          expect(second.left - first.left).to.be.closeTo(width ?? 40, 1);
        });
      }
    });
  }

  it('reorders the displayed page without changing preceding rows', () => {
    const change = cy.spy().as('change');
    cy.mount(Table, {
      props: {
        columns: [{ dataIndex: 'name', title: 'Name' }],
        data: [1, 2, 3, 4].map((key) => ({ key, name: `Row ${key}` })),
        pagination: { defaultCurrent: 2, defaultPageSize: 2 },
        draggable: { type: 'row' },
        onChange: change,
      },
    });

    cy.get('.sd-table-tbody .sd-table-tr').first().trigger('dragstart', { force: true });
    cy.get('.sd-table-tbody .sd-table-tr').last().trigger('dragenter', { force: true });
    cy.get('.sd-table-tbody .sd-table-tr').last().trigger('drop', { force: true });
    cy.get('@change').should('have.been.calledOnce');
    cy.then(() => {
      const [page, extra, all] = change.firstCall.args;
      expect(extra.type).to.equal('drag');
      expect(page.map((record: { key: number }) => record.key)).to.deep.equal([4, 3]);
      expect(all.map((record: { key: number }) => record.key)).to.deep.equal([1, 2, 4, 3]);
    });
  });

  for (const multiple of [false, true]) {
    it(`renders function labels in a ${multiple ? 'multiple' : 'single'} filter`, () => {
      cy.mount(Table, {
        props: {
          columns: [
            {
              dataIndex: 'name',
              title: 'Name',
              filterable: {
                multiple,
                filters: [
                  { value: 'one', text: () => h('strong', { class: 'filter-label' }, 'One') },
                ],
                filter: () => true,
              },
            },
          ],
          data: [{ key: 1, name: 'One' }],
          pagination: false,
        },
      });

      cy.get('.sd-table-filters').click();
      cy.get('.sd-table-filters-item .filter-label').should('have.text', 'One');
    });
  }
});
