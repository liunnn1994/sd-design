describe('React Upload root composition', () => {
  it('uploads from the actual input and updates/removes the real list', () => {
    cy.visit('/upload-root.html');
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('body'), fileName: 'file.txt' },
      { force: true },
    );
    cy.get('.sd-upload-list-item-uploading').should('contain.text', 'file.txt');
    cy.get('.sd-upload-hide').should('exist');
    cy.contains('button', 'Complete').click();
    cy.get('.sd-upload-list-item-done').should('exist');
    cy.get('output').should('have.text', 'success:file.txt');
    cy.get('.sd-upload-icon-remove').click();
    cy.get('.sd-upload-list-item').should('not.exist');
    cy.get('.sd-upload-hide').should('not.exist');
  });
  it('submits a waiting file through the public ref', () => {
    cy.visit('/upload-root.html?manual');
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('body'), fileName: 'manual.txt' },
      { force: true },
    );
    cy.get('.sd-upload-list-item-init').should('exist');
    cy.contains('button', 'Submit').click();
    cy.get('.sd-upload-list-item-uploading').should('exist');
  });
  it('opens the shared image preview and reports the original file', () => {
    cy.visit('/upload-root.html?picture');
    cy.get('.sd-upload-list-item-name-text').click();
    cy.get('.sd-image-preview-wrapper').should('be.visible');
    cy.get('.sd-image-preview-img').should('have.attr', 'src').and('include', 'data:image/svg+xml');
    cy.get('output').should('have.text', 'preview:preview.svg');
    cy.get('.sd-image-preview-close-btn').click();
    cy.get('.sd-image-preview-wrapper').should('not.exist');
  });
});
