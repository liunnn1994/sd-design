import { h, reactive, ref } from 'vue';

import type { TableColumnData, TableData } from '../interface';

import ConfigProvider from '../../config-provider';
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

describe('Table', () => {
  it('renders correctly after deleting data on the last page', () => {
    const data = reactive(JSONCopy(demoData));
    const columns = JSONCopy(demoColumns);
    const current = ref(5);
    const pagination = reactive({
      current,
      onChange: (value: number) => {
        current.value = value;
      },
      pageSize: 1,
    });
    cy.mount(Table, { props: { columns, data, pagination } });
    cy.get('.sd-table-td-content').first().should('have.text', 'Jane Doe5');
    cy.then(() => {
      data.pop();
    });
    cy.get('.sd-table-td-content').first().should('have.text', 'Jane Doe4');
  });

  it('renders a virtual body and supports scrollIntoView', () => {
    const data = Array.from({ length: 50 }, (_, index) => ({
      key: `${index + 1}`,
      name: `Jane Doe${index + 1}`,
      age: index + 1,
    }));
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        virtualListProps: { height: 200, itemSize: 32 },
      },
    });
    cy.get('.sd-virtual-list-scroller').should('exist');
    cy.get('.sd-table-body.sd-virtual-list').should('exist');
    cy.get('.sd-table-element.sd-virtual-list-content').should(($el) => {
      expect(Number.parseFloat(($el[0] as HTMLElement).style.height)).to.be.greaterThan(0);
    });
  });

  it('supports a sticky header at offset 0', () => {
    const data = Array.from({ length: 10 }, (_, index) => ({
      key: `${index + 1}`,
      name: `Jane Doe${index + 1}`,
      age: index + 1,
    }));
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        pagination: false,
        stickyHeader: 0,
        virtualListProps: { height: 200, itemSize: 32 },
      },
    });
    cy.get('.sd-table-header').should('have.class', 'sd-table-header-sticky');
    cy.get('.sd-table-header').should(($el) => {
      expect(($el[0] as HTMLElement).style.top).to.equal('0px');
    });
  });

  it('sorts on header click', () => {
    const data = reactive(JSONCopy(demoData));
    const columns = JSONCopy(demoColumns);
    columns[1].sortable = { sortDirections: ['ascend', 'descend'] };
    const handleChange = cy.spy().as('handleChange');
    cy.mount(Table, {
      props: { columns, data, onChange: handleChange, pagination: { pageSize: 2 } },
    });
    cy.get('.sd-table-cell-with-sorter').click();
    cy.get('@handleChange').should((spy) => {
      const [sorted, extra, currentDataSource] = spy.firstCall.args as [
        TableData[],
        { sorter?: { direction?: string } },
        TableData[],
      ];
      expect(sorted[0].key).to.equal('1');
      expect(extra.sorter?.direction).to.equal('ascend');
      expect(currentDataSource.length).to.equal(5);
    });
    cy.get('.sd-table-cell-with-sorter').click();
    cy.get('@handleChange').should((spy) => {
      const [sorted, extra] = spy.secondCall.args as [
        TableData[],
        { sorter?: { direction?: string } },
      ];
      expect(sorted[0].key).to.equal('5');
      expect(extra.sorter?.direction).to.equal('descend');
    });
  });

  it('exposes table grid semantics (table/rowgroup/row/columnheader/cell)', () => {
    const data = JSONCopy(demoData);
    const columns: TableColumnData[] = [
      { title: 'Name', dataIndex: 'name' },
      { title: 'Age', dataIndex: 'age', sortable: { sortDirections: ['ascend', 'descend'] } },
    ];
    cy.mount(Table, { props: { data, columns } });
    cy.get('.sd-table').should('have.attr', 'role', 'table');
    cy.get('.sd-table-thead').should('have.attr', 'role', 'rowgroup');
    cy.get('.sd-table-tbody').should('have.attr', 'role', 'rowgroup');
    cy.get('.sd-table-tr').first().should('have.attr', 'role', 'row');
    cy.get('.sd-table-th').first().should('have.attr', 'role', 'columnheader');
    cy.get('.sd-table-td').first().should('have.attr', 'role', 'cell');
    // 可排序列（未排序时）aria-sort=none
    cy.get('.sd-table-th').eq(1).should('have.attr', 'aria-sort', 'none');
  });

  it('merges ConfigProvider tableSpinProps with local spinProps', () => {
    cy.mount(() =>
      h(
        ConfigProvider,
        {
          spinProps: { size: 12, tip: 'Global tip' },
          tableSpinProps: { size: 31, tip: 'Table tip' },
        },
        () =>
          h(Table, {
            columns: demoColumns,
            data: demoData,
            loading: true,
            spinProps: { tip: 'Local tip' },
          }),
      ),
    );
    cy.get('.sd-spin-icon').should('have.css', 'font-size', '31px');
    cy.get('.sd-spin-tip').should('have.text', 'Local tip');
  });

  it('emits select/selectionChange/update:selectedKeys when a row checkbox is clicked', () => {
    cy.mount(Table, {
      props: {
        'columns': JSONCopy(demoColumns),
        'data': JSONCopy(demoData),
        'rowSelection': { type: 'checkbox' },
        'onSelect': cy.spy().as('onSelect'),
        'onSelectionChange': cy.spy().as('onSelectionChange'),
        'onUpdate:selectedKeys': cy.spy().as('onUpdateSelectedKeys'),
      },
    });
    cy.get('.sd-table-tbody .sd-table-operation.sd-table-checkbox .sd-checkbox').first().click();
    cy.get('.sd-table-tbody .sd-table-tr')
      .first()
      .should('have.class', 'sd-table-tr-checked')
      .find('.sd-checkbox')
      .should('have.class', 'sd-checkbox-checked');
    cy.get('@onSelect').should((spy) => {
      const [rowKeys, rowKey] = spy.firstCall.args as [string[], string];
      expect(rowKeys).to.deep.equal(['1']);
      expect(rowKey).to.equal('1');
    });
    cy.get('@onSelectionChange').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['1']);
    });
    cy.get('@onUpdateSelectedKeys').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['1']);
    });
  });

  it('selects all enabled rows from the header checkbox and skips disabled rows', () => {
    const data: TableData[] = [
      { key: '1', name: 'Jane Doe1', age: 1 },
      { key: '2', name: 'Jane Doe2', age: 2, disabled: true },
      { key: '3', name: 'Jane Doe3', age: 3 },
    ];
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data,
        rowSelection: { type: 'checkbox', showCheckedAll: true },
        onSelectAll: cy.spy().as('onSelectAll'),
        onSelectionChange: cy.spy().as('onSelectAllChange'),
      },
    });
    cy.get('.sd-table-thead .sd-table-operation.sd-table-checkbox .sd-checkbox').click();
    cy.get('.sd-table-tbody .sd-checkbox-checked').should('have.length', 2);
    cy.get('@onSelectAll').should((spy) => {
      expect(spy.firstCall.args[0]).to.equal(true);
    });
    cy.get('@onSelectAllChange').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal(['1', '3']);
    });
  });

  it('marks the header checkbox indeterminate for partial selection', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        rowSelection: { type: 'checkbox', showCheckedAll: true },
        defaultSelectedKeys: ['1'],
      },
    });
    cy.get('.sd-table-thead .sd-checkbox').should('have.class', 'sd-checkbox-indeterminate');
    cy.get('.sd-table-tbody .sd-table-operation .sd-checkbox').first().click();
    cy.get('.sd-table-thead .sd-checkbox').should('not.have.class', 'sd-checkbox-indeterminate');
  });

  it('supports radio selection replacing the previous choice', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        rowSelection: { type: 'radio' },
        onSelect: cy.spy().as('onRadioSelect'),
      },
    });
    cy.get('.sd-table-tbody .sd-table-operation.sd-table-radio .sd-radio').first().click();
    cy.get('.sd-radio-checked').should('have.length', 1);
    cy.get('.sd-table-tbody .sd-table-operation.sd-table-radio .sd-radio').eq(1).click();
    cy.get('.sd-radio-checked').should('have.length', 1);
    cy.get('@onRadioSelect').should((spy) => {
      expect(spy.secondCall.args[0]).to.deep.equal(['2']);
      expect(spy.secondCall.args[1]).to.equal('2');
    });
  });

  it('keeps controlled selectedKeys unchanged in the UI while emitting updates', () => {
    cy.mount(Table, {
      props: {
        'columns': JSONCopy(demoColumns),
        'data': JSONCopy(demoData),
        'rowSelection': { type: 'checkbox' },
        'selectedKeys': ['1'],
        'onUpdate:selectedKeys': cy.spy().as('onControlledUpdate'),
      },
    });
    cy.get('.sd-table-tbody .sd-checkbox-checked').should('have.length', 1);
    cy.get('.sd-table-tbody .sd-table-operation .sd-checkbox').first().click();
    cy.get('@onControlledUpdate').should((spy) => {
      expect(spy.firstCall.args[0]).to.deep.equal([]);
    });
    cy.get('.sd-table-tbody .sd-checkbox-checked').should('have.length', 1);
  });

  it('checks rows from defaultSelectedKeys without emitting select events', () => {
    cy.mount(Table, {
      props: {
        columns: JSONCopy(demoColumns),
        data: JSONCopy(demoData),
        rowSelection: { type: 'checkbox' },
        defaultSelectedKeys: ['2', '4'],
      },
    });
    cy.get('.sd-table-tbody .sd-checkbox-checked').should('have.length', 2);
    cy.get('@vue').should(({ wrapper }) => {
      expect(wrapper.emitted('select')).to.equal(undefined);
    });
  });

  it('applies ellipsis and align classes on cells', () => {
    const columns: TableColumnData[] = [
      { title: 'Name', dataIndex: 'name', ellipsis: true, align: 'center' },
    ];
    cy.mount(Table, { props: { columns, data: JSONCopy(demoData), pagination: false } });
    cy.get('.sd-table-tbody .sd-table-td-content')
      .first()
      .should('have.class', 'sd-table-text-ellipsis');
    cy.get('.sd-table-tbody .sd-table-cell')
      .first()
      .should('have.class', 'sd-table-cell-align-center');
  });
});
