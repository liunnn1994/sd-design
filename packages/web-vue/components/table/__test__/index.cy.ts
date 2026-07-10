import { reactive, ref } from 'vue';

import type { TableColumnData, TableData } from '../interface';

import Table from '../table';

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
});
