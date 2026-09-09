import { defineComponent, ref } from 'vue';

import BasicCrudTable from '../basic-crud-table.vue';

const columns = [{ title: '名称', dataIndex: 'name' }];
const rows = [
  { key: 1, name: 'First' },
  { key: 2, name: 'Second' },
];
const modalFormProps = { schemas: [{ field: 'name', label: '名称', type: 'input' as const }] };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('BasicCrudTable async boundaries', () => {
  it('does not publish a pending fetch after unmount', () => {
    const request = deferred<unknown>();
    const fetched = cy.spy();
    const onData = cy.spy();
    cy.mount(BasicCrudTable, {
      props: {
        columns,
        'fetchTableApi': () => request.promise,
        'onTableFetched': fetched,
        'onUpdate:tableData': onData,
      },
    });
    cy.get('.sd-basic-crud-table').should('have.attr', 'aria-busy', 'true');
    cy.get('@vue').then(({ wrapper }) => wrapper.unmount());
    cy.then(() => {
      request.resolve(rows);
      return Cypress.Promise.delay(0);
    });
    cy.wrap(fetched).should('not.have.been.called');
    cy.wrap(onData).should('not.have.been.called');
  });

  it('reports asynchronous delete-content failures and shows a usable fallback', () => {
    const error = new Error('content failed');
    const onError = cy.spy();
    cy.mount(BasicCrudTable, {
      props: {
        columns,
        tableData: rows,
        fetchTableOnMounted: false,
        deleteContent: () => Promise.reject(error),
        onError,
      },
    });
    cy.contains('.sd-table-tr', 'First').contains('删除').click();
    cy.wrap(onError).should('have.been.calledWith', error);
    cy.get('.sd-popconfirm').should('be.visible').and('contain.text', '确定要删除此条记录吗？');
  });

  it('clears the previous row confirmation while the next row content is pending', () => {
    const content = deferred<string>();
    const deleteContent = cy
      .stub()
      .onFirstCall()
      .returns('Delete First?')
      .onSecondCall()
      .returns(content.promise);
    cy.mount(BasicCrudTable, {
      props: { columns, tableData: rows, fetchTableOnMounted: false, deleteContent },
    });
    cy.contains('.sd-table-tr', 'First').contains('删除').click();
    cy.get('.sd-popconfirm').should('contain.text', 'Delete First?');
    cy.get('.sd-popconfirm-footer').contains('取消').click();
    cy.get('.sd-popconfirm').should('not.be.visible');
    cy.contains('.sd-table-tr', 'Second').contains('删除').click();
    cy.get('.sd-popconfirm:visible').should('not.contain.text', 'Delete First?');
    cy.then(() => {
      content.resolve('Delete Second?');
      return Cypress.Promise.delay(0);
    });
    cy.get('.sd-popconfirm:visible').should('contain.text', 'Delete Second?');
  });

  it('keeps the latest request result when an older request finishes last', () => {
    const oldRequest = deferred<unknown>();
    const fetchTableApi = cy
      .stub()
      .onFirstCall()
      .returns(oldRequest.promise)
      .onSecondCall()
      .resolves([rows[1]]);
    const fetched = cy.spy();
    cy.mount(BasicCrudTable, { props: { columns, fetchTableApi, onTableFetched: fetched } });
    cy.wrap(fetchTableApi).should('have.been.calledOnce');
    cy.get('@vue').then(({ wrapper }) => {
      void wrapper.vm.fetchTableData();
    });
    cy.contains('Second').should('be.visible');
    cy.then(() => {
      oldRequest.resolve([rows[0]]);
      return Cypress.Promise.delay(0);
    });
    cy.get('.sd-table').should('contain.text', 'Second').and('not.contain.text', 'First');
    cy.wrap(fetched).should('have.been.calledOnce');
    cy.get('@vue').should(({ wrapper }) => expect(wrapper.vm.fetchData).to.deep.equal([rows[1]]));
  });

  it('keeps loading while the newest request is pending and suppresses stale errors', () => {
    const oldRequest = deferred<unknown>();
    const latest = deferred<unknown>();
    const fetchTableApi = cy
      .stub()
      .onFirstCall()
      .returns(oldRequest.promise)
      .onSecondCall()
      .returns(latest.promise);
    const onError = cy.spy();
    cy.mount(BasicCrudTable, { props: { columns, fetchTableApi, onError } });
    cy.wrap(fetchTableApi).should('have.been.calledOnce');
    cy.get('@vue').then(({ wrapper }) => {
      void wrapper.vm.fetchTableData();
    });
    cy.then(() => {
      oldRequest.reject(new Error('stale'));
      return Cypress.Promise.delay(0);
    });
    cy.get('.sd-basic-crud-table').should('have.attr', 'aria-busy', 'true');
    cy.wrap(onError).should('not.have.been.called');
    cy.then(() => {
      latest.resolve([rows[1]]);
      return Cypress.Promise.delay(0);
    });
    cy.contains('Second').should('be.visible');
    cy.get('.sd-basic-crud-table').should('have.attr', 'aria-busy', 'false');
  });

  it('does not commit an obsolete asynchronous transformation', () => {
    const oldTransform = deferred<unknown>();
    const transformer = cy
      .stub()
      .onFirstCall()
      .returns(oldTransform.promise)
      .onSecondCall()
      .returns([rows[1]]);
    cy.mount(BasicCrudTable, {
      props: { columns, fetchTableApi: () => [], tableDataTransformer: transformer },
    });
    cy.wrap(transformer).should('have.been.calledOnce');
    cy.get('@vue').then(({ wrapper }) => {
      void wrapper.vm.fetchTableData();
    });
    cy.contains('Second').should('be.visible');
    cy.then(() => {
      oldTransform.resolve([rows[0]]);
      return Cypress.Promise.delay(0);
    });
    cy.get('.sd-table').should('contain.text', 'Second').and('not.contain.text', 'First');
  });

  it('keeps the most recently selected edit row when details arrive out of order', () => {
    const detail = deferred<Record<string, unknown>>();
    const detailApi = cy
      .stub()
      .onFirstCall()
      .returns(detail.promise)
      .onSecondCall()
      .resolves(rows[1]);
    cy.mount(BasicCrudTable, {
      props: { columns, tableData: rows, fetchTableOnMounted: false, detailApi, modalFormProps },
    });
    cy.contains('.sd-table-tr', 'First').contains('编辑').click();
    cy.contains('.sd-table-tr', 'Second').contains('编辑').click();
    cy.get('.sd-modal input').should('have.value', 'Second');
    cy.then(() => {
      detail.resolve(rows[0]);
      return Cypress.Promise.delay(0);
    });
    cy.get('.sd-modal input').should('have.value', 'Second');
  });

  it('does not overwrite a new create form with pending edit details', () => {
    const detail = deferred<Record<string, unknown>>();
    cy.mount(BasicCrudTable, {
      props: {
        columns,
        tableData: rows,
        fetchTableOnMounted: false,
        detailApi: () => detail.promise,
        modalFormProps,
      },
    });
    cy.contains('.sd-table-tr', 'First').contains('编辑').click();
    cy.contains('button', '新建').click();
    cy.get('.sd-modal input').type('New draft');
    cy.then(() => {
      detail.resolve(rows[0]);
      return Cypress.Promise.delay(0);
    });
    cy.get('.sd-modal input').should('have.value', 'New draft');
    cy.get('.sd-modal-title').should('contain.text', '创建');
  });

  it('reports rejected submit hooks and allows retry without losing form data', () => {
    const error = new Error('submit hook failed');
    const beforeModalSubmit = cy.stub().onFirstCall().rejects(error).onSecondCall().resolves(true);
    const createApi = cy.stub().resolves();
    const onError = cy.spy();
    cy.mount(BasicCrudTable, {
      props: {
        columns,
        fetchTableOnMounted: false,
        beforeModalSubmit,
        createApi,
        onError,
        modalFormProps,
      },
    });
    cy.contains('button', '新建').click();
    cy.get('.sd-modal input').type('Retry');
    cy.get('.sd-modal-footer').contains('确定').click();
    cy.wrap(onError).should('have.been.calledWith', error);
    cy.wrap(createApi).should('not.have.been.called');
    cy.get('.sd-modal input').should('have.value', 'Retry');
    cy.get('.sd-modal-footer').contains('确定').click();
    cy.wrap(createApi).should('have.been.calledWithMatch', { name: 'Retry' });
    cy.get('.sd-modal').should('not.be.visible');
  });

  it('reports rejected delete hooks and keeps the row available for retry', () => {
    const error = new Error('delete hook failed');
    const onError = cy.spy();
    const deleteApi = cy.stub().resolves();
    cy.mount(BasicCrudTable, {
      props: {
        columns,
        tableData: rows,
        fetchTableOnMounted: false,
        beforeDelete: () => Promise.reject(error),
        deleteApi,
        onError,
      },
    });
    cy.contains('.sd-table-tr', 'First').contains('删除').click();
    cy.get('.sd-popconfirm-footer').contains('确定').click();
    cy.wrap(onError).should('have.been.calledWith', error);
    cy.wrap(deleteApi).should('not.have.been.called');
    cy.contains('.sd-table-cell', 'First').should('be.visible');
  });

  it('forwards a column slot added after the initial render', () => {
    cy.mount(
      defineComponent({
        components: { BasicCrudTable },
        setup: () => ({ active: ref(false), columns: [{ ...columns[0], slotName: 'name' }], rows }),
        template:
          '<button @click="active = !active">Toggle slot</button><BasicCrudTable :columns="columns" :table-data="rows" :fetch-table-on-mounted="false"><template v-if="active" #table__name="{ record }"><span class="custom-cell">Custom {{ record.name }}</span></template></BasicCrudTable>',
      }),
    );
    cy.get('.custom-cell').should('not.exist');
    cy.contains('button', 'Toggle slot').click();
    cy.get('.custom-cell').should('have.length', 2).first().should('have.text', 'Custom First');
    cy.contains('button', 'Toggle slot').click();
    cy.get('.custom-cell').should('not.exist');
  });
});
