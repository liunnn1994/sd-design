import { defineComponent, h, provide, ref } from 'vue';

import type { TableData, TableDataWithRaw } from '../interface';

import { tableInjectionKey, type TableContext } from '../context';
import Table from '../index';
import Td from '../table-td.vue';

describe('Table cell foundation adapters', () => {
  it('deduplicates pending loads and supplies the current record on delayed completion', () => {
    const record = ref<TableDataWithRaw>({ key: 'old', raw: { key: 'old', name: 'Old' } });
    let finish: (children?: TableData[]) => void;
    const load = cy
      .spy((raw: TableData, done: typeof finish) => {
        expect(raw.key).to.equal('old');
        finish = done;
      })
      .as('load');
    const add = cy.spy().as('add');
    const context = { loadMore: load, addLazyLoadData: add };
    cy.mount(
      defineComponent({
        setup() {
          provide(tableInjectionKey, context as unknown as TableContext);
          return () =>
            h(Td, {
              record: record.value,
              column: { dataIndex: 'name' },
              showExpandBtn: true,
              renderExpandBtn: () => h('button', { class: 'cell-foundation-expand' }, 'Load'),
            });
        },
      }),
    );
    cy.get('.cell-foundation-expand').click();
    cy.get('.sd-icon-loading').should('exist');
    cy.get('.sd-table-cell-inline-icon').click();
    cy.get('@load').should('have.been.calledOnce');
    cy.then(() => {
      record.value = { key: 'new', raw: { key: 'new', name: 'New' } };
      finish!([{ key: 'child' }]);
    });
    cy.get('.sd-icon-loading').should('not.exist');
    cy.get('.sd-table-td-content').should('have.text', 'New');
    cy.get('@add').should(() => {
      expect(add.callCount).to.equal(1);
      expect(add.firstCall.args[0]).to.deep.equal([{ key: 'child' }]);
      expect(add.firstCall.args[1]).to.equal(record.value);
      expect(add.firstCall.thisValue).to.equal(context);
    });
  });

  it('keeps rejected tree checkbox selection and header status until controlled keys update', () => {
    const selected = ref<Array<string | number>>([0]);
    let requested: Array<string | number> = [];
    cy.mount(
      defineComponent({
        setup: () => () =>
          h(Table, {
            'data': [
              {
                key: 'p',
                name: 'Parent',
                children: [
                  { key: 0, name: 'Zero', isLeaf: true },
                  { key: 1, name: 'One', isLeaf: true },
                  { key: 2, name: 'Disabled', isLeaf: true, disabled: true },
                ],
              },
            ],
            'columns': [{ dataIndex: 'name' }],
            'pagination': false,
            'defaultExpandAllRows': true,
            'rowSelection': { type: 'checkbox', checkStrictly: false },
            'selectedKeys': selected.value,
            'onUpdate:selectedKeys': (keys) => {
              requested = keys;
            },
          }),
      }),
    );
    cy.get('.sd-table-tbody [role="row"]')
      .first()
      .find('.sd-checkbox')
      .should('have.class', 'sd-checkbox-indeterminate')
      .click();
    cy.then(() => {
      expect(requested).to.include(0).and.include(1);
      expect(requested).not.to.include(2);
    });
    cy.get('.sd-table-tbody [role="row"]')
      .first()
      .find('.sd-checkbox')
      .should('have.class', 'sd-checkbox-indeterminate');
    cy.then(() => {
      selected.value = requested;
    });
    cy.get('.sd-table-tbody [role="row"]')
      .first()
      .find('input[type="checkbox"]')
      .should('be.checked');
    cy.get('.sd-table-tbody [role="row"]')
      .last()
      .find('input[type="checkbox"]')
      .should('be.disabled')
      .and('not.be.checked');
  });
});
