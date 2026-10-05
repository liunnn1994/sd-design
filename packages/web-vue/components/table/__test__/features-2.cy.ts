import { defineComponent, h } from 'vue';

import type { TableColumnData, TableData } from '../interface';

import { TableColumn } from '..';
import ConfigProvider from '../../config-provider';
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

  it('aligns nested grouped headers fixed to the right', () => {
    cy.mount(Table, {
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', width: 150 },
          {
            title: 'Outer',
            fixed: 'right',
            children: [
              {
                title: 'Inner',
                children: [
                  { title: 'Age', dataIndex: 'age', width: 100 },
                  { title: 'Address', dataIndex: 'address', width: 100 },
                ],
              },
            ],
          },
        ],
        data: JSONCopy(demoData),
        pagination: false,
        scroll: { x: 600 },
      },
    });
    cy.contains('.sd-table-th', 'Outer').should('have.css', 'right', '0px');
    cy.contains('.sd-table-th', 'Inner').should('have.css', 'right', '0px');
    cy.contains('.sd-table-th', 'Age').should('have.class', 'sd-table-col-fixed-right');
    cy.contains('.sd-table-th', 'Age').should('have.css', 'right', '100px');
    cy.contains('.sd-table-th', 'Address').should('have.class', 'sd-table-col-fixed-right');
  });

  it('updates right fixed offsets after resizing a following column', () => {
    cy.mount(Table, {
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', width: 150, fixed: 'right' },
          { title: 'Age', dataIndex: 'age', width: 100, fixed: 'right' },
          { title: 'Address', dataIndex: 'address', width: 100, fixed: 'right' },
        ],
        data: JSONCopy(demoData),
        pagination: false,
        columnResizable: true,
        scroll: { x: 600 },
      },
    });
    cy.get('.sd-table-th')
      .eq(1)
      .then(($th) => {
        const right = $th[0].getBoundingClientRect().right;
        cy.wrap($th)
          .find('.sd-table-column-handle')
          .trigger('mousedown', { clientX: right, force: true });
        cy.window().trigger('mousemove', { clientX: right + 50 });
        cy.window().trigger('mouseup');
      });
    cy.get('.sd-table-th').first().should('have.css', 'right', '250px');
    cy.get('.sd-table-tbody .sd-table-td').first().should('have.css', 'right', '250px');
  });

  it('resizes a column by dragging its header handle', () => {
    cy.mount(Table, {
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', width: 150 },
          { title: 'Age', dataIndex: 'age', width: 120 },
        ],
        data: JSONCopy(demoData),
        pagination: false,
        columnResizable: true,
      },
    });
    cy.get('.sd-table-th')
      .first()
      .then(($th) => {
        const right = $th[0].getBoundingClientRect().right;
        cy.wrap($th).find('.sd-table-column-handle').trigger('mousedown', { clientX: right });
        cy.window().trigger('mousemove', { clientX: right + 80 });
        cy.window().trigger('mouseup');
      });
    cy.get('.sd-table-element')
      .first()
      .should('have.css', '--sd-table-grid-template', '230px 120px');
    cy.get('.sd-table-th')
      .first()
      .should(($th) => {
        expect(Math.round($th[0].getBoundingClientRect().width)).to.equal(230);
      });
  });

  it('uses ConfigProvider table defaults while explicit table props take precedence', () => {
    const columns = [
      { title: 'Name', dataIndex: 'name', width: 150 },
      { title: 'Age', dataIndex: 'age', width: 120 },
    ];
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(
            ConfigProvider,
            {
              table: { columnResizable: true, pagination: false, stripe: true, hoverable: false },
            },
            {
              default: () => [
                h(Table, { columns, data: demoData }),
                h(Table, {
                  columns,
                  data: demoData,
                  columnResizable: false,
                  stripe: false,
                  hoverable: true,
                }),
              ],
            },
          ),
      }),
    );
    cy.get('.sd-table')
      .first()
      .should('have.class', 'sd-table-stripe')
      .and('not.have.class', 'sd-table-hover')
      .find('.sd-table-column-handle')
      .should('have.length', 1);
    cy.get('.sd-table')
      .eq(1)
      .should('not.have.class', 'sd-table-stripe')
      .and('have.class', 'sd-table-hover')
      .find('.sd-table-column-handle')
      .should('not.exist');
    cy.get('.sd-table-pagination').should('not.exist');
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

  for (const method of ['clearFilters', 'resetFilters'] as const) {
    it(`${method} preserves filters on other columns`, () => {
      const columns: TableColumnData[] = [
        {
          title: 'Name',
          dataIndex: 'name',
          filterable: {
            filters: [{ text: 'Jane', value: 'Jane' }],
            defaultFilteredValue: ['Jane'],
            filter: (values, record) => record.name.includes(values[0]),
          },
        },
        {
          title: 'Age',
          dataIndex: 'age',
          filterable: {
            filters: [{ text: 'Age 1', value: '1' }],
            defaultFilteredValue: ['1'],
            filter: (values, record) => String(record.age) === values[0],
          },
        },
      ];
      cy.mount(Table, { props: { columns, data: JSONCopy(demoData), pagination: false } });
      cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
      cy.get('@vue').then(({ wrapper }) => {
        (wrapper.vm as unknown as TableExposedMethods)[method]('name');
      });
      cy.wait(150);
      cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
      cy.get('.sd-table-th')
        .eq(1)
        .find('.sd-table-filters')
        .should('have.class', 'sd-table-filters-active');
      cy.get('@vue').then(({ wrapper }) => {
        (wrapper.vm as unknown as TableExposedMethods).clearFilters('name');
      });
      cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 1);
      cy.get('@vue').then(({ wrapper }) => {
        (wrapper.vm as unknown as TableExposedMethods).clearFilters();
      });
      cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 5);
    });
  }

  it('removes column resize listeners when unmounted during a drag', () => {
    cy.mount(Table, {
      props: {
        columns: [
          { title: 'Name', dataIndex: 'name', width: 150 },
          { title: 'Age', dataIndex: 'age', width: 120 },
        ],
        data: JSONCopy(demoData),
        pagination: false,
        columnResizable: true,
      },
    });
    cy.get('@vue').then(({ wrapper }) => {
      const win = wrapper.element.ownerDocument.defaultView!;
      const add = cy.spy(win, 'addEventListener');
      const remove = cy.spy(win, 'removeEventListener');
      wrapper
        .find('.sd-table-column-handle')
        .element.dispatchEvent(new win.MouseEvent('mousedown', { bubbles: true }));
      wrapper.unmount();
      for (const type of ['mousemove', 'mouseup', 'contextmenu']) {
        const registration = add.getCalls().find((call) => call.args[0] === type);
        expect(registration, `${type} registered`).not.to.equal(undefined);
        expect(remove.calledWith(type, registration!.args[1]), `${type} removed`).to.equal(true);
      }
    });
  });

  it('restores filtered tree children without changing the input data', () => {
    const data: TableData[] = [
      {
        key: 'parent',
        name: 'Parent',
        age: 1,
        children: [
          { key: 'child1', name: 'Child 1', age: 1 },
          { key: 'child2', name: 'Child 2', age: 2 },
        ],
      },
    ];
    const columns: TableColumnData[] = [
      { title: 'Name', dataIndex: 'name' },
      {
        title: 'Age',
        dataIndex: 'age',
        filterable: {
          filters: [{ text: 'Age 1', value: '1' }],
          filter: (values, record) => String(record.age) === values[0],
        },
      },
    ];
    cy.mount(Table, {
      props: { columns, data, pagination: false, defaultExpandedKeys: ['parent'] },
    });
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 3);
    cy.get('.sd-table-filters').first().click();
    cy.get('.sd-table-filters-list .sd-radio').first().click();
    cy.get('.sd-table-filters-bottom .sd-btn-primary').click();
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 2);
    cy.then(() => expect(data[0].children).to.have.length(2));
    cy.get('@vue').then(({ wrapper }) => {
      (wrapper.vm as unknown as TableExposedMethods).clearFilters();
    });
    cy.wait(150);
    cy.get('.sd-table-tbody .sd-table-tr').should('have.length', 3);
    cy.then(() => expect(data[0].children).to.have.length(2));
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
});
