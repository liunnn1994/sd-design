describe('React Upload root DOM contracts', () => {
  it('forwards native attributes to the list wrapper', () => {
    cy.visit('/upload-root.html');
    cy.get('[data-testid="upload-root"]')
      .should('have.prop', 'tagName', 'DIV')
      .and('have.class', 'sd-upload-wrapper')
      .and('have.attr', 'title', 'Upload files');
  });
  it('uses the upload span as root when the list is disabled', () => {
    cy.visit('/upload-root.html?nolist');
    cy.get('[data-testid="upload-root"]')
      .should('have.prop', 'tagName', 'SPAN')
      .and('have.class', 'sd-upload');
    cy.get('.sd-upload-wrapper').should('not.exist');
    cy.get('.sd-upload button').click();
    cy.get('output').should('have.text', 'click');
  });
  it('wraps a normal button and tip without introducing a list wrapper', () => {
    cy.visit('/upload-root.html?nolist&tip');
    cy.get('[data-testid="upload-root"]')
      .should('have.prop', 'tagName', 'SPAN')
      .and('have.attr', 'title', 'Upload files');
    cy.get('[data-testid="upload-root"] > .sd-upload-tip').should('have.text', 'Maximum one file');
    cy.get('.sd-upload-wrapper').should('not.exist');
  });
});
