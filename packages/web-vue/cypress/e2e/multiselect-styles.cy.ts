describe('多选组件样式', () => {
  for (const framework of ['', '/react']) {
    for (const component of [
      'checkbox',
      'select',
      'cascader',
      'tree',
      'tree-select',
      'transfer',
      'table',
    ]) {
      it(`${framework || '/vue'} ${component} 多选框保持正方形`, () => {
        cy.visit(`${framework}/components/${component}/`);
        cy.get('.demo-block', { timeout: 60000 }).first().scrollIntoView();
        if (['select', 'cascader', 'tree-select'].includes(component)) {
          cy.get('.demo-block .sd-select-view-multiple', { timeout: 60000 })
            .first()
            .scrollIntoView()
            .click();
        }
        cy.get('.sd-checkbox-icon', { timeout: 60000 }).should(($icons) => {
          for (const icon of $icons) {
            const { width, height } = icon.getBoundingClientRect();
            if (!icon.getClientRects().length) continue;
            expect(width, 'checkbox width').to.equal(14);
            expect(height, 'checkbox height').to.equal(14);
          }
        });
      });
    }
  }
});
