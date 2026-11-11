describe('React Upload shared lifecycle adapter', () => {
  const file = (name = 'file.txt') =>
    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('payload'),
      fileName: name,
      mimeType: 'text/plain',
    });
  it('uploads selected files, reflects progress and completes in shared event order', () => {
    cy.visit('/upload-state.html');
    file();
    cy.get('[data-testid="files"]').should('contain.text', 'uploading');
    cy.contains('button', 'Progress').click();
    cy.get('[data-testid="files"]').should('contain.text', '0.5');
    cy.contains('button', 'Success').click();
    cy.get('[data-testid="files"]').should('contain.text', 'done');
    cy.get('[data-testid="events"]').should('contain.text', 'success|list|change|form');
  });
  it('retains init files for manual submission and enforces the file limit', () => {
    cy.visit('/upload-state.html?manual');
    file();
    cy.get('[data-testid="files"]').should('contain.text', 'init');
    file('other.txt');
    cy.get('[data-testid="events"]').should('contain.text', 'exceed');
    cy.contains('button', 'Submit').click();
    cy.get('[data-testid="files"]').should('contain.text', 'uploading');
  });
  it('rejects before-upload validation and ignores callbacks after abort', () => {
    cy.visit('/upload-state.html');
    file('reject.txt');
    cy.get('[data-testid="files"]').should('have.text', '[]');
    file();
    cy.contains('button', 'Abort').click();
    cy.contains('button', 'Success').click();
    cy.get('[data-testid="files"]').should('contain.text', 'error');
    cy.get('[data-testid="events"]')
      .should('contain.text', 'abort|error')
      .and('not.contain.text', 'success');
  });
  it('aborts active work on unmount under StrictMode', () => {
    cy.visit('/upload-state.html');
    file();
    cy.contains('button', 'Unmount').click();
    cy.get('[data-testid="events"]').should('contain.text', 'abort');
    cy.get('input[type="file"]').should('not.exist');
  });
});
