import { expectPdfCanvasPixel } from './file-preview-pdf-assertions.js';

describe('React FilePreviewer PDF view', () => {
  it('renders the actual toolbar, page boundary buttons and scaled canvas', () => {
    cy.visit('/file-preview-pdf-view.html');
    cy.get('.sd-file-previewer-pdf-page').should('have.text', '1 / 2');
    expectPdfCanvasPixel([255, 0, 0, 255]);
    cy.get('.sd-file-previewer-pdf-btn').first().should('be.disabled');
    cy.get('.sd-file-previewer-pdf-btn').last().click().should('be.disabled');
    cy.get('.sd-file-previewer-pdf-page').should('have.text', '2 / 2');
    expectPdfCanvasPixel([0, 0, 255, 255]);
    cy.contains('button', 'Scale').click();
    cy.get('canvas').should('have.css', 'width', '200px');
    expectPdfCanvasPixel([0, 0, 255, 255]);
  });
  it('shows actual PDF loading errors', () => {
    cy.visit('/file-preview-pdf-view.html?invalid');
    cy.get('.sd-file-previewer-error[role="alert"]').should('be.visible');
    cy.get('.sd-file-previewer-loading').should('not.exist');
  });
  it('exposes custom PDF state and resumes default canvas rendering when the slot changes', () => {
    cy.visit('/file-preview-pdf-view.html?custom');
    cy.get('[data-testid="custom-pdf"]')
      .should('have.text', 'loaded:1/2')
      .click()
      .should('have.text', 'loaded:2/2');
    cy.contains('button', 'Toggle custom').click();
    cy.get('.sd-file-previewer-pdf-page').should('have.text', '2 / 2');
    cy.get('canvas').should('have.css', 'width', '100px');
    expectPdfCanvasPixel([0, 0, 255, 255]);
  });
});
