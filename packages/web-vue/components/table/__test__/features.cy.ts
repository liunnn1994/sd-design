import { h } from 'vue';

import type { TableChangeExtra, TableColumnData, TableData } from '../interface';

import Table from '../table.vue';

const demoData: TableData[] = [
  { key: '1', name: 'Jane Doe1', age: 1 },
  { key: '2', name: 'Jane Doe2', age: 2 },
  { key: '3', name: 'Jane Doe3', age: 3 },
  { key: '4', name: 'Jane Doe4', age: 4 },
  { key: '5', name: 'Jane Doe5', age: 5 },
];
const demoColumns: TableColumnData[] = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age' },
];
const JSONCopy = <T>(val: T): T => JSON.parse(JSON.stringify(val));

describe('Table features', () => {
  it('expands rows with record.expand and emits expand events', () => {
    const data = demoData.map((row) => ({ ...row, expand: `Expanded ${row.name}` }));
    cy.mount(Table, {
      props: {
        'columns': JSONCopy(demoColumns),
        data,
        'pagination': false,
        'expandable': {},
        'onExpand': cy.spy().as('onExpand'),
        'onExpandedChange': cy.spy().as('onExpandedChange'),
        'onUpdate:expandedKeys': cy.spy().as('onUpdateExpandedKeys'),
      },
    });
    cy.get('.sd-table-operation.sd-table-expand .sd-table-expand-btn').should('have.length', 5);
    cy.get('.sd-table-operation.sd-table-expand .sd-table-expand-btn').first().click();
    cy.get('.sd-table-tr-expand').should('contain.text', 'Expanded Jane Doe1');
    cy.get('.sd-table-operation.sd-table-expand .sd-table-expand-btn')
      .first()
      .find('.sd-icon-minus')
      .should('exist');
    cy.get('@onExpand').should((spy) => {
      const [rowKey, record] = spy.firstCall.args as [string, TableData];
      expect(rowKey).to.equal('1');
      expect(record.name).to.equal('Jane Doe1');
    });
    cy.get('@onExpandedChange').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['1']);
    });
    cy.get('@onUpdateExpandedKeys').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['1']);
    });
    cy.get('.sd-table-operation.sd-table-expand .sd-table-expand-btn').first().click();
    cy.get('.sd-table-tr-expand').should('not.exist');
    cy.get('@onExpandedChange').should((spy) => {
      expect(spy.secondCall.args[0]).to.deep.equal([]);
    });
  });

  it('renders expand-row slot content', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
        expandable: {},
      },
      slots: {
        'expand-row': ({ record }: { record: TableData }) =>
          h('span', { class: 'my-expand' }, `slot-${record.name}`),
      },
    });
    cy.get('.sd-table-operation.sd-table-expand .sd-table-expand-btn').first().click();
    cy.get('.my-expand').should('have.length', 1).and('have.text', 'slot-Jane Doe1');
  });

  it('expands rows by default via defaultExpandedKeys', () => {
    const data = demoData.map((row) => ({ ...row, expand: `Expanded ${row.name}` }));
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        expandable: {},
        defaultExpandedKeys: ['1', '3'],
      },
    });
    cy.get('.sd-table-tr-expand').should('have.length', 2);
  });

  it('expands and collapses tree children inline', () => {
    const data: TableData[] = [
      { key: '1', name: 'Node1', children: [{ key: '1-1', name: 'Child1' }] },
      { key: '2', name: 'Node2' },
    ];
    cy.mount(Table, {
      props: { columns: JSONCopy(demoColumns), data, pagination: false },
    });
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 2);
    cy.get('.sd-table-expand-btn').first().click();
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 3);
    cy.get('.sd-table-tbody').should('contain.text', 'Child1');
    cy.get('.sd-table-expand-btn').first().find('.sd-icon-minus').should('exist');
    cy.get('.sd-table-expand-btn').first().click();
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 2);
    cy.get('.sd-table-tbody').should('not.contain.text', 'Child1');
  });

  it('selects tree leaves when checkStrictly is false', () => {
    const data: TableData[] = [
      {
        key: '1',
        name: 'Node1',
        children: [
          { key: '1-1', name: 'Child1' },
          { key: '1-2', name: 'Child2' },
        ],
      },
    ];
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        rowSelection: { type: 'checkbox', checkStrictly: false },
        defaultSelectedKeys: ['1-1'],
        onSelectionChange: cy.spy().as('onTreeSelectionChange'),
      },
    });
    cy.get('.sd-table-tbody .sd-table-operation.sd-table-checkbox .sd-checkbox')
      .first()
      .should('have.class', 'sd-checkbox-indeterminate');
    cy.get('.sd-table-tbody .sd-table-operation.sd-table-checkbox .sd-checkbox').first().click();
    cy.get('.sd-table-tbody .sd-table-operation.sd-table-checkbox .sd-checkbox')
      .first()
      .should('have.class', 'sd-checkbox-checked');
    cy.get('@onTreeSelectionChange').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['1-1', '1-2']);
    });
  });

  it('filters rows after confirming the filter popup', () => {
    const columns = JSONCopy(demoColumns);
    columns[0].filterable = {
      filters: [{ text: 'Jane 1', value: '1' }],
      filter: (values: string[], record: TableData) => record.name.includes(values[0]),
      multiple: true,
    };
    cy.mount(Table, {
      props: {
        columns,
        data: JSONCopy(demoData),
        pagination: false,
        onFilterChange: cy.spy().as('onFilterChange'),
        onChange: cy.spy().as('onFilterTableChange'),
      },
    });
    cy.get('.sd-table-filters').first().click();
    cy.get('.sd-table-filters-list .sd-checkbox').first().click();
    cy.get('.sd-table-filters-bottom .sd-btn-primary').click();
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
    cy.get('.sd-table-tbody').should('contain.text', 'Jane Doe1');
    cy.get('@onFilterChange').should((spy) => {
      expect(spy.firstCall.args[0]).to.equal('name');
      expect(spy.firstCall.args[1]).to.deep.equal(['1']);
    });
    cy.get('@onFilterTableChange').should((spy) => {
      expect((spy.firstCall.args[1] as TableChangeExtra).type).to.equal('filter');
    });
  });

  it('applies defaultFilteredValue on first render', () => {
    const columns = JSONCopy(demoColumns);
    columns[0].filterable = {
      filters: [{ text: 'Jane 1', value: '1' }],
      filter: (values: string[], record: TableData) => record.name.includes(values[0]),
      defaultFilteredValue: ['1'],
    };
    cy.mount(Table, { props: { columns, data: JSONCopy(demoData), pagination: false } });
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
    cy.get('.sd-table-filters-active').should('exist');
  });

  it('applies defaultSortOrder and exposes aria-sort', () => {
    const columns = JSONCopy(demoColumns);
    columns[1].sortable = {
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'descend',
    };
    cy.mount(Table, { props: { columns, data: JSONCopy(demoData), pagination: false } });
    cy.get('.sd-table-th').eq(1).should('have.attr', 'aria-sort', 'descending');
    cy.get('.sd-table-th').eq(1).should('have.class', 'sd-table-col-sorted');
    cy.get('.sd-table-tbody .sd-table-td-content').first().should('have.text', 'Jane Doe5');
  });

  it('cycles sorterChange through ascend, descend and empty', () => {
    const columns = JSONCopy(demoColumns);
    columns[1].sortable = { sortDirections: ['ascend', 'descend'] };
    cy.mount(Table, {
      props: {
        columns,
        data: JSONCopy(demoData),
        pagination: false,
        onSorterChange: cy.spy().as('onSorterChange'),
      },
    });
    cy.get('.sd-table-cell-with-sorter').click().click().click();
    cy.get('@onSorterChange').should((spy) => {
      expect(spy.firstCall.args).to.deep.equal(['age', 'ascend']);
      expect(spy.secondCall.args).to.deep.equal(['age', 'descend']);
      expect(spy.thirdCall.args).to.deep.equal(['age', '']);
    });
  });

  it('emits pageChange and change when a page is selected', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: { pageSize: 2 },
        onPageChange: cy.spy().as('onPageChange'),
        onChange: cy.spy().as('onPageTableChange'),
      },
    });
    cy.get('.sd-pagination-item').contains('2').click();
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 2);
    cy.get('.sd-table-tbody .sd-table-td-content').first().should('have.text', 'Jane Doe3');
    cy.get('@onPageChange').should((spy) => {
      expect(spy.firstCall.args[0]).to.equal(2);
    });
    cy.get('@onPageTableChange').should((spy) => {
      const extra = spy.firstCall.args[1] as TableChangeExtra;
      expect(extra.type).to.equal('pagination');
      expect(extra.page).to.equal(2);
      expect(extra.pageSize).to.equal(2);
    });
  });

  it('hides pagination when pagination is false', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
      },
    });
    cy.get('.sd-table-pagination').should('not.exist');
  });

  it('renders pagination above the table when pagePosition is top', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagePosition: 'top',
      },
    });
    cy.get('.sd-table-pagination-top').should('exist');
    cy.get('.sd-table-pagination-top').next().should('have.class', 'sd-table-container');
  });

  it('renders pagination-left and pagination-right slots', () => {
    cy.mount(Table, {
      props: { columns: JSONCopy(demoColumns), data: JSONCopy(demoData) },
      slots: {
        'pagination-left': () => h('span', { class: 'my-pg-left' }, 'Left'),
        'pagination-right': () => h('span', { class: 'my-pg-right' }, 'Right'),
      },
    });
    cy.get('.my-pg-left').should('have.text', 'Left');
    cy.get('.my-pg-right').should('have.text', 'Right');
  });

  it('emits cell/row/header click, dblclick, contextmenu and mouseenter/leave events', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
        onCellClick: cy.spy().as('onCellClick'),
        onRowClick: cy.spy().as('onRowClick'),
        onCellDblclick: cy.spy().as('onCellDblclick'),
        onRowDblclick: cy.spy().as('onRowDblclick'),
        onCellContextmenu: cy.spy().as('onCellContextmenu'),
        onRowContextmenu: cy.spy().as('onRowContextmenu'),
        onHeaderClick: cy.spy().as('onHeaderClick'),
        onCellMouseEnter: cy.spy().as('onCellMouseEnter'),
        onCellMouseLeave: cy.spy().as('onCellMouseLeave'),
      },
    });
    cy.get('.sd-table-tbody .sd-table-td').first().click();
    cy.get('@onCellClick').should((spy) => {
      const [record, column] = spy.firstCall.args as [TableData, TableColumnData];
      expect(record.name).to.equal('Jane Doe1');
      expect(column.dataIndex).to.equal('name');
    });
    cy.get('@onRowClick').should((spy) => {
      expect(spy.callCount).to.equal(1);
    });
    cy.get('.sd-table-tbody .sd-table-td').first().dblclick();
    cy.get('@onCellDblclick').should((spy) => {
      expect(spy.callCount).to.equal(1);
    });
    cy.get('@onRowDblclick').should((spy) => {
      expect(spy.callCount).to.equal(1);
    });
    // tbody 中存在隐藏的测量行，改用可见的 td 触发右键（事件冒泡到 tr）
    cy.get('.sd-table-tbody .sd-table-td').first().rightclick();
    cy.get('@onRowContextmenu').should((spy) => {
      expect(spy.callCount).to.equal(1);
    });
    cy.get('@onCellContextmenu').should((spy) => {
      expect(spy.callCount).to.equal(1);
    });
    cy.get('.sd-table-thead .sd-table-th').first().click();
    cy.get('@onHeaderClick').should((spy) => {
      expect((spy.firstCall.args[0] as TableColumnData).dataIndex).to.equal('name');
    });
    cy.get('.sd-table-tbody .sd-table-td').first().trigger('mouseenter');
    cy.wait(60);
    cy.get('@onCellMouseEnter').should((spy) => {
      expect((spy.firstCall.args[0] as TableData).name).to.equal('Jane Doe1');
    });
    cy.get('.sd-table-tbody .sd-table-td').first().trigger('mouseleave');
    cy.wait(60);
    cy.get('@onCellMouseLeave').should((spy) => {
      // dblclick/rightclick 会产生额外的 enter/leave 对，只断言至少触发一次
      expect(spy.callCount).to.be.at.least(1);
    });
  });
});
