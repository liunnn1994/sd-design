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
    cy.contains('button', /^Submit$/).click();
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

  it('ignores duplicate submission and stale progress, success and error after retrying', () => {
    cy.visit('/upload-state.html');
    const events = () => cy.get('[data-testid="events"]');
    const files = () => cy.get('[data-testid="files"]');
    file();
    files().should('contain.text', 'uploading');
    cy.contains('button', 'Submit first file').click();
    events().should(($output) => {
      expect(
        $output
          .text()
          .split('|')
          .filter((event) => event === 'request'),
      ).to.have.length(1);
    });
    cy.contains('button', 'Abort').click();
    files().should('contain.text', 'error');
    cy.contains('button', 'Submit first file').click();
    cy.contains('button', 'Progress').click();
    cy.contains('button', 'Replay first request').click();
    files().should('have.text', '[{"name":"file.txt","status":"uploading","percent":0.5}]');
    events().should(($output) => {
      const requestEvents = $output.text().split('|');
      expect(requestEvents.filter((event) => event === 'request')).to.have.length(2);
      expect(requestEvents.filter((event) => event === 'error')).to.have.length(1);
      expect(requestEvents).not.to.include('success');
    });
    cy.contains('button', 'Success').click();
    files().should('contain.text', 'done');
    events().should('contain.text', 'success|list|change|form');
  });

  it('does not start a request when pending validation approves after unmount', () => {
    cy.visit('/upload-state.html?pending');
    const events = () => cy.get('[data-testid="events"]');
    file();
    events().should('have.text', 'validation');
    cy.contains('button', 'Unmount').click();
    cy.get('input[type="file"]').should('not.exist');
    cy.contains('button', 'Allow upload').click();
    events().should('have.text', 'validation|validated');
  });
});
