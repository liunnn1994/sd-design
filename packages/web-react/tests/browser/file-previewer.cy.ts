import { expectPdfCanvasPixel } from './file-preview-pdf-assertions.js';

describe('React public FilePreviewer', () => {
  it('renders inline images without requiring visibility', () => {
    cy.visit('/file-previewer.html?inline');
    cy.get('[role="region"]').should('have.attr', 'aria-label', 'Actual preview');
    cy.get('.sd-file-previewer-inline .sd-image-img').should('have.prop', 'naturalWidth', 100);
    cy.get('.sd-file-previewer-loading').should('not.exist');
    cy.get('.sd-file-previewer-close-btn').should('not.exist');
  });
  it('delegates fullscreen images to Image preview and emits close before visible change', () => {
    cy.visit('/file-previewer.html');
    cy.get('.sd-image-preview').should('not.be.visible');
    cy.contains('button', 'Open').click();
    cy.get('.sd-image-preview').should('be.visible');
    cy.get('.sd-image-preview').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-image-preview').should('not.be.visible');
    cy.get('output').should('have.text', 'close,false');
  });
  it('mounts a custom dialog into its container, focuses and releases its overflow lock', () => {
    cy.visit('/file-previewer.html?custom&container');
    cy.contains('button', 'Open').click();
    cy.get('#preview-container > .sd-file-previewer-fullscreen')
      .should('be.focused')
      .and('have.css', 'position', 'absolute');
    cy.get('#preview-container').should('have.css', 'overflow', 'hidden');
    cy.get('[data-testid="custom"]').should('have.text', 'image:loaded:true');
    cy.get('.sd-file-previewer-mask').click({ force: true });
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('#preview-container').should('not.have.css', 'overflow', 'hidden');
    cy.get('output').should('have.text', 'close,false');
  });
  it('honors locked controls and exposes close through the public ref in uncontrolled mode', () => {
    cy.visit('/file-previewer.html?custom&uncontrolled&locked');
    cy.get('.sd-file-previewer-fullscreen').trigger('keydown', { key: 'Escape' });
    cy.get('.sd-file-previewer-mask').click({ force: true });
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('.sd-file-previewer-close-btn').should('not.exist');
    cy.contains('button', 'Ref close').click({ force: true });
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('output').should('have.text', 'close,false');
  });
  it('renders real PDF pages through the public component and closes with Escape', () => {
    cy.visit('/file-previewer.html?type=pdf');
    cy.contains('button', 'Open').click();
    cy.get('.sd-file-previewer-pdf-page').should('have.text', '1 / 2');
    cy.get('canvas').should('have.css', 'width', '100px');
    expectPdfCanvasPixel([255, 0, 0, 255]);
    cy.contains('button', 'Ref error').click({ force: true });
    cy.get('.sd-file-previewer-error[role="alert"]').should('be.visible');
    cy.contains('button', 'Ref loaded').click({ force: true });
    cy.get('.sd-file-previewer-error').should('not.exist');
    cy.get('.sd-file-previewer-fullscreen').trigger('keydown', { key: 'Escape' });
    cy.get('[role="dialog"]').should('not.exist');
    cy.get('output').should('have.text', 'close,false');
    cy.get('[data-testid="bubbles"]').should('have.text', '0');
  });
});
