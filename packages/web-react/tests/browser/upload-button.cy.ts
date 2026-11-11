describe('React Upload file input and drop view', () => {
  const file = (name: string) => ({
    contents: Cypress.Buffer.from('payload'),
    fileName: name,
    mimeType: name.endsWith('.txt') ? 'text/plain' : 'image/png',
  });
  it('resets the hidden native input so the same file can be selected again', () => {
    cy.visit('/upload-button.html');
    cy.get('input[type="file"]').selectFile(file('same.txt'), { force: true });
    cy.get('input[type="file"]')
      .should('have.value', '')
      .selectFile(file('same.txt'), { force: true });
    cy.get('output').should('have.text', '["same.txt","same.txt"]');
  });
  it('filters dropped files by accept and limits single selection', () => {
    cy.visit('/upload-button.html');
    cy.get('.sd-upload').selectFile([file('image.png'), file('one.txt'), file('two.txt')], {
      action: 'drag-drop',
    });
    cy.get('output').should('have.text', '["one.txt"]');
    cy.get('.sd-upload-drag-active').should('not.exist');
  });
  it('accepts multiple drops and ignores drops while disabled', () => {
    cy.visit('/upload-button.html?multiple');
    cy.get('.sd-upload').selectFile([file('one.txt'), file('two.txt')], { action: 'drag-drop' });
    cy.get('output').should('have.text', '["one.txt","two.txt"]');
    cy.contains('button', 'Toggle disabled').click();
    cy.get('input').should('be.disabled');
    cy.get('.sd-upload').selectFile(file('other.txt'), { action: 'drag-drop' });
    cy.get('output').should('have.text', '["one.txt","two.txt"]');
  });
  it('renders picture-card and directory selection attributes', () => {
    cy.visit('/upload-button.html?card&directory');
    cy.get('.sd-upload-picture-card').should('contain.text', 'Text files');
    cy.get('input').should('have.attr', 'webkitdirectory');
    cy.get('input').should('have.attr', 'accept', '.txt');
  });
});
