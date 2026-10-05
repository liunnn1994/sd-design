import { defineComponent, h, ref } from 'vue';

import type { TableColumnData, TableData } from '../interface';

import Table, { TableColumn } from '../index';

const rows = [
  { key: 'a', name: 'A', age: 1 },
  { key: 'b', name: 'B', age: 1 },
  { key: 'c', name: 'C', age: 1 },
];
const nameColumn: TableColumnData = { title: 'Name', dataIndex: 'name' };

describe('Table robustness', () => {
  it('keeps equal values in input order when sorting ascending', () => {
    cy.mount(Table, {
      props: {
        data: rows,
        pagination: false,
        columns: [
          nameColumn,
          {
            dataIndex: 'age',
            sortable: { sortDirections: ['ascend'], defaultSortOrder: 'ascend' },
          },
        ],
      },
    });
    cy.get('.sd-table-tbody .sd-table-tr').should(($rows) => {
      expect(
        [...$rows].map((row) => row.querySelector('.sd-table-td-content')?.textContent),
      ).to.deep.equal(['A', 'B', 'C']);
    });
  });

  it('preserves a chosen sorter when only a column title changes', () => {
    const columns: TableColumnData[] = [
      { ...nameColumn, sortable: { sortDirections: ['ascend', 'descend'] } },
    ];
    cy.mount(Table, { props: { data: rows, columns, pagination: false } });
    cy.get('.sd-table-cell-with-sorter').click().click();
    cy.get('.sd-table-th').should('have.attr', 'aria-sort', 'descending');
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ columns: [{ ...columns[0], title: 'Updated' }] }),
    );
    cy.get('.sd-table-th').should('have.attr', 'aria-sort', 'descending');
  });

  it('preserves chosen filters when only a column title changes', () => {
    const columns: TableColumnData[] = [
      {
        ...nameColumn,
        filterable: {
          filters: [{ text: 'A', value: 'A' }],
          filter: (values, record) => values.includes(String(record.name)),
        },
      },
    ];
    cy.mount(Table, { props: { data: rows, columns, pagination: false } });
    cy.get('.sd-table-filters').click();
    cy.get('.sd-table-filters-list .sd-radio').click();
    cy.get('.sd-table-filters-bottom .sd-btn-primary').click();
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({ columns: [{ ...columns[0], title: 'Updated' }] }),
    );
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
  });

  it('distinguishes filter values that contain commas from separate values', () => {
    const column: TableColumnData = {
      ...nameColumn,
      filterable: {
        multiple: true,
        filteredValue: ['a,b'],
        filter: () => true,
        filters: ['a,b', 'a', 'b'].map((value) => ({ value, text: value })),
      },
    };
    cy.mount(Table, { props: { data: rows, columns: [column], pagination: false } });
    cy.get('@vue').then(({ wrapper }) =>
      wrapper.setProps({
        columns: [{ ...column, filterable: { ...column.filterable, filteredValue: ['a', 'b'] } }],
      }),
    );
    cy.get('.sd-table-filters').click();
    cy.get('.sd-table-filters-list .sd-checkbox-checked').should('have.length', 2);
  });

  it('does not treat an inherited column-width property as a resized width', () => {
    cy.mount(Table, {
      props: {
        data: [{ key: 'a', constructor: 'A' }],
        pagination: false,
        columns: [{ dataIndex: 'constructor', width: 120 }],
      },
    });
    cy.get('.sd-table-element').first().should('have.css', '--sd-table-grid-template', '120px');
  });

  for (const key of ['constructor', '__proto__']) {
    it(`loads children for the row key ${key}`, () => {
      cy.mount(Table, {
        props: {
          data: [{ key, name: 'Parent' }],
          columns: [nameColumn],
          pagination: false,
          loadMore: (_record: TableData, done: (children?: TableData[]) => void) =>
            done([{ key: 'child', name: 'Child', isLeaf: true }]),
        },
      });
      cy.get('.sd-table-expand-btn').click();
      cy.get('.sd-table-tbody').should('contain.text', 'Child');
    });
  }

  it('keeps expanded keys unique when expand is called twice', () => {
    const change = cy.spy().as('change');
    cy.mount(Table, {
      props: {
        data: [{ key: 'a', name: 'A', expand: 'Expanded' }],
        columns: [nameColumn],
        pagination: false,
        expandable: {},
        onExpandedChange: change,
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      wrapper.vm.expand('a');
      wrapper.vm.expand('a');
    });
    cy.get('@change').should((spy) => {
      expect(spy.lastCall.args[0]).to.deep.equal(['a']);
    });
  });

  it('clears radio selection through select(key, false)', () => {
    const change = cy.spy().as('change');
    cy.mount(Table, {
      props: {
        data: rows,
        columns: [nameColumn],
        pagination: false,
        rowSelection: { type: 'radio' },
        defaultSelectedKeys: ['a'],
        onSelectionChange: change,
      },
    });
    cy.get('@vue').then(({ wrapper }) => wrapper.vm.select('a', false));
    cy.get('@change').should('have.been.calledOnceWith', []);
    cy.get('.sd-radio-checked').should('not.exist');
  });

  it('skips disabled leaves when selecting a tree parent', () => {
    const change = cy.spy().as('change');
    cy.mount(Table, {
      props: {
        data: [
          {
            key: 'parent',
            name: 'Parent',
            children: [
              { key: 'a', name: 'A' },
              { key: 'b', name: 'B', disabled: true },
            ],
          },
        ],
        columns: [nameColumn],
        pagination: false,
        rowSelection: { checkStrictly: false },
        onSelectionChange: change,
      },
    });
    cy.get('.sd-table-tbody .sd-checkbox').first().click();
    cy.get('@change').should('have.been.calledOnceWith', ['a']);
    cy.get('.sd-table-tbody .sd-checkbox').first().should('have.class', 'sd-checkbox-checked');
  });

  it('updates a column filter icon slot when added and removed', () => {
    const visible = ref(false);
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            Table,
            { data: rows, pagination: false },
            {
              columns: () =>
                h(
                  TableColumn,
                  { ...nameColumn, filterable: { filter: () => true } },
                  visible.value
                    ? { 'filter-icon': () => h('span', { class: 'custom-filter' }, 'Filter') }
                    : {},
                ),
            },
          ),
      }),
    );
    cy.get('.custom-filter').should('not.exist');
    cy.then(() => {
      visible.value = true;
    });
    cy.get('.custom-filter').should('exist');
    cy.then(() => {
      visible.value = false;
    });
    cy.get('.custom-filter').should('not.exist');
  });
});
