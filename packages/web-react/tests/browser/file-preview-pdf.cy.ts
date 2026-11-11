import { expectPdfCanvasPixel } from './file-preview-pdf-assertions.js';

describe('React FilePreviewer real pdf.js adapter', () => {
  it('loads the real document, paints its canvas and navigates pages', () => {
    cy.visit('/file-preview-pdf.html');
    cy.get('[data-testid="status"]').should('have.text', 'loaded');
    cy.get('[data-testid="page"]').should('have.text', '1/2');
    cy.get('canvas').should('have.css', 'width', '100px');
    cy.get('[data-testid="painted"]').should(($output) =>
      expect(Number($output.text())).to.be.greaterThan(0),
    );
    expectPdfCanvasPixel([255, 0, 0, 255]);
    cy.contains('button', 'Next').click();
    cy.get('[data-testid="page"]').should('have.text', '2/2');
    expectPdfCanvasPixel([0, 0, 255, 255]);
    cy.contains('button', 'Next').click();
    cy.get('[data-testid="page"]').should('have.text', '2/2');
    cy.contains('button', 'Previous').click();
    cy.get('[data-testid="page"]').should('have.text', '1/2');
    expectPdfCanvasPixel([255, 0, 0, 255]);
  });
  it('rerenders at a new scale and destroys document state', () => {
    cy.visit('/file-preview-pdf.html');
    cy.get('[data-testid="status"]').should('have.text', 'loaded');
    cy.contains('button', 'Scale').click();
    cy.get('canvas').should('have.css', 'width', '200px');
    expectPdfCanvasPixel([255, 0, 0, 255]);
    cy.contains('button', 'Destroy').click();
    cy.get('[data-testid="page"]').should('have.text', '1/0');
  });
});
