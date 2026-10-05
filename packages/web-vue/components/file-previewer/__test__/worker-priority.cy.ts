import { defineComponent, h } from 'vue';

import type { FilePreviewerPdfProps } from '../types';

import workerSrc from '../pdfjs-worker-url';
import { usePdfJs } from '../use-pdf-js';

function createTestPdf() {
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources <<>> /Contents 5 0 R >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources <<>> /Contents 6 0 R >>',
    '<< /Length 0 >>\nstream\n\nendstream',
    '<< /Length 0 >>\nstream\n\nendstream',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((object, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

describe('FilePreviewer PDF worker priority', () => {
  let port: Worker;
  let pdf: ReturnType<typeof usePdfJs>;
  afterEach(() => {
    cy.then(() => pdf.destroy());
    cy.then(() => port.terminate());
  });

  for (const worker of [true, false]) {
    it(`does not inherit a previous workerPort when worker is ${worker}`, () => {
      let options: FilePreviewerPdfProps;
      cy.then(() => {
        port = new Worker(workerSrc, { type: 'module' });
        options = { workerPort: port };
      });
      cy.mount(
        defineComponent({
          setup() {
            pdf = usePdfJs({
              src: () => '/worker-priority.pdf',
              pdfProps: () => ({ ...options, documentParams: { data: createTestPdf() } }),
              onStatus: () => {},
            });
            return () => h('span', { class: 'pdf-pages' }, String(pdf.numPages.value));
          },
        }),
      );
      cy.then(() => pdf.load());
      cy.get('.pdf-pages').should('have.text', '2');
      cy.then(() => pdf.destroy());
      cy.then(() => {
        cy.spy(port, 'postMessage').as('previousPort');
        options = { worker, workerSrc };
      });
      cy.then(() => pdf.load());
      cy.get('.pdf-pages').should('have.text', '2');
      cy.get('@previousPort').should('not.have.been.called');
    });
  }
});
