describe('React Upload file lists', () => {
  it('renders custom file names and removes a text item through the keyboard', () => {
    cy.visit('/upload-list.html?custom');
    cy.get('.sd-upload-list-item-name b').should('have.text', 'Custom report.pdf');
    cy.get('.sd-upload-list-item-file-icon svg').should('exist');
    cy.get('.sd-upload-list-item-operation [role="button"]')
      .focus()
      .trigger('keydown', { eventConstructor: 'KeyboardEvent', key: 'Enter' });
    cy.get('output').should('have.text', 'remove:one');
    cy.get('.sd-upload-list-item').should('not.exist');
  });
  it('retries an error, displays progress and cancels the upload', () => {
    cy.visit('/upload-list.html?error');
    cy.get('.sd-upload-icon-upload').click();
    cy.get('.sd-upload-list-item-uploading .sd-progress').should('exist');
    cy.get('.sd-upload-icon-cancel').click();
    cy.get('.sd-upload-list-item-error').should('exist');
    cy.get('output').should('have.text', 'upload:one|abort:one');
  });
  it('renders thumbnails and download links with the original filename', () => {
    cy.visit('/upload-list.html?picture&link');
    cy.get('.sd-upload-list-item-thumbnail img').should('have.attr', 'alt', 'report.pdf');
    cy.get('.sd-upload-list-item-name-link').should('have.attr', 'download', 'report.pdf');
    cy.get('.sd-upload-list-item-name-link').should('have.attr', 'target', '_blank');
  });
  it('renders card previews and activates card start actions by keyboard', () => {
    cy.visit('/upload-list.html?card&init&custom');
    cy.get('.sd-upload-list-picture').should('contain.text', 'Custom image');
    cy.get('.sd-upload-icon-start').then(($action) => {
      const win = $action[0].ownerDocument.defaultView!;
      $action[0].dispatchEvent(new win.KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
    });
    cy.get('output').should('have.text', 'upload:one');
    cy.get('.sd-upload-list-picture .sd-progress').should('exist');
  });
});
