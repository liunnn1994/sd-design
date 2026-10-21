import { defineComponent, h, reactive, ref, type Ref } from 'vue';

import type { TableContext } from '../context';
import type { TableColumnData } from '../interface';

import { useColumnFilter } from '../hooks/use-column-filter';
import { useColumnSorter } from '../hooks/use-column-sorter';

describe('Table column foundation hook adapters', () => {
  it('retains ref identity for equal external filters and preserves controlled confirm/reset order', () => {
    let api!: ReturnType<typeof useColumnFilter>, context!: Partial<TableContext>;
    const requests: unknown[] = [];
    cy.mount(
      defineComponent({
        setup() {
          const column = ref<TableColumnData>({
            dataIndex: 'name',
            filterable: { multiple: true, filter: () => true },
          });
          context = reactive<Partial<TableContext>>({
            filters: { name: ['alpha'] },
            onFilterChange(field, values) {
              requests.push({ field, values: [...values], visible: api.filterPopupVisible.value });
            },
          });
          api = useColumnFilter({ column, tableCtx: context });
          return () =>
            h('div', [
              h('output', { id: 'hook-column-draft' }, JSON.stringify(api.columnFilterValue.value)),
              h('output', { id: 'hook-column-active' }, String(api.isFilterActive.value)),
              h('output', { id: 'hook-column-visible' }, String(api.filterPopupVisible.value)),
            ]);
        },
      }),
    );
    cy.get('#hook-column-draft').should('have.text', '["alpha"]');
    let draft: string[];
    cy.then(() => {
      api.setFilterValue(['beta']);
      draft = api.columnFilterValue.value;
      context.filters = { name: ['beta'] };
    });
    cy.get('#hook-column-draft').should('have.text', '["beta"]');
    cy.then(() => expect(api.columnFilterValue.value).to.equal(draft));
    cy.then(() => {
      context.filters = { name: ['external'] };
    });
    cy.get('#hook-column-draft').should('have.text', '["external"]');
    cy.then(() => expect(api.columnFilterValue.value).to.equal(context.filters!.name));
    cy.then(() => {
      api.handleRadioFilterChange('pending');
      api.handleFilterPopupVisibleChange(true);
      api.handleFilterConfirm(new Event('confirm'));
    });
    cy.get('#hook-column-visible').should('have.text', 'false');
    cy.get('#hook-column-draft').should('have.text', '["pending"]');
    cy.get('#hook-column-active').should('have.text', 'true');
    cy.then(() => {
      expect(context.filters!.name).to.deep.equal(['external']);
      api.handleFilterPopupVisibleChange(true);
      api.handleFilterReset(new Event('reset'));
    });
    cy.get('#hook-column-draft').should('have.text', '[]');
    cy.then(() =>
      expect(requests).to.deep.equal([
        { field: 'name', values: ['pending'], visible: true },
        { field: 'name', values: [], visible: true },
      ]),
    );
  });
  it('recomputes sorter refs for replaced columns and rejected or accepted controlled requests', () => {
    let api!: ReturnType<typeof useColumnSorter>,
      column!: Ref<TableColumnData>,
      context!: Partial<TableContext>;
    const requests: unknown[] = [];
    cy.mount(
      defineComponent({
        setup() {
          column = ref<TableColumnData>({
            dataIndex: 'name',
            sortable: { sortDirections: ['ascend', 'descend'] },
          });
          context = reactive<Partial<TableContext>>({
            sorter: { field: 'name', direction: 'ascend' },
            onSorterChange(field, direction) {
              requests.push({ field, direction });
            },
          });
          api = useColumnSorter({ column, tableCtx: context });
          return () =>
            h(
              'output',
              { id: 'hook-column-sort' },
              JSON.stringify({
                current: api.sortOrder.value,
                next: api.nextSortOrder.value,
                asc: api.hasAscendBtn.value,
                desc: api.hasDescendBtn.value,
              }),
            );
        },
      }),
    );
    cy.get('#hook-column-sort').should(
      'have.text',
      '{"current":"ascend","next":"descend","asc":true,"desc":true}',
    );
    cy.then(() => api.handleClickSorter(new Event('sort')));
    cy.get('#hook-column-sort').should('contain.text', '"current":"ascend"');
    cy.then(() => {
      column.value = { dataIndex: 'age', sortable: { sortDirections: ['descend'] } };
    });
    cy.get('#hook-column-sort').should('have.text', '{"next":"descend","asc":false,"desc":true}');
    cy.then(() => api.handleClickSorter(new Event('sort')));
    cy.then(() => {
      context.sorter = { field: 'age', direction: 'descend' };
    });
    cy.get('#hook-column-sort').should(
      'have.text',
      '{"current":"descend","next":"","asc":false,"desc":true}',
    );
    cy.then(() =>
      expect(requests).to.deep.equal([
        { field: 'name', direction: 'descend' },
        { field: 'age', direction: 'descend' },
      ]),
    );
  });
});
