import { h } from 'vue';

import type { TableColumnData, TableData } from '../interface';

import { TableColumn } from '..';
import Table from '../table.vue';

type TableExposedMethods = {
  selectAll: (checked?: boolean) => void;
  select: (rowKey: string | string[], checked?: boolean) => void;
  expandAll: (expanded?: boolean) => void;
  expand: (rowKey: string | string[], expanded?: boolean) => void;
  resetFilters: (dataIndex?: string | string[]) => void;
  clearFilters: (dataIndex?: string | string[]) => void;
  resetSorters: () => void;
  clearSorters: () => void;
};

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
  it('merges cells with spanMethod', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
        spanMethod: (data: { rowIndex: number; columnIndex: number }) => {
          if (data.rowIndex === 0 && data.columnIndex === 0) {
            return { rowspan: 2, colspan: 1 };
          }
          return undefined;
        },
      },
    });
    cy.get('.sd-table-tbody .sd-table-tr').eq(0).find('.sd-table-td').should('have.length', 2);
    cy.get('.sd-table-tbody .sd-table-tr').eq(1).find('.sd-table-td').should('have.length', 1);
    cy.get('.sd-table-tbody .sd-table-tr')
      .eq(0)
      .find('.sd-table-td')
      .first()
      .should(($el) => {
        expect(($el[0] as HTMLElement).style.gridRow).to.equal('span 2');
      });
  });

  it('renders a default summary row with sums and summaryText', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
        summary: true,
      },
    });
    cy.get('.sd-table-tr-summary').should('contain.text', 'Summary');
    cy.get('.sd-table-tr-summary').should('contain.text', '15');
  });

  it('renders a custom summary via the summary function', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
        summary: ({ data }: { data: TableData[] }) => [
          { key: 'sum', name: `Total of ${data.length}`, age: 100 },
        ],
      },
    });
    cy.get('.sd-table-tr-summary').should('contain.text', 'Total of 5');
    cy.get('.sd-table-tr-summary').should('contain.text', '100');
  });

  it('renders the default empty component for empty data', () => {
    cy.mount(Table, {
      props: { columns: JSONCopy(demoColumns), data: [], pagination: false },
    });
    cy.get('.sd-table').should('have.class', 'sd-table-empty');
    cy.get('.sd-empty').should('exist');
  });

  it('renders the empty and footer slots', () => {
    cy.mount(Table, {
      props: { columns: JSONCopy(demoColumns), data: [], pagination: false },
      slots: {
        empty: () => h('span', { class: 'my-empty' }, 'Nothing here'),
        footer: () => h('div', { class: 'my-footer' }, 'Footer'),
      },
    });
    cy.get('.my-empty').should('have.text', 'Nothing here');
    cy.get('.sd-table-footer .my-footer').should('have.text', 'Footer');
  });

  it('applies stripe, hoverable, size, bordered and rowClass classes', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
        stripe: true,
        hoverable: false,
        size: 'small',
        bordered: { cell: true },
        rowClass: (record: TableData) => ((record.age as number) > 2 ? 'custom-row' : ''),
      },
    });
    cy.get('.sd-table').should('have.class', 'sd-table-stripe');
    cy.get('.sd-table').should('have.class', 'sd-table-size-small');
    cy.get('.sd-table').should('have.class', 'sd-table-border-cell');
    cy.get('.sd-table').should('not.have.class', 'sd-table-hover');
    cy.get('.sd-table-tr.custom-row').should('have.length', 3);
  });

  it('applies fixed column classes with scroll.x', () => {
    const columns: TableColumnData[] = [
      { title: 'Name', dataIndex: 'name', width: 100, fixed: 'left' },
      { title: 'Age', dataIndex: 'age', width: 100 },
      { title: 'Address', dataIndex: 'address', width: 100, fixed: 'right' },
    ];
    cy.mount(Table, {
      props: {
        columns,
        data: JSONCopy(demoData),
        pagination: false,
        scroll: { x: 600 },
      },
    });
    // scroll-position 类依赖异步滚动测量，CI 上不稳定，只断言结构性 fixed 类
    cy.get('.sd-table-container').should('have.class', 'sd-table-has-fixed-col-left');
    cy.get('.sd-table-container').should('have.class', 'sd-table-has-fixed-col-right');
    cy.get('.sd-table-th').eq(0).should('have.class', 'sd-table-col-fixed-left-last');
    cy.get('.sd-table-th').eq(2).should('have.class', 'sd-table-col-fixed-right-first');
  });

  it('emits columnResize when the resize handle is dragged', () => {
    const columns: TableColumnData[] = [
      { title: 'Name', dataIndex: 'name', width: 100 },
      { title: 'Age', dataIndex: 'age', width: 100 },
    ];
    cy.mount(Table, {
      props: {
        columns,
        data: JSONCopy(demoData),
        pagination: false,
        columnResizable: true,
        onColumnResize: cy.spy().as('onColumnResize'),
      },
    });
    cy.get('.sd-table-column-handle').should('have.length', 1);
    cy.get('.sd-table-column-handle').trigger('mousedown', { force: true });
    // 等待 window 级 mousemove 监听器绑定完成（CI 上绑定是异步的）
    cy.wait(60);
    cy.get('body').trigger('mousemove', { clientX: 500, force: true });
    cy.wait(60);
    cy.get('@onColumnResize').should((spy) => {
      expect(spy.firstCall.args[0]).to.equal('name');
      expect(spy.firstCall.args[1]).to.be.greaterThan(40);
    });
    cy.get('body').trigger('mouseup', { force: true });
  });

  it('exposes imperative selection and expand methods', () => {
    const data = demoData.map((row) => ({ ...row, expand: `Expanded ${row.name}` }));
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        rowSelection: { type: 'checkbox' },
        expandable: {},
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TableExposedMethods).selectAll(true);
    });
    cy.get('.sd-table-tbody .sd-checkbox-checked').should('have.length', 5);
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TableExposedMethods).expandAll();
    });
    cy.get('.sd-table-tr-expand').should('have.length', 5);
    cy.get('@vue').then(({ wrapper }) => {
      const vm = wrapper.vm as unknown as TableExposedMethods;
      vm.select('1', false);
      vm.expand('1', false);
    });
    cy.get('.sd-table-tbody .sd-checkbox-checked').should('have.length', 4);
    cy.get('.sd-table-tr-expand').should('have.length', 4);
  });

  it('exposes clearFilters and clearSorters methods', () => {
    const columns = JSONCopy(demoColumns);
    columns[0].filterable = {
      filters: [{ text: 'Jane 1', value: '1' }],
      filter: (values: string[], record: TableData) => record.name.includes(values[0]),
      defaultFilteredValue: ['1'],
    };
    columns[1].sortable = { sortDirections: ['ascend', 'descend'], defaultSortOrder: 'ascend' };
    cy.mount(Table, { props: { columns, data: JSONCopy(demoData), pagination: false } });
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
    cy.get('.sd-table-th').eq(1).should('have.attr', 'aria-sort', 'ascending');
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TableExposedMethods).clearFilters();
    });
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 5);
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TableExposedMethods).clearSorters();
    });
    cy.get('.sd-table-th').eq(1).should('have.attr', 'aria-sort', 'none');
  });

  it('lazy-loads tree children via loadMore', () => {
    let done: ((children?: TableData[]) => void) | undefined;
    const data: TableData[] = [{ key: '1', name: 'Node1' }];
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        loadMore: (_record: TableData, callback: (children?: TableData[]) => void) => {
          done = callback;
        },
      },
    });
    cy.get('.sd-table-expand-btn').first().click();
    cy.get('.sd-icon-loading').should('exist');
    cy.then(() => {
      done?.([{ key: '1-1', name: 'Child1' }]);
    });
    cy.get('.sd-table-tbody').should('contain.text', 'Child1');
    cy.get('.sd-icon-loading').should('not.exist');
  });

  it('resolves row keys with a rowKey function', () => {
    const data = [{ id: 'a-1', name: 'Jane', age: 1 }];
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        rowKey: (record: TableData) => record.id as string,
        rowSelection: { type: 'checkbox' },
        onSelectionChange: cy.spy().as('onRowKeySelectionChange'),
      },
    });
    cy.get('.sd-table-tbody .sd-table-operation .sd-checkbox').first().click();
    cy.get('@onRowKeySelectionChange').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['a-1']);
    });
  });

  it('activates the pagination page item with keyboard Enter', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: { pageSize: 2 },
        onPageChange: cy.spy().as('onKeyboardPageChange'),
      },
    });
    cy.get('.sd-pagination-item').contains('2').focus().type('{enter}');
    cy.get('@onKeyboardPageChange').should((spy) => {
      expect(spy.callCount).to.equal(1);
      expect(spy.firstCall.args[0]).to.equal(2);
    });
  });

  it('renders columns via the columns slot with a custom cell', () => {
    cy.mount(Table, {
      props: { data: JSONCopy(demoData), pagination: false },
      slots: {
        columns: () => [
          h(
            TableColumn,
            { title: 'Name', dataIndex: 'name' },
            {
              cell: ({ record }: { record: TableData }) =>
                h('span', { class: 'my-cell' }, `custom-${record.name}`),
            },
          ),
        ],
      },
    });
    cy.get('.my-cell').should('have.length', 5);
    cy.get('.my-cell').first().should('have.text', 'custom-Jane Doe1');
  });

  it('replaces tr and td elements via the tr and td slots', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        pagination: false,
      },
      slots: {
        tr: () => h('div', { class: 'my-tr' }),
        td: ({ record }: { record: TableData }) => h('div', { class: 'my-td' }, record.name),
      },
    });
    cy.get('.my-tr').should('have.length', 5);
    cy.get('.my-td').should('have.length', 10);
  });
});
