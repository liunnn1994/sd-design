describe('React Upload controlled files and Form', () => {
  it('reflects in-place external file changes and array removal after React rerenders', () => {
    cy.visit('/upload-form.html');
    cy.contains('button', 'Seed').click();
    cy.get('.sd-upload-list-item').should('contain.text', 'original.txt');
    cy.contains('button', 'Mutate').click();
    cy.get('.sd-upload-list-item-error').should('contain.text', 'renamed.txt');
    cy.contains('button', 'Clear external').click();
    cy.get('.sd-upload-list-item').should('not.exist');
  });
  it('updates the controlled list and validates removal through Form change', () => {
    cy.visit('/upload-form.html');
    cy.get('input[type="file"]').selectFile(
      { contents: Cypress.Buffer.from('file'), fileName: 'form.txt' },
      { force: true },
    );
    cy.get('output').should('have.text', '1');
    cy.get('.sd-upload-icon-remove').click();
    cy.get('output').should('have.text', '0');
    cy.contains('Attach a file').should('be.visible');
  });
  it('inherits Form disabled state for input and remove actions', () => {
    cy.visit('/upload-form.html');
    cy.contains('button', 'Seed').click();
    cy.contains('button', 'Disable').click();
    cy.get('input[type="file"]').should('be.disabled');
    cy.get('.sd-upload-icon-remove').click();
    cy.get('.sd-upload-list-item').should('exist');
  });
});
