describe('KaTeX 文档样式', () => {
  for (const prefix of ['', '/react']) {
    it(`${prefix || '/vue'} 的行内和块级公式加载官方样式及字体`, () => {
      cy.intercept({ resourceType: 'font' }, (request) => {
        expect(new URL(request.url).origin, '字体从站点本地加载').to.equal(
          new URL(Cypress.config('baseUrl')!).origin,
        );
      });
      cy.visit(`${prefix}/components/markdown-render/`);
      cy.get('[data-example="markdown-render/code"]').scrollIntoView();
      cy.contains('[data-example="markdown-render/code"] p', '设第', {
        timeout: 20000,
      }).scrollIntoView();
      cy.get('[data-example="markdown-render/code"] .katex', { timeout: 20000 })
        .should('have.length.at.least', 2)
        .first()
        .should('have.css', 'font-family')
        .and('contain', 'KaTeX_Main');
      cy.get('[data-example="markdown-render/code"] .katex-display .vlist')
        .first()
        .should('have.css', 'display', 'table-cell');
      cy.get('[data-example="markdown-render/code"] .katex .katex-strut')
        .first()
        .should('have.css', 'display', 'inline-block');
      cy.document().then(async (doc) => {
        const fonts = await doc.fonts.load('16px KaTeX_Main');
        expect(fonts.length, 'KaTeX 字体资源').to.be.greaterThan(0);
        expect(fonts.every((font) => font.status === 'loaded')).to.equal(true);
      });
    });
  }
});
