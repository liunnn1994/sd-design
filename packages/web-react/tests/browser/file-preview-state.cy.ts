describe('React FilePreviewer shared state adapter', () => {
  it('tracks load/error and closes fullscreen with native Escape in event order', () => {
    cy.visit('/file-preview-state.html');
    cy.get('[data-testid="status"]').should('have.text', 'loading');
    cy.contains('button', 'Load').click();
    cy.get('[data-testid="status"]').should('have.text', 'loaded');
    cy.contains('button', 'Error').click();
    cy.get('[data-testid="status"]').should('have.text', 'error');
    cy.get('[data-testid="keyboard"]').trigger('keydown', {
      eventConstructor: 'KeyboardEvent',
      key: 'Escape',
    });
    cy.get('[data-testid="events"]').should('have.text', 'close|visible:false');
    cy.get('[data-testid="render"]').should('have.text', 'false');
  });
  it('keeps controlled visibility authoritative and inline files rendered after close', () => {
    cy.visit('/file-preview-state.html?controlled');
    cy.contains('button', 'Close').click();
    cy.get('[data-testid="visible"]').should('have.text', 'true');
    cy.visit('/file-preview-state.html?inline');
    cy.contains('button', 'Close').click();
    cy.get('[data-testid="render"]').should('have.text', 'true');
  });
  it('marks custom content loaded and restarts source load status', () => {
    cy.visit('/file-preview-state.html?custom');
    cy.get('[data-testid="status"]').should('have.text', 'loaded');
    cy.visit('/file-preview-state.html');
    cy.contains('button', 'Load').click();
    cy.contains('button', 'Replace').click();
    cy.get('[data-testid="status"]').should('have.text', 'loading');
  });
  it('ignores stale media preparation after switching to an image', () => {
    cy.visit('/file-preview-state.html?media');
    cy.get('[data-testid="status"]').should('have.text', 'loading');
    cy.contains('button', 'Image').click();
    cy.contains('button', 'Resolve media').click();
    cy.get('[data-testid="status"]').should('have.text', 'loading');
  });
});
