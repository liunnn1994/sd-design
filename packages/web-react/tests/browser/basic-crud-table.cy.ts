describe('React BasicCrudTable integrated view', () => {
  it('constrains full-height tables to the parent and scrolls actual rows internally', () => {
    cy.visit('/basic-crud-table.html?full-height');
    cy.get('.sd-basic-crud-table')
      .should('have.class', 'consumer-crud')
      .and('have.css', 'max-width', '900px');
    cy.get('.sd-basic-crud-table').should(($root) => {
      expect($root[0].offsetHeight).to.be.closeTo($root[0].parentElement!.offsetHeight, 1);
    });
    cy.get('.sd-table-body [data-overlayscrollbars-viewport]')
      .should(($viewport) => {
        expect($viewport[0].scrollHeight).to.be.greaterThan($viewport[0].clientHeight);
      })
      .scrollTo('bottom');
    cy.contains('.sd-table-body .sd-table-tr', 'Person 19')
      .find('.sd-table-cell')
      .first()
      .should('be.visible');
  });
  const firstRow = () => cy.get('.sd-table-tbody .sd-table-tr').first();
  const filter = () => cy.get('.sd-toolbar input');
  const modalName = () => cy.get('.sd-modal input');
  it('fetches, searches and exposes the actual current rows through its ref', () => {
    cy.visit('/basic-crud-table.html');
    firstRow().should('contain.text', 'Alpha');
    cy.get('.sd-pagination-item').contains('2').click();
    firstRow().should('contain.text', 'Beta');
    filter().type('Gamma{enter}');
    firstRow().should('contain.text', 'Gamma');
    cy.get('[data-testid="params"]')
      .should('contain.text', '"current":1')
      .and('contain.text', '"q":"Gamma"');
    cy.get('[data-testid="events"]').should('contain.text', 'toolbar-search|fetched:1|search');
    cy.contains('button', 'Read instance').click();
    cy.get('[data-testid="instance"]').should('contain.text', '"name":"Gamma"');
  });
  it('sorts remotely and separates toolbar-only, table-only and complete resets', () => {
    cy.visit('/basic-crud-table.html');
    firstRow().should('contain.text', 'Alpha');
    cy.contains('.sd-table-th', 'Name').click().click();
    firstRow().should('contain.text', 'Gamma');
    cy.get('[data-testid="params"]').should('contain.text', '"sort_by":"-name"');
    filter().type('Beta{enter}');
    firstRow().should('contain.text', 'Beta');
    cy.contains('button', 'Reset table only').click();
    filter().should('have.value', 'Beta');
    cy.get('[data-testid="params"]')
      .should('not.contain.text', 'sort_by')
      .and('contain.text', '"q":"Beta"');
    cy.get('[data-testid="requests"]')
      .invoke('text')
      .then((count) => {
        cy.contains('button', 'Reset toolbar only').click();
        filter().should('have.value', '');
        cy.get('[data-testid="requests"]').should('have.text', count);
      });
    cy.contains('button', 'Reset all').click();
    firstRow().should('contain.text', 'Alpha');
  });
  it('performs edit/create submissions and refreshes after each success', () => {
    cy.visit('/basic-crud-table.html');
    firstRow().should('contain.text', 'Alpha').contains('编辑').click();
    modalName().should('have.value', 'Alpha').clear().type('Changed');
    cy.contains('.sd-modal-footer button', '确定').click();
    firstRow().should('contain.text', 'Changed');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'updated')
      .and('contain.text', 'success:update result');
    cy.contains('.sd-toolbar button', '新建').click();
    modalName().should('have.value', '').type('New person');
    cy.contains('.sd-modal-footer button', '确定').click();
    cy.get('[data-testid="events"]')
      .should('contain.text', 'created')
      .and('contain.text', 'success:create result');
    cy.get('.sd-pagination-item').contains('4').click();
    firstRow().should('contain.text', 'New person');
  });
  it('uses asynchronous row-specific deletion confirmation and honors beforeDelete vetoes', () => {
    cy.visit('/basic-crud-table.html?custom-delete');
    firstRow().should('contain.text', 'Alpha').contains('删除').click();
    cy.get('.sd-popconfirm-content').should('contain.text', 'Remove Alpha?');
    cy.contains('.sd-popconfirm button', '确定').click();
    firstRow().should('contain.text', 'Beta');
    cy.get('[data-testid="events"]').should('contain.text', 'delete:1|deleted');
    cy.visit('/basic-crud-table.html?veto-delete');
    firstRow().should('contain.text', 'Alpha').contains('删除').click();
    cy.contains('.sd-popconfirm button', '确定').click();
    firstRow().should('contain.text', 'Alpha');
    cy.get('[data-testid="events"]').should('not.contain.text', 'delete:');
  });
  it('handles controlled model updates and removes only empty request values', () => {
    cy.visit('/basic-crud-table.html?controlled&exclude');
    firstRow().should('contain.text', 'Alpha');
    cy.get('[data-testid="params"]')
      .should('not.contain.text', '"q"')
      .and('not.contain.text', '"nil"')
      .and('contain.text', '"zero":0')
      .and('contain.text', '"flag":false');
    filter().type('Beta{enter}');
    firstRow().should('contain.text', 'Beta');
    cy.get('.sd-basic-crud-table').should('have.attr', 'aria-busy', 'false');
  });
  it('keeps newer fetch results and invalidates pending requests after unmount', () => {
    cy.visit('/basic-crud-table.html?deferred');
    cy.contains('button', 'Fetch first').click();
    cy.contains('button', 'Fetch second').click();
    cy.get('.sd-basic-crud-table').should('have.attr', 'aria-busy', 'true');
    cy.contains('button', 'Resolve second').click();
    firstRow().should('contain.text', 'Latest row');
    cy.contains('button', 'Resolve first').click();
    firstRow().should('contain.text', 'Latest row');
    cy.get('[data-testid="events"]').should('have.text', 'fetched:1');
    cy.visit('/basic-crud-table.html?deferred');
    cy.contains('button', 'Fetch first').click();
    cy.contains('button', 'Unmount').click();
    cy.contains('button', 'Resolve first').click();
    cy.get('[data-testid="events"]').should('have.text', '');
  });
  it('forwards namespaced header, toolbar, table and modal slots', () => {
    cy.visit('/basic-crud-table.html?slots');
    cy.get('[data-testid="title"]').should('have.text', 'Title:People');
    cy.get('[data-testid="toolbar-action"]').should('have.text', 'Middle');
    cy.get('[data-testid="person"]').first().should('have.text', 'Person:Alpha');
    cy.get('[data-testid="row-action"]').should('have.text', 'Before');
    firstRow().contains('编辑').click();
    cy.get('[data-testid="modal-title"]').first().should('have.text', 'Modal:edit');
    cy.get('[data-testid="native-extra"]').should('have.text', 'Native field extra');
  });
});
