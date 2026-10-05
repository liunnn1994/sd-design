import BasicCrudTable from '../basic-crud-table.vue';

describe('BasicCrudTable pending submission lifecycle', () => {
  it('does not submit a replacement form when the previous submit hook completes', () => {
    let resolveHook!: (value: boolean) => void;
    const beforeModalSubmit = cy.stub().returns(
      new Promise<boolean>((resolve) => {
        resolveHook = resolve;
      }),
    );
    const createApi = cy.stub().resolves();
    const updateApi = cy.stub().resolves();
    cy.mount(BasicCrudTable, {
      props: {
        columns: [{ title: 'Name', dataIndex: 'name' }],
        tableData: [{ key: 1, name: 'Original' }],
        fetchTableOnMounted: false,
        beforeModalSubmit,
        createApi,
        updateApi,
        modalFormProps: { schemas: [{ field: 'name', label: 'Name', type: 'input' }] },
      },
      global: { stubs: { transition: false } },
    });
    cy.contains('.sd-table-tr', 'Original').contains('编辑').click();
    cy.get('.sd-modal input').should('have.value', 'Original');
    cy.get('.sd-modal-footer').contains('确定').click();
    cy.wrap(beforeModalSubmit).should('have.been.calledOnce');
    cy.get('.sd-modal-footer').contains('取消').click();
    cy.get('.sd-modal').should('not.be.visible');
    cy.get('.sd-modal-container').should('not.be.visible');
    cy.contains('button', '新建').click();
    cy.get('.sd-modal input').type('Replacement');
    cy.then(() => {
      resolveHook(true);
      return Cypress.Promise.delay(0);
    });
    cy.wrap(createApi).should('not.have.been.called');
    cy.wrap(updateApi).should('not.have.been.called');
    cy.get('.sd-modal').should('be.visible');
    cy.get('.sd-modal input').should('have.value', 'Replacement');
  });
});
