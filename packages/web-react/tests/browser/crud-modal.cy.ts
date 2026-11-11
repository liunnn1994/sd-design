describe('React BasicCrudModal adapter', () => {
  const input = () => cy.get('.sd-modal input');
  const ok = () => cy.contains('.sd-modal-footer button', '确定');
  const cancel = () => cy.contains('.sd-modal-footer button', '取消');
  it('validates and submits create/edit models through actual Form and Modal', () => {
    cy.visit('/crud-modal.html');
    cy.contains('button', 'Create').click();
    input().should('have.value', 'Initial').clear();
    ok().click();
    cy.get('.sd-form-item-message').should('be.visible');
    cy.get('[data-testid="events"]').should('have.text', '');
    input().type('Created');
    ok().click();
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'create:Created|success:created:create:Created|close',
    );
    cy.contains('button', 'Edit one').click();
    input().should('have.value', 'Original').clear().type('Edited');
    ok().click();
    cy.get('[data-testid="events"]').should(
      'contain.text',
      'update:Edited|success:updated:edit:Edited|close',
    );
  });
  it('restores the original create snapshot after closing edited data', () => {
    cy.visit('/crud-modal.html');
    cy.contains('button', 'Edit one').click();
    input().clear().type('Changed');
    cancel().click();
    cy.contains('button', 'Create').click();
    input().should('have.value', 'Initial');
  });
  it('ignores stale detail results after a newer open', () => {
    cy.visit('/crud-modal.html?deferred');
    cy.contains('button', 'Edit one').click();
    cy.contains('button', 'Edit two').click();
    cy.contains('button', 'Resolve second').click();
    input().should('have.value', 'Current second');
    // Test controls resolve promises behind the active modal.
    cy.contains('button', 'Resolve first').click({ force: true });
    input().should('have.value', 'Current second');
    cy.get('[data-testid="status"]').should('have.text', 'false');
  });
  it('cancels previous submit hooks when closing and opening a replacement form', () => {
    cy.visit('/crud-modal.html?hook');
    cy.contains('button', 'Edit one').click();
    ok().click();
    cy.get('[data-testid="events"]').should('have.text', 'hook');
    cancel().click();
    cy.contains('button', 'Create').click();
    input().clear().type('Replacement');
    cy.contains('button', 'Resolve hook').click({ force: true });
    input().should('be.visible').and('have.value', 'Replacement');
    cy.get('[data-testid="events"]').should('have.text', 'hook|close');
  });
  it('reports detail and submit errors and keeps failed submissions open', () => {
    cy.visit('/crud-modal.html?failure&api-failure');
    cy.contains('button', 'Edit one').click();
    cy.get('[data-testid="status"]').should('have.text', 'false');
    cy.get('[data-testid="events"]').should('have.text', 'error:detail failed');
    cy.contains('button', 'Create').click();
    ok().click();
    input().should('be.visible');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'create:Initial|error:create failed')
      .and('not.contain.text', 'success');
  });
  it('transforms edit details and forwards modal context into title and field slots', () => {
    cy.visit('/crud-modal.html?transform&slots');
    cy.contains('button', 'Edit one').click();
    input().should('have.value', 'Original transformed');
    cy.get('[data-testid="title"]').first().should('have.text', 'Mode:edit');
    cy.get('[data-testid="field-scope"]').should('have.text', 'edit:Original transformed');
  });
  it('allows submit vetoes and invalidates detail loads on unmount', () => {
    cy.visit('/crud-modal.html?blocked');
    cy.contains('button', 'Create').click();
    ok().click();
    input().should('be.visible');
    cy.get('[data-testid="events"]').should('have.text', '');
    cy.visit('/crud-modal.html?deferred');
    cy.contains('button', 'Edit one').click();
    cy.contains('button', 'Unmount').click();
    cy.contains('button', 'Resolve first').click();
    cy.get('[data-testid="status"]').should('have.text', 'false');
    cy.get('.sd-modal').should('not.exist');
  });
});
